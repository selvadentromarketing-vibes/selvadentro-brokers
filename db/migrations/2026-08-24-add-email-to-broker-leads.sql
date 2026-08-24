-- =============================================================================
--  Migración — agregar email a broker_leads
--  Aplicar en: Supabase → SQL Editor → pegar todo → Run
--  Proyecto: oqvxpapestbxcwiybgzl
--
--  Necesaria porque el esquema de brokers se aplicó ANTES de que el formulario
--  de clientes pidiera correo. Es segura de correr aunque ya se haya corrido:
--  no borra datos y todo es idempotente.
-- =============================================================================

-- 1. La columna
ALTER TABLE broker_leads ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE broker_leads SET email = '' WHERE email IS NULL;
ALTER TABLE broker_leads ALTER COLUMN email SET NOT NULL;

-- 2. Fuera la función vieja (8 parámetros, sin email)
DROP FUNCTION IF EXISTS create_broker_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 3. La función nueva (9 parámetros, con email)
CREATE OR REPLACE FUNCTION create_broker_lead(
  p_first_name   TEXT,
  p_last_name    TEXT,
  p_email        TEXT,
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
    first_name, last_name, email, phone_last4, city,
    broker_id, landing_page, utm_source, utm_campaign
  )
  VALUES (
    p_first_name, p_last_name, p_email, p_phone_last4, p_city,
    v_broker_id, p_landing_page, p_utm_source, p_utm_campaign
  )
  RETURNING broker_leads.id INTO v_lead_id;
  RETURN QUERY SELECT v_lead_id, v_broker_name, v_broker_email, v_broker_agency;
END;
$$;

-- 4. Permisos para la firma nueva
REVOKE ALL ON FUNCTION create_broker_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_broker_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- =============================================================================
--  VERIFICACIÓN — corre esto después; debe devolver una fila con un id:
--
--    SELECT * FROM create_broker_lead(
--      'Prueba','Migracion','prueba@example.com','1234','Tulum',
--      NULL,'verificacion',NULL,NULL);
--
--  Limpieza:
--    DELETE FROM broker_leads WHERE first_name = 'Prueba' AND landing_page = 'verificacion';
-- =============================================================================
