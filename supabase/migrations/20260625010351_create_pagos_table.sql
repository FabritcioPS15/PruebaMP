/*
# Create pagos table

1. New Tables
- `pagos`
  - `id` (uuid, primary key)
  - `cotizacion_id` (uuid, not null, references cotizaciones)
  - `monto` (numeric, not null)
  - `metodo` (text, not null) - tarjeta, yape, plin, transferencia
  - `estado` (text, not null, default 'pendiente')
  - `culqi_token` (text, nullable)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `pagos`
- Allow anonymous CRUD for public access
*/

CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id uuid NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  monto numeric NOT NULL,
  metodo text NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente',
  culqi_token text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pagos" ON pagos;
CREATE POLICY "anon_select_pagos" ON pagos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pagos" ON pagos;
CREATE POLICY "anon_insert_pagos" ON pagos FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pagos" ON pagos;
CREATE POLICY "anon_update_pagos" ON pagos FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pagos" ON pagos;
CREATE POLICY "anon_delete_pagos" ON pagos FOR DELETE
TO anon, authenticated USING (true);
