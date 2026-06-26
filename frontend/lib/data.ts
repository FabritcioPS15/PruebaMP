import { Producto } from './types';

export const productos: Producto[] = [
  {
    id: '1',
    slug: 'closet-ropero',
    nombre: 'Closet / Ropero',
    descripcion: 'Closet a medida con cajones, percheros, repisas y divisiones internas optimizadas para tu espacio.',
    descripcionCorta: 'Organización perfecta para tu dormitorio',
    precioDesde: 1200,
    categoria: 'dormitorio',
    imagen: '/placeholder-closet.jpg',
    destacado: true,
  },
  {
    id: '2',
    slug: 'cocina-integral',
    nombre: 'Cocina Integral',
    descripcion: 'Cocina integral completa con gabinetes superiores e inferiores, cajoneras y espacio para electrodomésticos.',
    descripcionCorta: 'La cocina de tus sueños, hecha realidad',
    precioDesde: 3500,
    categoria: 'cocina',
    imagen: '/placeholder-cocina.jpg',
    destacado: true,
  },
  {
    id: '3',
    slug: 'escritorio',
    nombre: 'Escritorio',
    descripcion: 'Escritorio ergonómico con cajones, repisas y gestión de cables para tu oficina en casa.',
    descripcionCorta: 'Productividad y estilo en tu espacio de trabajo',
    precioDesde: 800,
    categoria: 'oficina',
    imagen: '/placeholder-escritorio.jpg',
    destacado: true,
  },
  {
    id: '4',
    slug: 'biblioteca',
    nombre: 'Biblioteca',
    descripcion: 'Biblioteca a medida con repisas ajustables, espacio para libros, decoración y más.',
    descripcionCorta: 'Tus libros merecen un hogar especial',
    precioDesde: 1500,
    categoria: 'oficina',
    imagen: '/placeholder-biblioteca.jpg',
    destacado: true,
  },
  {
    id: '5',
    slug: 'vestidor',
    nombre: 'Vestidor',
    descripcion: 'Vestidor de lujo con isla central, iluminación LED, espejo de cuerpo completo y organizadores.',
    descripcionCorta: 'Lujo y organización en un solo espacio',
    precioDesde: 4500,
    categoria: 'dormitorio',
    imagen: '/placeholder-vestidor.jpg',
    destacado: true,
  },
  {
    id: '6',
    slug: 'mueble-bano',
    nombre: 'Mueble de Baño',
    descripcion: 'Mueble de baño con lavamanos, cajones y repisas. Resistente a la humedad con acabado especial.',
    descripcionCorta: 'Elegancia y funcionalidad para tu baño',
    precioDesde: 900,
    categoria: 'baño',
    imagen: '/placeholder-bano.jpg',
    destacado: true,
  },
];

export const coloresMelamina = [
  { id: 'hueso', nombre: 'Hueso', hex: '#F5F5DC' },
  { id: 'blanco', nombre: 'Blanco', hex: '#FFFFFF' },
  { id: 'negro', nombre: 'Negro', hex: '#1A1A1A' },
  { id: 'nogal', nombre: 'Nogal', hex: '#5D4037' },
  { id: 'wenge', nombre: 'Wengué', hex: '#3E2723' },
  { id: 'cedro', nombre: 'Cedro', hex: '#8D6E63' },
  { id: 'gris', nombre: 'Gris', hex: '#9E9E9E' },
];

export const acabados = ['Normal', 'Enchapado', 'Laqueado'];

export const tiposMueble = [
  'Closet / Ropero',
  'Cocina integral',
  'Escritorio',
  'Biblioteca',
  'Vestidor',
  'Mueble de baño',
  'Otro',
];

export const estadosCotizacion = [
  { key: 'nueva', label: 'Nueva', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'cotizada', label: 'Cotizada', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { key: 'aprobada', label: 'Aprobada', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { key: 'pagada', label: 'Pagada', color: 'bg-green-100 text-green-900 border-green-200' },
  { key: 'en_produccion', label: 'En producción', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { key: 'entregada', label: 'Entregada', color: 'bg-gray-100 text-gray-800 border-gray-200' },
] as const;
