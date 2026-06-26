export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  descripcionCorta: string;
  precioDesde: number;
  categoria: 'dormitorio' | 'cocina' | 'oficina' | 'baño';
  imagen: string;
  destacado: boolean;
}

export interface Cotizacion {
  id: string;
  nombre: string;
  whatsapp: string;
  email?: string;
  tipoMueble: string;
  ancho: number;
  alto: number;
  profundidad?: number;
  colorMelamina: string;
  acabado: string;
  descripcionAdicional?: string;
  fotos?: string[];
  estado: 'nueva' | 'cotizada' | 'aprobada' | 'pagada' | 'en_produccion' | 'entregada';
  precioFinal?: number;
  createdAt: string;
}

export interface Pago {
  id: string;
  cotizacionId: string;
  monto: number;
  metodo: 'tarjeta' | 'yape' | 'plin' | 'transferencia';
  estado: 'pendiente' | 'completado' | 'fallido';
  culqiToken?: string;
  createdAt: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  whatsapp: string;
  email?: string;
  createdAt: string;
}
