'use client';

import { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const CATEGORY_ICONS: Record<string, string> = {
  Closets: '🚪',
  Cocinas: '🍳',
  Escritorios: '💻',
  Bibliotecas: '📚',
  Baños: '🛁',
  default: '🪵',
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">M</div>
            <span className="text-slate-900 font-semibold tracking-tight">MelaminaPro</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 bg-slate-800 rounded-full animate-pulse"></span>
            <span className="text-slate-700 text-xs font-bold uppercase tracking-wider">Test Mode</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Page Title */}
        <div className="mb-12 text-center">
          <p className="text-slate-500 text-sm font-mono mb-3 tracking-widest uppercase">Entorno de pruebas · Mercado Pago</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Simulador de Pagos
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
            Elige un mueble del catálogo y ejecuta un pago de prueba completo, desde la orden hasta la confirmación.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[
            { num: 1, label: 'Elegir producto', id: 'seleccionar' },
            { num: 2, label: 'Pagar', id: 'pagar' },
            { num: 3, label: 'Resultado', id: 'resultado' },
          ].map((step, i, arr) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${paso === step.id ? 'bg-black text-white' : ['pagar', 'resultado'].includes(paso) && i === 0 ? 'bg-green-100 text-green-700 border border-green-200' : paso === 'resultado' && i === 1 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                  {(['pagar', 'resultado'].includes(paso) && i === 0) || (paso === 'resultado' && i === 1) ? '✓' : step.num}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${paso === step.id ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</span>
              </div>
              {i < arr.length - 1 && <div className="w-8 md:w-16 h-px bg-slate-200"></div>}
            </div>
          ))}
        </div>

        {/* ── PASO 1: Seleccionar ── */}
        {paso === 'seleccionar' && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm">Cargando productos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {productos.map(p => (
                  <button
                    key={p.id}
                    onClick={() => generarOrden(p)}
                    disabled={creando}
                    className="group relative bg-white border border-slate-200 hover:border-black rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 disabled:opacity-50 disabled:cursor-wait overflow-hidden"
                  >
                    <div className="text-5xl mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 leading-none">{CATEGORY_ICONS[p.categoria] || CATEGORY_ICONS.default}</div>

                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 bg-slate-100 px-2 py-0.5 rounded-full">{p.categoria}</span>

                    <h3 className="text-slate-900 font-semibold text-lg mb-2 leading-snug">{p.nombre}</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-2">{p.descripcion}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-slate-500 text-xs mb-0.5">Precio base</p>
                        <p className="text-2xl font-extrabold text-slate-900">S/ {p.precio_base.toFixed(2)}</p>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 group-hover:bg-black border border-slate-200 group-hover:border-black rounded-full flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-300">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {creando && (
              <div className="mt-8 flex items-center justify-center gap-3 py-4 bg-slate-100 border border-slate-200 rounded-2xl">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-black rounded-full animate-spin"></div>
                <p className="text-slate-700 font-medium text-sm">Generando orden de prueba en Supabase...</p>
              </div>
            )}
          </div>
        )}

        {/* ── PASO 2: Pagar ── */}
        {paso === 'pagar' && productoSeleccionado && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Columna izquierda */}
            <div className="lg:w-[38%] space-y-5">
              {/* Resumen producto */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-5xl leading-none">{CATEGORY_ICONS[productoSeleccionado.categoria] || CATEGORY_ICONS.default}</div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{productoSeleccionado.categoria}</span>
                    <h3 className="text-slate-900 font-semibold text-xl leading-snug mt-0.5">{productoSeleccionado.nombre}</h3>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1.5">Total a pagar</p>
                  <p className="text-4xl font-extrabold text-slate-900">S/ <span>{productoSeleccionado.precio_base.toFixed(2)}</span></p>
                  <p className="text-slate-500 text-xs mt-1">Soles peruanos (PEN)</p>
                </div>
              </div>

              {/* Orden lista (sin mostrar ID) */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-green-600 text-xl">✅</span>
                <div>
                  <p className="text-green-800 text-sm font-semibold">Orden lista para pagar</p>
                  <p className="text-green-600 text-xs mt-0.5">Tu pedido fue registrado correctamente</p>
                </div>
              </div>

              {/* Tarjeta de prueba */}
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">🧾 Tarjeta de prueba</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Número', value: '5031 7557 3453 0604' },
                    { label: 'Vencimiento', value: '11/25' },
                    { label: 'CVV', value: '123' },
                    { label: 'Nombre', value: 'APRO' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">{row.label}</span>
                      <span className="text-slate-800 text-sm font-mono font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={resetear}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition-colors group"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Cambiar producto
              </button>
            </div>

            {/* Columna derecha: Brick */}
            <div className="lg:flex-1 w-full">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Header premium */}
                <div className="px-8 pt-7 pb-6 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-slate-900 font-bold text-2xl tracking-tight">Detalles de pago</h2>
                      <p className="text-slate-500 text-sm mt-1">Completa los datos de tu tarjeta de forma segura</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        <span className="text-green-700 text-xs font-semibold">Pago seguro</span>
                      </div>
                      <p className="text-slate-400 text-xs">Por Mercado Pago</p>
                    </div>
                  </div>

                  {/* Monto destacado */}
                  <div className="mt-5 bg-slate-50 rounded-2xl px-5 py-4 flex items-center justify-between border border-slate-100">
                    <div>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total a cobrar</p>
                      <p className="text-3xl font-extrabold text-slate-900">S/ {productoSeleccionado.precio_base.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-xs mb-1">Producto</p>
                      <p className="text-slate-800 font-semibold text-sm">{productoSeleccionado.nombre}</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 pb-10">
                  <Payment
                    key={cotizacionId || 'mp-brick'}
                    initialization={{ amount: productoSeleccionado.precio_base }}
                    customization={{
                      paymentMethods: { creditCard: 'all', debitCard: 'all' },
                      visual: {
                        style: {
                          theme: 'flat',
                          customVariables: {
                            baseColor: '#0f172a',
                            formBackgroundColor: '#ffffff',
                            borderRadiusMedium: '16px',
                          },
                        },
                      },
                    }}
                    onSubmit={onSubmit}
                    onReady={() => { }}
                    onError={(e: any) => console.error('Error Brick:', e)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PASO 3: Resultado ── */}
        {paso === 'resultado' && resultado && (
          <div className="max-w-lg mx-auto w-full bg-white/80 backdrop-blur-xl p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden">
            <div className="flex justify-center mb-8 relative">
              <div className={`absolute inset-0 rounded-full scale-150 blur-xl opacity-50 animate-pulse ${resultado.ok ? 'bg-green-100' : 'bg-red-100'}`}></div>
              {resultado.ok ? (
                <FiCheckCircle className="text-[5.5rem] text-green-500 drop-shadow-md relative z-10" />
              ) : (
                <div className="text-[5.5rem] text-red-500 drop-shadow-md relative z-10">❌</div>
              )}
            </div>

            <h2 className={`text-4xl font-extrabold mb-2 tracking-tight ${resultado.ok ? 'text-slate-900' : 'text-red-600'}`}>
              {resultado.ok ? '¡Compra Exitosa!' : 'Prueba Rechazada'}
            </h2>

            <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
              {resultado.ok ? 'Tu transacción se completó de forma segura.' : resultado.msg}
            </p>

            {resultado.paymentId && (
              <div className="bg-slate-50/80 rounded-3xl p-6 mb-10 border border-slate-100 shadow-sm text-left">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 text-center">Ticket de Prueba</h3>

                <div className="space-y-3 text-sm text-slate-600 mb-5">
                  <div className="flex justify-between items-start gap-4">
                    <span>Producto:</span>
                    <span className="font-semibold text-slate-900 text-right">{productoSeleccionado?.nombre}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span>Medidas:</span>
                    <span className="font-semibold text-slate-900 text-right">100 x 200 x 50 cm (Ejemplo)</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total Pagado:</span>
                  <span className="font-extrabold text-2xl text-slate-900">S/ {productoSeleccionado?.precio_base?.toFixed(2)}</span>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 border-dashed flex flex-col items-center text-[10px] text-slate-400 font-mono">
                  <span className="uppercase tracking-widest mb-1">ID Transacción</span>
                  <span className="font-bold text-slate-500">{resultado.paymentId}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={resetear} className="px-8 py-4 rounded-2xl text-white font-bold transition-all hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 bg-slate-900 hover:bg-black w-full sm:w-auto text-center flex items-center justify-center gap-2">
                Probar otro <span className="text-xl">→</span>
              </button>
              <a href="/productos" className="px-8 py-4 rounded-2xl text-slate-600 font-semibold border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all w-full sm:w-auto text-center">
                Ver catálogo
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
