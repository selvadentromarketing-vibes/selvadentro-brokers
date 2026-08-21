-- =============================================================================
--  Selvadentro Brokers — V1 schema
--  Apply via: Supabase Dashboard → SQL Editor → paste + Run
--  Project:   oqvxpapestbxcwiybgzl.supabase.co  (SAME project as Referidos —
--             these tables live alongside affiliates/clicks/leads and reuse
--             the same anon key, so the site needs no new env vars.)
-- =============================================================================
--
-- DESIGN NOTES (mirrors db/schema.sql in the Referidos repo)
--   * Browser calls Postgres functions (RPC) via the anon publishable key.
--   * No direct table access from the client — all writes go through
--     SECURITY DEFINER functions that control exactly what is inserted.
--   * RLS is enabled on every table with NO policies → anon cannot touch
--     tables directly.
--   * Broker-referred clients arrive with ONLY: first name, last name,
--     last 4 digits of their phone, and city. No email / full phone —
--     the broker keeps ownership of the client's contact info, and no
--     sales automation can call or message the client directly.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ────────────────────────────────────────────────────────────────

CREATE TABLE brokers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT,
  agency          TEXT,                  -- inmobiliaria, or NULL for independents
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused')),
  ghl_contact_id  TEXT,                  -- populated post-signup by GHL workflow
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brokers_email ON brokers (email);

CREATE TABLE broker_clicks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id     UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  clicked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent    TEXT,
  referrer_url  TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_term      TEXT,
  utm_content   TEXT
);

CREATE INDEX idx_broker_clicks_broker_clicked ON broker_clicks (broker_id, clicked_at DESC);

CREATE TABLE broker_leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id       UUID REFERENCES brokers(id) ON DELETE SET NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT,
  phone_last4     TEXT NOT NULL CHECK (phone_last4 ~ '^[0-9]{4}$'),
  city            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'contacted', 'qualified', 'won', 'lost')),
  ghl_contact_id  TEXT,
  landing_page    TEXT,
  utm_source      TEXT,
  utm_campaign    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_broker_leads_broker ON broker_leads (broker_id);
CREATE INDEX idx_broker_leads_status ON broker_leads (status);

-- ─── CODE GENERATOR ────────────────────────────────────────────────────────
-- Produces a slug like "carlos-a4f8" from the broker's first name +
-- a random 4-char hex suffix. Retries up to 10 times on collision.

