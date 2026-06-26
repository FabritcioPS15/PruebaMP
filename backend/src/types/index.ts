export interface Cliente {
  id?: string;
  nombre: string;
  email?: string;
  telefono?: string;
  whatsapp: string;
  creado_en?: Date;
}

export interface Producto {
  id?: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  precio_base: number;
  activo?: boolean;
  imagen_url?: string;
  creado_en?: Date;
}

export interface Cotizacion {
  id?: string;
  cliente_id: string;
  producto_id?: string;
  estado?: string;
  precio_final?: number;
  ancho_cm?: number;
  alto_cm?: number;
  profundidad_cm?: number;
  color?: string;
  acabado?: string;
  notas_cliente?: string;
  notas_admin?: string;
  creado_en?: Date;
  respondido_en?: Date;
}

export interface Pago {
  id?: string;
  cotizacion_id: string;
  mp_payment_id?: string;
  monto: number;
  moneda?: string;
  estado?: string;
  metodo?: string;
  pagado_en?: Date;
}
