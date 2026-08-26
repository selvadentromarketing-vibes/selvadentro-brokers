#!/usr/bin/env python3
"""
Genera el link personal de los brokers que ya existen en el CRM y se lo guarda
en su ficha, sin pasar por el formulario web.

Se usó el 26-ago-2026 para pre-cargar el link de los 97 brokers con correo, de
modo que la campaña de reactivación pudiera mandar {{contact.referral_link}}
directo en vez de pedirles registrarse. Queda aquí para volver a correrlo
cuando entren brokers nuevos a la base o cuando se complete el correo de los
que hoy no lo tienen.

Qué hace por cada contacto con tag `broker`:
  1. pide el código a Supabase (RPC create_broker; si ya existía, get_broker_link)
  2. escribe `Affiliate Code` y `Referral Link` en su ficha de GHL

Qué NO hace, a propósito:
  - no pasa por el workflow BROKER_SIGNUP → no crea oportunidades, no mueve
    etapas y no manda correo de bienvenida a nadie
  - no toca tags. En particular no pone `broker-signup-web`: ese tag es la
    métrica de quién se activó por la web, y pre-cargarlo la ensuciaría

Uso:
    export GHL_API_KEY=pit-...
    python3 tools/generate-broker-links.py            # simulacro, no escribe
    python3 tools/generate-broker-links.py --apply    # escribe en CRM/Supabase
    python3 tools/generate-broker-links.py --apply --limit 5   # lote de prueba

Nota: usa `curl` por debajo a propósito — en el sandbox de Claude Code el
proxy de salida solo lo respetan las herramientas que leen HTTPS_PROXY, y
urllib se va a 403.
"""

import argparse
import json
import os
import subprocess
import sys
import time

# Públicos por diseño: la publishable key viaja en el bundle del navegador.
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://oqvxpapestbxcwiybgzl.supabase.co")
SUPABASE_KEY = os.environ.get(
    "SUPABASE_ANON_KEY", "sb_publishable_Pa1YKuwGgo9xMtx23fGk2Q_r29v_jIJ"
)
GHL_URL = "https://services.leadconnectorhq.com"
LOCATION_ID = os.environ.get("GHL_LOCATION_ID", "crN2IhAuOBAl7D8324yI")

# IDs de los custom fields en la subcuenta Selvadentro Tulum.
FIELD_CODE = "DLR6sbqRx2dvDclKe50I"  # Affiliate Code
FIELD_LINK = "cdYixl5TJYipcfA4lCwB"  # Referral Link

LINK_BASE = "https://brokers.selvadentrotulum.com/registro?ref="
BROKER_TAG = "broker"


def request(method, url, payload, headers, timeout=60):
    """Un request HTTP vía curl. Devuelve (status, json|texto|None)."""
    cmd = ["curl", "-sS", "-X", method, url, "-w", "\n%{http_code}"]
    for key, value in headers.items():
        cmd += ["-H", f"{key}: {value}"]
    if payload is not None:
        cmd += ["-d", json.dumps(payload)]
    raw = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout).stdout
    body, _, status = raw.rpartition("\n")
    try:
        parsed = json.loads(body) if body.strip() else None
    except ValueError:
        parsed = body[:200]
    return int(status or 0), parsed


def first_row(result):
    """Las RPC de Supabase devuelven lista o dict según la función."""
    if isinstance(result, list):
        return result[0] if result else None
    return result


def fetch_brokers(ghl_headers):
    """Todos los contactos con tag `broker`, paginando con searchAfter."""
    contacts, cursor = [], None
    while True:
        body = {
            "locationId": LOCATION_ID,
            "pageLimit": 100,
            "filters": [{"field": "tags", "operator": "eq", "value": BROKER_TAG}],
        }
        if cursor:
            body["searchAfter"] = cursor
        status, data = request("POST", f"{GHL_URL}/contacts/search", body, ghl_headers)
        if status != 200 or not data:
            sys.exit(f"No se pudo leer contactos del CRM (HTTP {status}): {data}")
        page = data.get("contacts", [])
        if not page:
            break
        contacts += page
        cursor = page[-1].get("searchAfter")
        if not cursor:
            break
    return contacts


