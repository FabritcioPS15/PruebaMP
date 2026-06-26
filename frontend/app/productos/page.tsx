'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const CATEGORY_ICONS: Record<string, string> = {
  Closets: '🚪',
  Cocinas: '🍳',
  Escritorios: '💻',
  Bibliotecas: '📚',
  Baños: '🛁',
  default: '🪵'
};

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio_base: number;
  imagen_url?: string;
}

interface FormData {
  nombre: string;
  whatsapp: string;
  email: string;
  anchoCm: string;
  altoCm: string;
  profundidadCm: string;
  color: string;
  notasCliente: string;
}

export default function ProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    nombre: '', whatsapp: '', email: '',
    anchoCm: '', altoCm: '', profundidadCm: '',
    color: '', notasCliente: ''
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/productos`)
      .then(r => setProductos(r.data))
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, []);

  const abrirModal = (producto: Producto) => {
    setSelectedProduct(producto);
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const aplicarMedida = (ancho: string, alto: string, fondo: string) => {
    setForm(prev => ({ ...prev, anchoCm: ancho, altoCm: alto, profundidadCm: fondo }));
  };

  const handleComprar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/api/cotizaciones`, {
        nombre: form.nombre,
        whatsapp: form.whatsapp,
        email: form.email,
        productoId: selectedProduct.id,
        anchoCm: form.anchoCm ? parseInt(form.anchoCm) : null,
        altoCm: form.altoCm ? parseInt(form.altoCm) : null,
        profundidadCm: form.profundidadCm ? parseInt(form.profundidadCm) : null,
        color: form.color,
        notasCliente: form.notasCliente
      });
      const cotizacionId = res.data.id;

      await axios.patch(`${API_URL}/api/cotizaciones/${cotizacionId}`, {
        precioFinal: selectedProduct.precio_base
      }, {
        headers: { 'X-Admin-Key': 'mi-clave-secreta-admin' }
      });

      router.push(`/pagar/${cotizacionId}?monto=${selectedProduct.precio_base}&producto=${encodeURIComponent(selectedProduct.nombre)}`);
    } catch (err: any) {
      alert('Error al procesar: ' + (err.response?.data?.error || err.message));
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">M</div>
             <span className="font-semibold text-lg tracking-tight">MelaminaPro</span>
          </div>
          <span className="text-slate-400 text-sm font-medium">Catálogo Exclusivo</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-3 block">Diseño a Medida</span>
          <h2 className="text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Muebles perfectos,<br/>
            para espacios <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">únicos.</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Explora nuestro catálogo premium. Selecciona el diseño base, personaliza tus medidas al milímetro y coordina la fabricación directamente.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-medium">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Image / Icon Area */}
                <div className="h-56 bg-slate-50 flex items-center justify-center relative overflow-hidden group-hover:bg-blue-50/50 transition-colors">
                  <span className="text-8xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    {CATEGORY_ICONS[p.categoria] || CATEGORY_ICONS.default}
                  </span>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                    {p.categoria}
                  </div>
                </div>

                <div className="p-6 lg:p-8 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">{p.nombre}</h3>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed flex-1">{p.descripcion}</p>

                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Precio base</p>
                      <p className="text-2xl font-extrabold text-slate-900">
                        S/ {p.precio_base.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => abrirModal(p)}
                      className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal / Formulario */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header del Modal */}
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-1 block">Personalizar Pedido</span>
                <h3 className="font-bold text-2xl text-slate-900">{selectedProduct.nombre}</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleComprar} className="p-8 overflow-y-auto">
              
              <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl mb-8 text-sm flex gap-3 border border-blue-100">
                <span className="text-xl">💡</span>
                <p>Completa este formulario con las dimensiones y detalles deseados. <strong>El precio final base es de S/ {selectedProduct.precio_base.toFixed(2)}</strong>.</p>
              </div>

              <div className="space-y-8">
                {/* Sección: Datos Personales */}
                <div>
                  <h4 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-xs flex items-center justify-center">1</span> 
                    Tus Datos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 text-sm font-medium mb-2">Nombre completo <span className="text-red-500">*</span></label>
                      <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej. Juan Pérez"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-2">WhatsApp <span className="text-red-500">*</span></label>
                      <input name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="999 999 999"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-2">Correo electrónico</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="juan@correo.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Sección: Personalización */}
                <div>
                  <h4 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-xs flex items-center justify-center">2</span> 
                    Especificaciones del Mueble
                  </h4>
                  
                  {/* Quick Sizes */}
                  <div className="mb-6">
                    <label className="block text-slate-700 text-sm font-medium mb-3">Medidas Preestablecidas Rápidas</label>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => aplicarMedida('60', '180', '40')} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all shadow-sm">Estándar (60x180x40)</button>
                      <button type="button" onClick={() => aplicarMedida('120', '200', '50')} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all shadow-sm">Grande (120x200x50)</button>
                      <button type="button" onClick={() => aplicarMedida('40', '60', '30')} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all shadow-sm">Pequeño (40x60x30)</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-2">Ancho (cm)</label>
                      <input name="anchoCm" type="number" value={form.anchoCm} onChange={handleChange} placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-2">Alto (cm)</label>
                      <input name="altoCm" type="number" value={form.altoCm} onChange={handleChange} placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-2">Fondo (cm)</label>
                      <input name="profundidadCm" type="number" value={form.profundidadCm} onChange={handleChange} placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-slate-700 text-sm font-medium mb-2">Color o Textura de Melamina</label>
                    <input name="color" value={form.color} onChange={handleChange} placeholder="Ej: Blanco, Duna, Wengué, Ceniza..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-2">Notas adicionales</label>
                    <textarea name="notasCliente" value={form.notasCliente} onChange={handleChange} rows={3} placeholder="Menciona algún detalle especial (ej. tiradores negros, bisagras cierre lento...)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer del formulario */}
              <div className="mt-10 flex gap-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-6 py-4 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Procesando...</>
                  ) : (
                    <>Ir al Checkout <span className="opacity-50">→</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
