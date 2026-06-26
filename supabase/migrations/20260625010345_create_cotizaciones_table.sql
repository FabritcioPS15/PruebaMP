/*
# Create cotizaciones table

1. New Tables
- `cotizaciones`
  - `id` (uuid, primary key)
  - `nombre` (text, not null) - nombre del cliente
  - `whatsapp` (text, not null) - número de WhatsApp
  - `email` (text, nullable) - email del cliente
  - `tipo_mueble` (text, not null) - tipo de mueble solicitado
  - `ancho` (integer, not null) - ancho en cm
  - `alto` (integer, not null) - alto en cm
  - `profundidad` (integer, nullable) - profundidad en cm
  - `color_melamina` (text, not null) - color seleccionado
  - `acabado` (text, not null) - tipo de acabado
  - `descripcion_adicional` (text, nullable) - notas adicionales
  - `fotos` (text[], nullable) - URLs de fotos del ambiente
  - `estado` (text, not null, default 'nueva') - estado del pedido
  - `precio_final` (numeric, nullable) - precio cotizado
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `cotizaciones`
- Allow anonymous reads, inserts, and updates for public access (single-tenant furniture store)
*/

CREATE TABLE IF NOT EXISTS cotizaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  whatsapp text NOT NULL,
  email text,
  tipo_mueble text NOT NULL,
  ancho integer NOT NULL,
  alto integer NOT NULL,
  profundidad integer,
  color_melamina text NOT NULL,
  acabado text NOT NULL,
  descripcion_adicional text,
  fotos text[],
  estado text NOT NULL DEFAULT 'nueva',
  precio_final numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cotizaciones" ON cotizaciones;
CREATE POLICY "anon_select_cotizaciones" ON cotizaciones FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cotizaciones" ON cotizaciones;
CREATE POLICY "anon_insert_cotizaciones" ON cotizaciones FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cotizaciones" ON cotizaciones;
CREATE POLICY "anon_update_cotizaciones" ON cotizaciones FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cotizaciones" ON cotizaciones;
CREATE POLICY "anon_delete_cotizaciones" ON cotizaciones FOR DELETE
TO anon, authenticated USING (true);