CREATE OR REPLACE FUNCTION generate_broker_code(p_first_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  attempt   INT := 0;
BEGIN
  base_slug := lower(regexp_replace(coalesce(p_first_name, 'broker'), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN
    base_slug := 'broker';
  END IF;

  LOOP
    candidate := base_slug || '-' || substring(md5(random()::text || clock_timestamp()::text), 1, 4);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM brokers WHERE code = candidate);
    attempt := attempt + 1;
    IF attempt > 10 THEN
      RAISE EXCEPTION 'Unable to generate unique broker code after 10 attempts';
    END IF;
  END LOOP;

  RETURN candidate;
END;
$$;

-- ─── RPC FUNCTIONS (browser-callable via supabase.rpc) ─────────────────────

CREATE OR REPLACE FUNCTION create_broker(
  p_first_name TEXT,
  p_last_name  TEXT,
  p_agency     TEXT,
  p_email      TEXT,
  p_phone      TEXT
) RETURNS TABLE (id UUID, code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id   UUID;
  v_code TEXT;
BEGIN
  v_code := generate_broker_code(p_first_name);
  INSERT INTO brokers (first_name, last_name, agency, email, phone, code)
  VALUES (p_first_name, p_last_name, p_agency, p_email, p_phone, v_code)
  RETURNING brokers.id INTO v_id;
  RETURN QUERY SELECT v_id, v_code;
END;
$$;

CREATE OR REPLACE FUNCTION track_broker_click(
  p_code         TEXT,
  p_user_agent   TEXT,
  p_referrer_url TEXT,
  p_utm_source   TEXT,
  p_utm_medium   TEXT,
  p_utm_campaign TEXT,
  p_utm_term     TEXT,
  p_utm_content  TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_broker_id UUID;
BEGIN
  SELECT brokers.id INTO v_broker_id FROM brokers
  WHERE brokers.code = p_code AND brokers.status = 'active';
  IF v_broker_id IS NULL THEN
    RETURN;  -- unknown or paused broker code → silently ignore
  END IF;
  INSERT INTO broker_clicks (
    broker_id, user_agent, referrer_url,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content
  )
  VALUES (
    v_broker_id, p_user_agent, p_referrer_url,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content
  );
END;
$$;

-- Returns the referring broker's name / email / agency so the GHL payload
-- can carry them as referred_by_* custom fields (sales context at a glance).
CREATE OR REPLACE FUNCTION create_broker_lead(
  p_first_name   TEXT,
  p_last_name    TEXT,
  p_phone_last4  TEXT,
  p_city         TEXT,
  p_broker_code  TEXT,
  p_landing_page TEXT,
  p_utm_source   TEXT,
  p_utm_campaign TEXT
) RETURNS TABLE (
  id             UUID,
  broker_name    TEXT,
  broker_email   TEXT,
  broker_agency  TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_broker_id     UUID;
  v_lead_id       UUID;
  v_broker_name   TEXT;
  v_broker_email  TEXT;
  v_broker_agency TEXT;
BEGIN
  IF p_broker_code IS NOT NULL AND p_broker_code <> '' THEN
    SELECT b.id,
           trim(coalesce(b.first_name, '') || ' ' || coalesce(b.last_name, '')),
           b.email,
           b.agency
    INTO   v_broker_id, v_broker_name, v_broker_email, v_broker_agency
    FROM   brokers b
    WHERE  b.code = p_broker_code AND b.status = 'active';
  END IF;
  INSERT INTO broker_leads (
    first_name, last_name, phone_last4, city,
    broker_id, landing_page, utm_source, utm_campaign
  )
  VALUES (
    p_first_name, p_last_name, p_phone_last4, p_city,
    v_broker_id, p_landing_page, p_utm_source, p_utm_campaign
  )
  RETURNING broker_leads.id INTO v_lead_id;
  RETURN QUERY SELECT v_lead_id, v_broker_name, v_broker_email, v_broker_agency;
END;
$$;

-- ─── RLS — enable on all tables, NO policies (defense-in-depth) ───────────

ALTER TABLE brokers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_leads  ENABLE ROW LEVEL SECURITY;

-- ─── GRANTS — anon role gets ONLY the 3 RPC functions ─────────────────────

REVOKE ALL ON FUNCTION create_broker(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION track_broker_click(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_broker_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION create_broker(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_broker_click(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_broker_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- ─── ADMIN STATS VIEW ──────────────────────────────────────────────────────
-- Query in Supabase Table Editor or via service_role. NOT exposed to anon.

CREATE OR REPLACE VIEW broker_stats AS
SELECT
  b.id,
  b.code,
  b.first_name,
  b.last_name,
  b.agency,
  b.email,
  b.status,
  b.created_at,
  COALESCE(c.click_count, 0) AS click_count,
  COALESCE(l.lead_count, 0)  AS lead_count,
  COALESCE(l.won_count, 0)   AS won_count
FROM brokers b
LEFT JOIN (
  SELECT broker_id, COUNT(*) AS click_count
  FROM broker_clicks GROUP BY broker_id
) c ON c.broker_id = b.id
LEFT JOIN (
  SELECT broker_id,
         COUNT(*)                                     AS lead_count,
         COUNT(*) FILTER (WHERE broker_leads.status = 'won') AS won_count
  FROM broker_leads GROUP BY broker_id
) l ON l.broker_id = b.id;

-- =============================================================================
--  POST-APPLY VERIFICATION
--  After running, paste these in the SQL Editor to confirm everything works:
--
--    SELECT * FROM create_broker('Test', 'Broker', 'Agencia X', 'testbroker@example.com', '+5215551234567');
--    -- → returns { id: <uuid>, code: 'test-a3f8' }
--
--    SELECT * FROM create_broker_lead('Cliente', 'Prueba', '1234', 'CDMX', 'test-a3f8', 'https://brokers.selvadentrotulum.com/registro', NULL, NULL);
--    -- → returns { id, broker_name: 'Test Broker', ... }
--
--    SELECT * FROM broker_stats;
--
--    -- Cleanup:
--    DELETE FROM broker_leads WHERE first_name = 'Cliente' AND phone_last4 = '1234';
--    DELETE FROM brokers WHERE email = 'testbroker@example.com';
-- =============================================================================