def existing_link(contact):
    for field in contact.get("customFields") or []:
        if field.get("id") == FIELD_LINK and str(field.get("value") or "").strip():
            return field["value"]
    return None


def get_code(email, first, last, phone, supabase_headers):
    """Código del broker: lo crea, o recupera el que ya tenía."""
    status, data = request(
        "POST",
        f"{SUPABASE_URL}/rest/v1/rpc/create_broker",
        {
            "p_first_name": first,
            "p_last_name": last or None,
            "p_agency": None,
            "p_email": email,
            "p_phone": phone or "",
        },
        supabase_headers,
    )
    row = first_row(data) if status == 200 else None
    if row and row.get("code"):
        return row["code"], "nuevo"

    status, data = request(
        "POST",
        f"{SUPABASE_URL}/rest/v1/rpc/get_broker_link",
        {"p_email": email},
        supabase_headers,
    )
    row = first_row(data) if status == 200 else None
    if row and row.get("code"):
        return row["code"], "ya tenía"
    return None, None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="escribir de verdad")
    parser.add_argument("--limit", type=int, help="procesar solo los primeros N")
    parser.add_argument(
        "--force", action="store_true", help="regenerar aunque ya tengan link"
    )
    args = parser.parse_args()

    api_key = os.environ.get("GHL_API_KEY")
    if not api_key:
        sys.exit("Falta GHL_API_KEY (la private integration key de la subcuenta).")

    ghl_headers = {
        "Authorization": f"Bearer {api_key}",
        "Version": "2021-07-28",
        "Content-Type": "application/json",
    }
    supabase_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

    contacts = fetch_brokers(ghl_headers)
    sin_correo = [c for c in contacts if not (c.get("email") or "").strip()]
    pendientes = [
        c
        for c in contacts
        if (c.get("email") or "").strip() and (args.force or not existing_link(c))
    ]
    ya_tenian = len(contacts) - len(sin_correo) - len(pendientes)

    if args.limit:
        pendientes = pendientes[: args.limit]

    print(f"contactos con tag `{BROKER_TAG}`: {len(contacts)}")
    print(f"  ya tienen link en el CRM: {ya_tenian}")
    print(f"  sin correo (no se les puede generar): {len(sin_correo)}")
    print(f"  por procesar ahora: {len(pendientes)}")
    if not args.apply:
        print("\n[simulacro] nada se escribe. Corre con --apply para hacerlo.\n")

    ok = err = 0
    for contact in pendientes:
        name = (contact.get("contactName") or contact.get("firstName") or "").strip()
        first = (contact.get("firstName") or name.split(" ")[0] or "Broker").strip()
        last = (contact.get("lastName") or "").strip()
        email = contact["email"].strip()

        if not args.apply:
            print(f"  · {name[:30]:30s} {email}")
            continue

        code, origin = get_code(
            email, first, last, contact.get("phone") or "", supabase_headers
        )
        if not code:
            print(f"  ✗ {name[:30]:30s} sin código en Supabase")
            err += 1
            continue

        link = LINK_BASE + code
        status, _ = request(
            "PUT",
            f"{GHL_URL}/contacts/{contact['id']}",
            {
                "customFields": [
                    {"id": FIELD_CODE, "value": code},
                    {"id": FIELD_LINK, "value": link},
                ]
            },
            ghl_headers,
        )
        if status in (200, 201):
            print(f"  ✓ {name[:30]:30s} {code:18s} ({origin})")
            ok += 1
        else:
            print(f"  ✗ {name[:30]:30s} {code:18s} CRM respondió {status}")
            err += 1
        time.sleep(0.3)

    if args.apply:
        print(f"\nlinks escritos: {ok} · errores: {err}")
    if sin_correo:
        print(f"\nbrokers sin correo ({len(sin_correo)}) — hay que pedírselos o que se")
        print("registren solos en https://brokers.selvadentrotulum.com:")
        for contact in sin_correo:
            phone = contact.get("phone") or "sin teléfono"
            print(f"  · {(contact.get('contactName') or '?')[:30]:30s} {phone}")


if __name__ == "__main__":
    main()
