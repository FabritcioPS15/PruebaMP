'use client';

import { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Imágenes reales de Unsplash por categoría
const CATEGORY_IMAGES: Record<string, string> = {
  Closets:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format',
  Cocinas:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&auto=format',
  Escritorios: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop&auto=format',
  Bibliotecas: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&auto=format',
  Baños:       'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop&auto=format',
  default:     'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop&auto=format',
};

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio_base: number;
}

type Paso = 'seleccionar' | 'pagar' | 'resultado';

export default function PagoPruebaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cotizacionId, setCotizacionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [paso, setPaso] = useState<Paso>('seleccionar');
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string; paymentId?: string } | null>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';
    if (pk) initMercadoPago(pk, { locale: 'es-PE' });

    axios.get(`${API_URL}/api/productos`)
      .then(r => setProductos(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const generarOrden = async (producto: Producto) => {
    setProductoSeleccionado(producto);
    setCreando(true);
    try {
      const res = await axios.post(`${API_URL}/api/cotizaciones`, {
        nombre: 'Cliente Prueba MP',
        whatsapp: '999999999',
        email: 'test_user_123@testuser.com',
        productoId: producto.id,
        anchoCm: 100,
        altoCm: 200,
        notasCliente: `Prueba: ${producto.nombre}`,
      });
      const id = res.data.id;
      await axios.patch(`${API_URL}/api/cotizaciones/${id}`, { precioFinal: producto.precio_base }, {
        headers: { 'X-Admin-Key': 'mi-clave-secreta-admin' },
      });
      setCotizacionId(id);
      setPaso('pagar');
    } catch (error: any) {
      setResultado({ ok: false, msg: error.response?.data?.error || 'Error creando la orden' });
      setPaso('resultado');
    }
    setCreando(false);
  };

  const onSubmit = async ({ formData }: any) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const res = await axios.post(`${API_URL}/api/pagos/crear`, {
          token: formData.token,
          paymentMethodId: formData.payment_method_id,
          installments: formData.installments,
          issuerId: formData.issuer_id,
          payer: formData.payer,
          cotizacionId,
        });
        if (res.data.success && res.data.status === 'approved') {
          setResultado({ ok: true, msg: '¡Pago aprobado exitosamente!', paymentId: res.data.paymentId });
          setPaso('resultado');
          resolve();
        } else {
          setResultado({ ok: false, msg: res.data.mensaje || 'El pago no fue completado' });
          setPaso('resultado');
          reject();
        }
      } catch (error: any) {
        setResultado({ ok: false, msg: error.response?.data?.error || error.message });
        setPaso('resultado');
        reject();
      }
    });
  };

  const resetear = () => {
    setPaso('seleccionar');
    setCotizacionId(null);
    setProductoSeleccionado(null);
    setResultado(null);
  };

  const getImage = (categoria: string) =>
    CATEGORY_IMAGES[categoria] || CATEGORY_IMAGES.default;

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">

      {/* Header estilo MP */}
      <header className="bg-[#009ee3] sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#009ee3] font-extrabold text-sm">M</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">MelaminaPro</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-white text-xs font-bold uppercase tracking-wider">Modo prueba</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
          {[
            { num: 1, label: 'Producto', id: 'seleccionar' },
            { num: 2, label: 'Pagar', id: 'pagar' },
            { num: 3, label: 'Confirmación', id: 'resultado' },
          ].map((step, i, arr) => (
            <div key={step.id} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${paso === step.id
                    ? 'bg-[#009ee3] text-white shadow shadow-blue-200'
                    : (['pagar', 'resultado'].includes(paso) && i === 0) || (paso === 'resultado' && i === 1)
                      ? 'bg-[#00a650] text-white'
                      : 'bg-gray-200 text-gray-400'}`}>
                  {(['pagar', 'resultado'].includes(paso) && i === 0) || (paso === 'resultado' && i === 1) ? '✓' : step.num}
                </div>
                <span className={`text-xs sm:text-sm font-medium hidden sm:block
                  ${paso === step.id ? 'text-[#009ee3] font-semibold' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && <div className="w-6 sm:w-12 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* ── PASO 1: Seleccionar ── */}
        {paso === 'seleccionar' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Elige tu mueble</h1>
              <p className="text-gray-500 text-sm sm:text-base">Selecciona el producto para proceder al pago de prueba</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#009ee3] rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Cargando productos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {productos.map(p => (
                  <button
                    key={p.id}
                    onClick={() => generarOrden(p)}
                    disabled={creando}
                    className="group bg-white border border-gray-200 hover:border-[#009ee3] rounded-2xl text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait overflow-hidden"
                  >
                    {/* Imagen del producto */}
                    <div className="relative w-full h-44 overflow-hidden">
                      <img
                        src={getImage(p.categoria)}
                        alt={p.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <span className="absolute top-3 left-3 inline-block text-xs font-semibold uppercase tracking-wider text-white bg-[#009ee3] px-2.5 py-1 rounded-full shadow">
                        {p.categoria}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="text-gray-800 font-semibold text-base mb-1 leading-snug">{p.nombre}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{p.descripcion}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-gray-400 text-xs mb-0.5">Precio base</p>
                          <p className="text-xl font-bold text-gray-800">S/ {p.precio_base.toFixed(2)}</p>
                        </div>
                        <div className="w-9 h-9 bg-[#009ee3] group-hover:bg-[#0080bb] rounded-full flex items-center justify-center text-white text-lg transition-colors">
                          →
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {creando && (
              <div className="mt-6 flex items-center justify-center gap-3 py-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-5 h-5 border-2 border-blue-200 border-t-[#009ee3] rounded-full animate-spin" />
                <p className="text-blue-700 font-medium text-sm">Generando orden...</p>
              </div>
            )}
          </div>
        )}

        {/* ── PASO 2: Pagar ── */}
        {paso === 'pagar' && productoSeleccionado && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Resumen */}
            <div className="w-full lg:w-[360px] space-y-4">
              {/* Card producto con imagen */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="relative w-full h-40">
                  <img
                    src={getImage(productoSeleccionado.categoria)}
                    alt={productoSeleccionado.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                    <p className="text-white/70 text-xs">{productoSeleccionado.categoria}</p>
                    <p className="text-white font-semibold text-sm leading-snug">{productoSeleccionado.nombre}</p>
                  </div>
                </div>
                <div className="bg-[#009ee3] px-5 py-4">
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-0.5">Total a pagar</p>
                  <p className="text-white text-3xl font-bold">S/ {productoSeleccionado.precio_base.toFixed(2)}</p>
                  <p className="text-white/60 text-xs mt-0.5">Soles peruanos (PEN)</p>
                </div>
              </div>

              {/* Estado orden */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 flex items-center gap-3">
                <span className="text-[#00a650] text-lg">✅</span>
                <div>
                  <p className="text-[#166534] text-sm font-semibold">Orden registrada</p>
                  <p className="text-[#15803d] text-xs mt-0.5">Tu pedido fue creado correctamente</p>
                </div>
              </div>

              {/* Tarjeta de prueba */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">🧾 Tarjeta de prueba</p>
                <div className="space-y-2">
                  {[
                    { label: 'Número', value: '5031 7557 3453 0604' },
                    { label: 'Vencimiento', value: '11/25' },
                    { label: 'CVV', value: '123' },
                    { label: 'Nombre titular', value: 'APRO' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">{row.label}</span>
                      <span className="text-gray-700 text-xs font-mono font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={resetear}
                className="flex items-center gap-1.5 text-[#009ee3] hover:text-[#0080bb] text-sm font-medium transition-colors"
              >
                ← Cambiar producto
              </button>
            </div>

            {/* Brick MP - look oficial */}
            <div className="w-full lg:flex-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-gray-800 font-semibold text-base">Datos de pago</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Completa tu información de forma segura</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#00a650]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#00a650] text-xs font-semibold">Pago seguro</span>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <Payment
                    key={cotizacionId || 'mp-brick'}
                    initialization={{ amount: productoSeleccionado.precio_base }}
                    customization={{
                      paymentMethods: { creditCard: 'all', debitCard: 'all' },
                      visual: {
                        style: { theme: 'default' },
                      },
                    }}
                    onSubmit={onSubmit}
                    onReady={() => { }}
                    onError={(e: any) => console.error('Error Brick:', e)}
                  />
                </div>
                <div className="px-5 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-center gap-1.5">
                  <span className="text-gray-400 text-xs">Procesado con</span>
                  <span className="text-[#009ee3] text-xs font-bold">Mercado Pago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PASO 3: Resultado ── */}
        {paso === 'resultado' && resultado && (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Header resultado con imagen de fondo */}
              <div className="relative">
                {productoSeleccionado && (
                  <img
                    src={getImage(productoSeleccionado.categoria)}
                    alt=""
                    className="w-full h-28 object-cover"
                  />
                )}
                <div className={`absolute inset-0 ${resultado.ok ? 'bg-[#00a650]/80' : 'bg-red-500/80'}`} />
                <div className="relative px-6 py-6 text-center">
                  <div className="flex justify-center mb-3">
                    {resultado.ok ? (
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <FiCheckCircle className="text-[#00a650] text-3xl" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-red-500 text-3xl">✕</div>
                    )}
                  </div>
                  <h2 className="text-white text-xl font-bold">
                    {resultado.ok ? '¡Pago aprobado!' : 'Pago rechazado'}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {resultado.ok ? 'Tu transacción fue procesada exitosamente.' : resultado.msg}
                  </p>
                </div>
              </div>

              {/* Detalle */}
              {resultado.paymentId && (
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 text-center">Detalle de la compra</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Producto</span>
                      <span className="text-gray-800 font-medium text-right max-w-[180px]">{productoSeleccionado?.nombre}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Medidas (ejemplo)</span>
                      <span className="text-gray-800 font-medium">100 × 200 cm</span>
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                      <span className="text-gray-800 font-semibold">Total pagado</span>
                      <span className="text-gray-900 font-bold text-lg">S/ {productoSeleccionado?.precio_base?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 rounded-lg px-4 py-2 text-center">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest">ID Transacción</p>
                    <p className="text-gray-600 text-xs font-mono font-semibold mt-0.5">{resultado.paymentId}</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetear}
                  className="flex-1 bg-[#009ee3] hover:bg-[#0080bb] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm text-center"
                >
                  Probar otro producto
                </button>
                <a
                  href="/catalogo"
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors text-sm text-center"
                >
                  Ver catálogo
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
