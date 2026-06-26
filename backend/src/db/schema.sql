CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  telefono VARCHAR(20),
  whatsapp VARCHAR(20) NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio_base DECIMAL(10,2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  imagen_url TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  producto_id UUID REFERENCES productos(id),
  estado VARCHAR(50) DEFAULT 'nueva',
  precio_final DECIMAL(10,2),
  ancho_cm INTEGER,
  alto_cm INTEGER,
  profundidad_cm INTEGER,
  color VARCHAR(100),
  acabado VARCHAR(100),
  notas_cliente TEXT,
  notas_admin TEXT,
  creado_en TIMESTAMP DEFAULT NOW(),
  respondido_en TIMESTAMP
);

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID REFERENCES cotizaciones(id),
  mp_payment_id VARCHAR(200),
  monto DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(10) DEFAULT 'PEN',
  estado VARCHAR(50) DEFAULT 'pendiente',
  metodo VARCHAR(50),
  pagado_en TIMESTAMP
);

CREATE TABLE archivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID REFERENCES cotizaciones(id),
  tipo VARCHAR(50),
  url TEXT NOT NULL,
  subido_en TIMESTAMP DEFAULT NOW()
);

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, categoria, descripcion, precio_base) VALUES
('Closet Moderno', 'Closets', 'Closet de melamina con puertas batientes y cajones.', 1200.00),
('Cocina Integral', 'Cocinas', 'Muebles altos y bajos para cocina con tablero postformado.', 3500.00),
('Escritorio Minimalista', 'Escritorios', 'Escritorio con diseño limpio y pasacables.', 450.00),
('Biblioteca Elegante', 'Bibliotecas', 'Estantes abiertos y cerrados para libros y decoración.', 850.00),
('Vestidor Abierto', 'Closets', 'Vestidor sin puertas con organizadores de zapatos.', 1500.00),
('Mueble de Baño Flotante', 'Baños', 'Mueble bajo lavabo resistente a la humedad.', 380.00);
