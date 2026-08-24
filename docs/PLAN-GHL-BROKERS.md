# Plan de acción — Canal de Brokers en GoHighLevel

Documento de trabajo del canal de brokers. Problemas 1, 2 y 3 resueltos y verificados;
el 4 (reactivación) está en manos de la secuencia que escribió Charlie.
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

**Estado: RESUELTO y verificado** (24-ago-2026). Los dos workflows están publicados y
conectados en `src/utils/webhook.ts`:
`BROKER_SIGNUP` → `…/webhook-trigger/1701c3d9-fbe0-486f-a00a-abbee30c637e` ·
`BROKER_LEAD` → `…/webhook-trigger/6c3bdd09-3ee9-46ef-b7bf-3e670d64759f`

Prueba de punta a punta (3ª ronda, limpia): el broker entra a *Expansión y activación →
Broker Registrado* con su código y link, recibe el correo de bienvenida, y **no queda
asignado a ningún asesor de ventas**. El cliente entra a *Producción (B2B2C) → Registro
de cliente* asignado a Charlie, con atribución completa, **sin tareas de llamada y sin
que se le envíe ningún correo ni SMS**.

> **Ojo con el orden de las acciones — condición de carrera.** En las dos primeras
> rondas el cliente sí se coló al pipeline de ventas y le cayó tarea a un asesor, aunque
> el blindaje ya estaba puesto. Causa: el workflow creaba el contacto primero y ponía el
> tag después; en ese hueco el contacto no tenía tags y las automatizaciones de ventas ya
> habían disparado. **Los tags tienen que asignarse dentro de la misma acción de
> Create Contact**, no como paso posterior. Si algún día se vuelve a separar, el problema
> regresa de forma intermitente.

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
registrado queda atribuido al broker (`broker_leads`). El formulario pide **nombre, apellido, correo,
últimos 4 dígitos del teléfono y ciudad**. El teléfono completo nunca se pide — lo
conserva el broker, que sigue siendo el punto de contacto del cliente.

**Qué crear en GHL (una sola vez):** workflow **`BROKER_LEAD`**

1. Trigger: **Inbound Webhook** → URL a `BROKER_LEAD_WEBHOOK_URL` en `src/utils/webhook.ts`.
2. Acciones:
   - **Create Contact** con `first_name`, `last_name`, `email`, `city` (sin teléfono:
     solo se captura el last4 como campo personalizado).
   - **Update Custom Fields**: "Últimos 4 dígitos del teléfono de tu cliente"
     (`contact.ltimos_4_dgitos_de_su_telfono`) ← `phone_last4`;
     `referred_by_code` ← `referred_by`; `referred_by_name`; `referred_by_email`.
   - **Add Tag**: `broker-client`.
   - **Create Opportunity** en *Brokers - Producción (B2B2C)* → etapa *Registro de cliente*.
   - **Notificación interna** a Charlie (email o tarea), NUNCA al cliente.
3. Importante: el contacto **sí** trae correo, así que el tag `broker-client` y el
   blindaje del problema 1 son lo único que evita que las automatizaciones de ventas lo
   persigan. Haz ese paso antes de difundir los links.

## Problema 3 — Que Charlie pueda editar su propio pipeline

**Estado: RESUELTO** (24-ago-2026). Charlie Madrigal ya tiene rol **admin** en la
subcuenta (verificado por API) y edita sus pipelines desde *Settings → Pipelines*.

Riesgo abierto que hay que recordarle: los workflows de puntos (`Broker Points System - *`)
están amarrados a los **nombres actuales de las etapas**. Si renombra o mueve una etapa sin
avisar, los puntos dejan de asignarse en silencio.
## Problema 4 — Campaña de reactivación de la base dormida

