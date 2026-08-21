# Plan de acción — Canal de Brokers en GoHighLevel

Documento de trabajo para resolver los 4 problemas de Coordinación de Brokers (Charlie),
con los hallazgos de la auditoría del CRM (subcuenta **Selvadentro Tulum**,
location `crN2IhAuOBAl7D8324yI`, auditada el 21-ago-2026 vía API).

---

## Hallazgos de la auditoría

**Pipelines de brokers (ya existen):**

| Pipeline | ID | Oportunidades |
|---|---|---|
| Brokers - Expansión y activación | `OPC6nwWgpiiyZXNVMbsy` | **191** |
| Brokers - Producción (B2B2C) | `kUpSe35eaCzAfPGrjWXg` | **29** |

**Distribución en "Expansión y activación"** — el embudo está tapado arriba:

- Broker Contactado 💬: **89**
- Broker Registrado 👨🏾‍🦲: **40**
- Alianza Firmada ✍🏼: 13 · Presentación agendada: 12 · Solicitud de Documentos: 11 · Tour realizado: 10 · resto: 26

**Antigüedad (última actualización de la oportunidad):**

- ≤30 días: 32 · 31–60 días: 35 · 61–90 días: 21 · **más de 90 días: 103**

→ **129 brokers están estancados en las 2 primeras etapas** y **103 oportunidades llevan
3+ meses sin tocarse**. Esa es la base dormida para la campaña de rescate. Además hay
**108 contactos con tag `broker`**.

**Automatizaciones que hoy se disparan con contactos nuevos** (la causa del problema #1):

- `Auto asignación de contactos nuevos` (published)
- `0. New Lead, Call Route, Call Notification` (published)
- `1. Creación de oportunidad Seguimiento de Ventas` (published)
- `3. New Lead: Notificaciones` (published)

**Infraestructura reutilizable que ya existe** (creada para Referidos):

- Workflows de inbound webhook: `REFERRER_SIGNUP`, `REFERRAL_LEAD` — el molde a copiar.
- Custom fields: `contact.affiliate_code`, `contact.referral_link`,
  `contact.referred_by_code`, `contact.referred_by_name`, `contact.referred_by_email`.
- Custom field `contact.ltimos_4_dgitos_de_su_telfono`
  ("Últimos 4 dígitos del teléfono de tu cliente") — ya existía, se reutiliza tal cual.
- Tag `broker` + workflow `Tag broker + asignación a C. de Brokers + Creación de oportunidad` (published).
- Nurture de brokers ya construido: `PHASE 1 — Days 0–14 (Onboarding + Activation)`
  (published) y `PHASE 2 — Weeks 3–10 (Weekly nurture)` (**en draft**).

---

## Problema 1 — Registrar brokers sin disparar las automatizaciones de ventas

**Solución implementada:** la página `https://brokers.selvadentrotulum.com/` es ahora el
alta oficial de brokers. Entra por webhook (igual que Referidos), NO por el dashboard,
así que Diana/Mariano no reciben al broker como si fuera lead.

**Qué crear en GHL (una sola vez):** workflow **`BROKER_SIGNUP`**

1. Automation → Create Workflow → Start from scratch.
2. Trigger: **Inbound Webhook**. Copiar la URL generada y pegarla en
   `src/utils/webhook.ts` → `BROKER_SIGNUP_WEBHOOK_URL` (y hacer deploy).
3. Acciones (mismo orden que `REFERRER_SIGNUP`):
   - **Create/Update Contact** mapeando `first_name`, `last_name`, `email`, `phone`,
     `agency` → campo "Nombre de agencia inmobiliaria…".
   - **Add Tag**: `broker`, `broker-signup-web` (el tag `broker` ya dispara el workflow
     existente de asignación a Coordinación de Brokers).
   - **Update Custom Fields**: `affiliate_code` ← `broker_code`,
     `referral_link` ← `referral_link` del payload.
   - **Create Opportunity** en *Brokers - Expansión y activación* → etapa
     *Broker Registrado 👨🏾‍🦲*, asignada a Charlie.
   - **Send Email** de bienvenida con su link personal (`{{contact.referral_link}}`).
4. **Blindaje (hacer aunque no se cree nada más):** en los 4 workflows de ventas listados
   arriba, agregar un filtro/condición de salida temprana: **si el contacto tiene tag
   `broker` o `broker-client`, salir del workflow**. Con eso, aunque alguien dé de alta un
   broker a mano en el dashboard, la máquina de ventas ya no lo persigue.

## Problema 2 — Link de auto-registro de clientes por broker

**Solución implementada:** al registrarse, cada broker recibe
`https://brokers.selvadentrotulum.com/registro?ref=<su-código>`. El código se genera en
Supabase (`carlos-a4f8`), cada visita al link se registra (`broker_clicks`) y cada cliente
registrado queda atribuido al broker (`broker_leads`). El formulario pide exactamente lo
acordado: **nombre, apellido, últimos 4 dígitos del teléfono y ciudad** — sin correo ni
teléfono completo, para que nadie pueda contactar al cliente por fuera del broker.

**Qué crear en GHL (una sola vez):** workflow **`BROKER_LEAD`**

1. Trigger: **Inbound Webhook** → URL a `BROKER_LEAD_WEBHOOK_URL` en `src/utils/webhook.ts`.
2. Acciones:
   - **Create Contact** con `first_name`, `last_name`, `city` (el contacto NO tendrá email
     ni teléfono — es intencional; GHL lo permite desde workflow).
   - **Update Custom Fields**: "Últimos 4 dígitos del teléfono de tu cliente"
     (`contact.ltimos_4_dgitos_de_su_telfono`) ← `phone_last4`;
     `referred_by_code` ← `referred_by`; `referred_by_name`; `referred_by_email`.
   - **Add Tag**: `broker-client`.
   - **Create Opportunity** en *Brokers - Producción (B2B2C)* → etapa *Registro de cliente*.
   - **Notificación interna** a Charlie (email o tarea), NUNCA al cliente.
3. Importante: **no** agregar acciones de email/SMS al contacto — no tiene datos de
   contacto y no debe tenerlos.

## Problema 3 — Que Charlie pueda editar su propio pipeline

Sus dos pipelines ya existen (IDs arriba). Editar etapas de pipeline en GHL requiere
acceso de **Settings → Pipelines** en la subcuenta, que hoy Charlie no tiene.

Opciones (decisión del equipo, no requiere código):

1. **Recomendada:** en *Settings → My Staff → (Charlie) → Roles & Permissions*, subir su
   rol a **Admin** de la subcuenta. GHL no tiene permiso granular "solo pipelines", así
   que Admin es la única vía para autogestión total. Acordar con él la regla: solo toca
   los 2 pipelines de Brokers.
2. Si Admin es demasiado: mantenerlo como User y que Marketing aplique los cambios de
   etapas que él pida (SLA de 24-48 h). Los workflows de puntos
   (`Broker Points System - *`) referencian etapas actuales — al renombrar/mover etapas
   hay que revisar esos workflows, otro motivo para coordinar los cambios.

## Problema 4 — Campaña de rescate de la base dormida (antes del nurture)

Orden acordado: **1) rescate → 2) nurture continuo** (activar el `PHASE 2 — Weeks 3–10`
que ya está en draft, una vez que el rescate termine).

