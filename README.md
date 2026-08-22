# Selvadentro Brokers

Sistema de registro y tracking para el canal de brokers de Selvadentro Tulum,
replicando la arquitectura del [programa de Referidos](https://github.com/selvadentromarketing-vibes/Referidos).

**Dominio:** https://brokers.selvadentrotulum.com

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Registro de brokers. El broker se registra y recibe **su link personal** al instante (en pantalla + por correo vía GHL). |
| `/registro?ref=<código>` | Landing de registro de clientes — el link personal de cada broker. El cliente (o el broker en su nombre) se registra con **nombre, últimos 4 dígitos del teléfono y ciudad**. El registro queda atribuido al broker del código. |
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

Punto clave del diseño: **el cliente del broker se registra sin correo y sin teléfono
completo**, así ninguna automatización de ventas puede contactarlo — la relación queda
protegida para el broker (este era el problema #1 y #2 de Coordinación de Brokers).

## Setup (pasos pendientes de una sola vez)

1. **Supabase** — pegar y correr [`db/brokers-schema.sql`](db/brokers-schema.sql) en el
   SQL Editor del proyecto de Referidos (crea las tablas y funciones de brokers,
   totalmente aparte de las de referidos). Verificación al final del archivo.
2. **Netlify** — el repo dejó de ser HTML plano; `netlify.toml` ya declara
   `npm run build` → `dist`. Configurar las env vars `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` (mismos valores que el sitio de Referidos, ver `.env.example`).
3. **GoHighLevel** — crear los 2 workflows de inbound webhook (`BROKER_SIGNUP` y
   `BROKER_LEAD`) siguiendo [`docs/PLAN-GHL-BROKERS.md`](docs/PLAN-GHL-BROKERS.md)
   y pegar las URLs generadas en `src/utils/webhook.ts`
   (`BROKER_SIGNUP_WEBHOOK_URL` / `BROKER_LEAD_WEBHOOK_URL`).

Mientras el paso 3 no esté hecho, el sitio funciona igual (todo queda en Supabase);
solo faltará el correo automático de bienvenida y la creación del contacto en GHL.

## Desarrollo

```bash
npm install
cp .env.example .env   # y llenar la anon key
npm run dev            # http://localhost:5173
npm run typecheck
npm run build
```

## Documentos

- [`docs/PLAN-GHL-BROKERS.md`](docs/PLAN-GHL-BROKERS.md) — plan de acción para los 4
  problemas de Coordinación de Brokers (registro sin automatizaciones, link por broker,
  pipeline propio, campaña de rescate) con los hallazgos de la auditoría del CRM.
- [`db/brokers-schema.sql`](db/brokers-schema.sql) — esquema de base de datos.