**Charlie ya escribió la secuencia completa** (documento *"Plantillas Email Reactivación
para Ty · GHL"*, 21-ago-2026). Manda él, desde `charliemadrigal@selvadentrotulum.com`.
Esta sección resume lo acordado y sustituye la propuesta anterior de marketing.

### Audiencia y segmentos

Datos de la auditoría para calibrar: **108 contactos** con tag `broker`; **191
oportunidades** en *Expansión y activación*, de las cuales **129 siguen en "Registrado" o
"Contactado"** y **103 llevan 90+ días sin moverse**.

El documento de Charlie define la base como "brokers/agencias registrados últimos 3 meses"
— más chica que la base dormida completa. **Pendiente de decidir con él** si se arranca con
los recientes o con los 129.

| Segmento | Criterio | Tag |
|---|---|---|
| A — Calientes | Al menos 1 llamada/reunión registrada en el CRM | `broker_segmento_A` |
| B — Tibios | Abrió o clicó algún correo previo, sin llamada registrada | `broker_segmento_B` |
| C — Fríos | Sin actividad más allá del registro inicial | `broker_segmento_C` |

Marketing corre un workflow de clasificación antes de lanzar la secuencia.

### Secuencia (entrada: tag `broker_reactivacion_activo`)

| Toque | Día | Contenido | Condición |
|---|---|---|---|
| 1 | 0 | Avance de obra de Suspiro + video. Dos variantes: A (con interacción previa) y B/C | Todos |
| 2 | 3 | La comisión sin rodeos: **6%**, ticket promedio $1.4 MDP ≈ **$84,000 MXN** por operación + kit de venta | Solo si NO clicó nada del Toque 1 |
| 3 | 7 | Invitación al evento de brokers (recorrido + firma de alianzas en sitio) | Todos, salvo quien ya tenga `evento_confirmado` |

**En paralelo, fuera de la secuencia — comunicado de precio (prioritario):**

- **6a · Blast inmediato a toda la base.** El libramiento de Tulum es un hecho y el precio
  sube **+$3 USD/m² el 15 de septiembre**. Hasta el **14 de septiembre** se respeta
  $167 USD/m². En un lote de 700 m² son **$2,100 USD** de diferencia; en lotes grandes
  hasta $4,950 USD. Va como blast independiente: **no esperar al día 7 de la secuencia**.
- **6b · Recordatorio final** ~8-9 de septiembre a quien no haya clicado el cotizador de 6a.

Tags por comportamiento: clic en video/kit → `engagement_alto` (sale del Toque 2);
clic en RSVP → `evento_confirmado`; clic en cotizador → `cotizacion_precio_anterior`;
sin apertura en 7 días → `revisar_lista_fria` (limpieza manual, nunca borrado automático).

### Bloqueadores para activar

| Pendiente | De quién |
|---|---|
| Fecha, formato y cupo del evento (Toque 3 no sale sin esto) | Charlie |
| Monto del bono de primera venta, o quitar la línea condicional | Charlie |
| Alcance de la base: ¿últimos 3 meses o los 129? | Charlie |
| Capacidad de atención semanal, para escalonar envíos | Charlie |
| Links: video de obra, kit de venta, one-pager, cotizador, RSVP | Marketing |
| Verificar dominio de envío en GHL (ver abajo) | Marketing |
| Correr la clasificación A/B/C | Marketing |

### Integración con el sistema nuevo

El Toque 2 es el lugar natural para meter el **link personal de registro de clientes**:
ya se está hablando de comisión, y el link es justo lo que la protege. Pendiente de
confirmar con Charlie si se integra ahí o si va como toque aparte.

---

## Pendientes técnicos abiertos

**1. Oportunidades duplicadas — hay que resolverlo ANTES del blast.**
La subcuenta tiene `allowDuplicateOpportunity: true` (verificado por API). Como la mayoría
de los brokers de la campaña **ya tienen** oportunidad en *Expansión y activación*, cuando
se registren por el link el workflow `BROKER_SIGNUP` les va a crear una **segunda**
oportunidad y el tablero de Charlie se llena de duplicados. Arreglo: condición If/Else en
`BROKER_SIGNUP` que solo cree la oportunidad si el contacto no tiene ya una en ese pipeline.

**2. SPF no incluye a GoHighLevel.**
`selvadentrotulum.com` publica hoy:
`v=spf1 include:spf.protection.outlook.com include:selvadentrotulum.com.spf.auto.dnssmarthost.net -all`
— solo Outlook y un smarthost, en modo estricto (`-all`). DMARC existe pero en `p=none`.
Antes de un blast masivo desde `charliemadrigal@selvadentrotulum.com` hay que confirmar el
dominio de envío en *Settings → Email Services* de GHL; si no está verificado, buena parte
del envío se va a spam o rebota.

**3. Las oportunidades de broker se crean sin dueño.**
Las de cliente ya salen a nombre de Charlie; las de *Expansión y activación* quedan
"sin asignar". Cosmético, pero conviene emparejarlo.