**Audiencia** (según auditoría): oportunidades en *Brokers - Expansión y activación* en
etapas *Broker Registrado* o *Broker Contactado* **con más de 60 días sin actividad**
(~124 brokers, de los cuales 103 llevan 90+ días). En GHL se arma con un Smart List:
tag `broker` + pipeline stage + "no activity in last 60 days".

**Gancho de la campaña:** no "hola, seguimos aquí", sino una novedad concreta — el nuevo
sistema de registro protegido: *"ahora registras a tus clientes con solo nombre, últimos
4 dígitos y ciudad — tu cartera nunca se expone"* + capacitaciones tipo la de Carlos Otero.

**Secuencia sugerida (3 toques, workflow nuevo `Brokers - Rescate 2026`):**

- **Día 0 · Email** — Asunto: *"¿Sigues vendiendo Tulum? Esto te cambia el juego"*.
  Cuerpo: reconocer el tiempo sin contacto, presentar el link personal de registro
  protegido, CTA: *"Genera tu link en 1 minuto"* → `https://brokers.selvadentrotulum.com/`.
- **Día 3 · WhatsApp/SMS** — corto: *"Hola {{contact.first_name}}, soy Charlie de
  Selvadentro. Lanzamos registro de clientes con protección total de tu cartera (solo
  nombre + últimos 4 dígitos). Te genero tu link personal? "* — respuesta directa a Charlie.
- **Día 7 · Email de cierre** — caso concreto: cómo funciona un registro, qué ve el
  broker, comisión protegida; CTA doble: generar link / agendar llamada de 15 min con
  Charlie. Quien no reaccione pasa al nurture largo (`PHASE 2`) y a la etapa que Charlie
  defina (p. ej. una etapa nueva "Dormido" si ya puede editar su pipeline).

**Medición:** los que generen link aparecen en Supabase (`broker_stats`: clicks, leads
por broker) y en GHL con tag `broker-signup-web` — esa es la métrica de reactivación.

> Nota técnica: los workflows no se pueden crear por API (la API v2 solo los lista),
> por eso estos pasos son en el dashboard. Todo lo demás (auditoría, custom fields,
> conteos) ya quedó verificado por API con la Private Integration Key.
