# Selvadentro Brokers

Sistema de registro y tracking para el canal de brokers de Selvadentro Tulum,
replicando la arquitectura del [programa de Referidos](https://github.com/selvadentromarketing-vibes/Referidos).

**Dominio:** https://brokers.selvadentrotulum.com

## Rutas

El sitio es bilingüe: español en la raíz e inglés bajo `/en`. Cada página tiene en el
encabezado un selector **ES | EN** que cambia de idioma con un clic y conserva el `?ref=`,
así que el cliente sigue atribuido a su broker aunque cambie de idioma.

| Ruta (español · inglés) | Qué es |
|---|---|
| `/` · `/en` | Registro de brokers. El broker se registra y recibe **su link personal** al instante (en pantalla + por correo vía GHL). El link sale en el idioma en que se registró. |
| `/registro?ref=<código>` · `/en/register?ref=<código>` | Landing de registro de clientes — el link personal de cada broker. El cliente (o el broker en su nombre) se registra con **nombre, correo, últimos 4 dígitos del teléfono y ciudad**. El registro queda atribuido al broker del código. |
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
4. **Keep-alive** — Supabase pausa los proyectos gratuitos tras una semana sin uso, y con el
   proyecto pausado todo registro falla sin quedar guardado en ningún lado (pasó en octubre
   de 2026). La función programada de Netlify
   [`netlify/functions/supabase-keepalive.mjs`](netlify/functions/supabase-keepalive.mjs)
   hace una consulta diaria que no escribe nada; si falla, aparece en los logs de
   Functions del sitio en Netlify.

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

**Versión en inglés:** los dos webhooks mandan `language` (`es` o `en`). Hasta que
`BROKER_SIGNUP` tenga su rama en inglés, el broker que se registra en `/en` recibe su link
en inglés en pantalla, pero el correo de bienvenida le llega en español — ver el pendiente
técnico 4 de [`docs/PLAN-GHL-BROKERS.md`](docs/PLAN-GHL-BROKERS.md).

## Desarrollo

```bash
npm install
cp .env.example .env   # y llenar la anon key
npm run dev            # http://localhost:5173
npm run typecheck
npm run build
```

Los textos de las páginas viven en `src/i18n/` (`brokerCopy.tsx`, `clientCopy.tsx`), con
español e inglés lado a lado: cualquier cambio de copy se hace ahí, en los dos idiomas.
Los meta tags de las vistas previas de links (WhatsApp, redes) están en `index.html` para
español y en `vite.config.ts` (`EN_HEAD`) para inglés.

## Documentos

- [`docs/PLAN-GHL-BROKERS.md`](docs/PLAN-GHL-BROKERS.md) — plan de acción para los 4
  problemas de Coordinación de Brokers (registro sin automatizaciones, link por broker,
  pipeline propio, campaña de rescate) con los hallazgos de la auditoría del CRM.
- [`db/brokers-schema.sql`](db/brokers-schema.sql) — esquema de base de datos.
