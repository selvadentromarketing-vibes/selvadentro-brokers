-- =============================================================================
--  Recuperar el link de un broker que ya está registrado
--  Aplicar en: Supabase → SQL Editor → pegar → Run
--
--  Para qué: si un broker ya registrado vuelve a llenar el formulario, en vez
--  de mandarle un error, la página le muestra el link que ya tiene. Sin esto
--  la página sigue funcionando igual que hoy (muestra el mensaje de error),
--  así que se puede correr en cualquier momento.
-- =============================================================================

CREATE OR REPLACE FUNCTION get_broker_link(p_email TEXT)
RETURNS TABLE (code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT b.code
  FROM   brokers b
  WHERE  lower(b.email) = lower(trim(p_email))
    AND  b.status = 'active'
  LIMIT  1;
END;
$$;

REVOKE ALL ON FUNCTION get_broker_link(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_broker_link(TEXT) TO anon, authenticated;

-- =============================================================================
--  VERIFICACIÓN — debe devolver el código del broker:
--    SELECT * FROM get_broker_link('cancunjramos@gmail.com');
--  Un correo que no existe devuelve 0 filas (no es error).
-- =============================================================================
