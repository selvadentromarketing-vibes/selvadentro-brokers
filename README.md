# Selvadentro Brokers

Sistema de registro y tracking para el canal de brokers de Selvadentro Tulum,
replicando la arquitectura del [programa de Referidos](https://github.com/selvadentromarketing-vibes/Referidos).

**Dominio:** https://brokers.selvadentrotulum.com

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Registro de brokers. El broker se registra y recibe **su link personal** al instante (en pantalla + por correo vía GHL). |
| `/registro?ref=<código>` | Landing de registro de clientes — el link personal de cada broker. El cliente (o el broker en su nombre) se registra con **nombre, correo, últimos 4 dígitos del teléfono y ciudad**. El registro queda atribuido al broker del código. |
| `/evento-25-junio/` | La página estática del evento "7 Red Flags de una Preventa" con Carlos Otero (25 de junio), que antes vivía en la raíz del sitio. Los links viejos al evento siguen funcionando ahí. |

## Arquitectura (idéntica a Referidos)

1. **Supabase** (mismo proyecto que Referidos — un solo proyecto en plan gratuito — pero
   con **datos 100% aislados**: los brokers tienen sus propias tablas `brokers`,
   `broker_clicks`, `broker_leads`, sin ninguna relación con las tablas de referidos, y
   sus propias funciones RPC `SECURITY DEFINER` que solo pueden escribir en esas tablas;
   la separación la garantiza la base de datos, no una convención).
   Ver las notas de aislamiento en [`db/brokers-schema.sql`](db/brokers-schema.sql).
2. **GoHighLevel** recibe una copia vía *inbound webhook workflows* para las comunicaciones
   humanas (correo de bienvenida al broker, pipelines de Charlie). Si el webhook falla o no
   está configurado, el dato ya quedó en Supabase.
3. **Clicks** al link del broker se registran solo en Supabase (no ensucian contactos en GHL).

Punto clave del diseño: **el teléfono completo del cliente nunca se pide** — lo conserva
el broker, que sigue siendo su punto de contacto. En GHL, el tag `broker-client` es lo que
mantiene a las automatizaciones de ventas lejos de estos contactos (problemas #1 y #2 de
Coordinación de Brokers).

## Setup (pasos pendientes de una sola vez)

1. **Supabase** — pegar y correr [`db/brokers-schema.sql`](db/brokers-schema.sql) en el
   SQL Editor del proyecto de Referidos (crea las tablas y funciones de brokers,
   totalmente aparte de las de referidos). Verificación al final del archivo.
2. **Netlify** — el repo dejó de ser HTML plano; `netlify.toml` ya declara
   `npm run build` → `dist`. Configurar las env vars `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` (mismos valores que el sitio de Referidos, ver `.env.example`).
3. **GoHighLevel** — los 2 workflows de inbound webhook (`BROKER_SIGNUP` y `BROKER_LEAD`)
   ya existen y sus URLs están conectadas en `src/utils/webhook.ts`. Falta terminar de
   configurar sus acciones y publicarlos, y aplicar el blindaje de las automatizaciones de
   ventas — todo en [`docs/PLAN-GHL-BROKERS.md`](docs/PLAN-GHL-BROKERS.md).

Mientras esas acciones no estén publicadas, el sitio funciona igual (todo queda en
Supabase); solo faltará el correo de bienvenida y el contacto/oportunidad en GHL.

## Desarrollo

```bash
npm install
cp .env.example .env   # y llenar la anon key
npm run dev            # http://localhost:5173
npm run typecheck
npm run build
```

## Herramientas

- [`tools/generate-broker-links.py`](tools/generate-broker-links.py) — genera el link
  personal de los brokers que **ya existen en el CRM** y se lo guarda en su ficha, sin
  pasar por el formulario ni por el workflow de bienvenida (no crea oportunidades, no
  manda correos, no toca tags). Corre en simulacro por defecto; `--apply` para escribir.
  Necesita `GHL_API_KEY` en el entorno. Se usó el 26-ago-2026 para los 97 brokers con
  correo de la base; los 11 sin correo los lista al final.

## Documentos

- [`docs/PLAN-GHL-BROKERS.md`](docs/PLAN-GHL-BROKERS.md) — plan de acción para los 4
  problemas de Coordinación de Brokers (registro sin automatizaciones, link por broker,
  pipeline propio, campaña de rescate) con los hallazgos de la auditoría del CRM.
- [`db/brokers-schema.sql`](db/brokers-schema.sql) — esquema de base de datos.
