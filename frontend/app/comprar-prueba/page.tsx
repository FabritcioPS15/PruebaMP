'use client';

import { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import axios from 'axios';
import {
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiArrowRight,
  FiShield,
  FiLoader,
  FiAlertTriangle,
  FiInfo,
  FiCreditCard,
  FiPackage,
  FiLock,
} from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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
      setResultado({ ok: false, msg: error.response?.data?.error || 'Error al crear la orden' });
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
          setResultado({ ok: true, msg: 'Pago aprobado exitosamente.', paymentId: res.data.paymentId });
          setPaso('resultado');
          resolve();
        } else {
          setResultado({ ok: false, msg: res.data.mensaje || 'El pago no fue completado.' });
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

  const pasos = [
    { num: 1, label: 'Seleccionar', id: 'seleccionar' },
    { num: 2, label: 'Pagar', id: 'pagar' },
    { num: 3, label: 'Confirmación', id: 'resultado' },
  ];

  const pasoActualIdx = pasos.findIndex(p => p.id === paso);

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">

      {/* Header */}
      <header className="bg-[#009ee3] shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#009ee3] font-bold text-xs">M</span>
            </div>
            <span className="text-white font-semibold text-sm">MelaminaPro</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-md px-2.5 py-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">Modo prueba</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
          {pasos.map((step, i) => {
            const done = pasoActualIdx > i;
            const active = pasoActualIdx === i;
            return (
              <div key={step.id} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                    ${active ? 'bg-[#009ee3] text-white' : done ? 'bg-[#00a650] text-white' : 'bg-gray-200 text-gray-400'}`}
                  >
                    {done ? <FiCheckCircle className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span className={`text-xs sm:text-sm hidden sm:block transition-colors
                    ${active ? 'text-[#009ee3] font-medium' : done ? 'text-[#00a650]' : 'text-gray-400'}`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < pasos.length - 1 && (
                  <div className="w-6 sm:w-12 h-px bg-gray-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── PASO 1: Seleccionar ── */}
        {paso === 'seleccionar' && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight">Selecciona un producto</h1>
              <p className="text-gray-500 text-sm mt-1">Elige el mueble para realizar el pago de prueba</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <FiLoader className="w-8 h-8 text-[#009ee3] animate-spin" />
                <p className="text-gray-400 text-sm">Cargando productos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productos.map(p => (
                  <button
                    key={p.id}
                    onClick={() => generarOrden(p)}
                    disabled={creando}
                    className="group bg-white border border-gray-200 hover:border-[#009ee3] rounded-xl text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait overflow-hidden"
                  >
                    <div className="relative w-full h-40 overflow-hidden">
                      <img
                        src={getImage(p.categoria)}
                        alt={p.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <span className="absolute top-3 left-3 text-xs font-medium text-white bg-[#009ee3] px-2.5 py-1 rounded-md">
                        {p.categoria}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-gray-800 font-semibold text-sm leading-snug mb-1">{p.nombre}</h3>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">{p.descripcion}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-gray-400 text-xs">Precio base</p>
                          <p className="text-gray-800 font-bold text-base">S/ {p.precio_base.toFixed(2)}</p>
                        </div>
                        <div className="w-8 h-8 bg-[#009ee3] group-hover:bg-[#0080bb] rounded-lg flex items-center justify-center transition-colors">
                          <FiArrowRight className="text-white w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {creando && (
              <div className="mt-5 flex items-center justify-center gap-2.5 py-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                <FiLoader className="w-4 h-4 text-[#009ee3] animate-spin" />
                <p className="text-blue-700 text-sm">Generando orden...</p>
              </div>
            )}
          </div>
        )}

        {/* ── PASO 2: Pagar ── */}
        {paso === 'pagar' && productoSeleccionado && (
          <div className="flex flex-col lg:flex-row gap-5 items-start">

            {/* Panel izquierdo - resumen */}
            <div className="w-full lg:w-[340px] space-y-3 lg:sticky lg:top-20">

              {/* Card producto */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="relative w-full h-36">
                  <img
                    src={getImage(productoSeleccionado.categoria)}
                    alt={productoSeleccionado.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                    <p className="text-white/60 text-xs">{productoSeleccionado.categoria}</p>
                    <p className="text-white font-semibold text-sm">{productoSeleccionado.nombre}</p>
                  </div>
                </div>
                <div className="bg-[#009ee3] px-4 py-3.5">
                  <p className="text-white/70 text-xs font-medium mb-0.5">Total a pagar</p>
                  <p className="text-white text-2xl font-bold">S/ {productoSeleccionado.precio_base.toFixed(2)}</p>
                  <p className="text-white/50 text-xs mt-0.5">Soles peruanos (PEN)</p>
                </div>
              </div>

              {/* Estado orden */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 flex items-center gap-3">
                <FiCheckCircle className="text-[#00a650] w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-green-800 text-sm font-medium">Orden registrada</p>
                  <p className="text-green-600 text-xs mt-0.5">Tu pedido fue creado correctamente</p>
                </div>
              </div>

              {/* Datos tarjeta prueba */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <FiCreditCard className="text-gray-400 w-3.5 h-3.5" />
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Tarjeta de prueba</p>
                </div>
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
                className="flex items-center gap-1.5 text-[#009ee3] hover:text-[#0080bb] text-sm transition-colors"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                Cambiar producto
              </button>
            </div>

            {/* Panel derecho - Brick */}
            <div className="w-full lg:flex-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-5 sm:px-6 pt-4 pb-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-gray-800 font-semibold text-sm">Datos de pago</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Completa la información de tu tarjeta</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#00a650]">
                    <FiLock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Pago seguro</span>
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
                  <FiShield className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400 text-xs">Procesado con</span>
                  <span className="text-[#009ee3] text-xs font-semibold">Mercado Pago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PASO 3: Resultado ── */}
        {paso === 'resultado' && resultado && (
          <div className="max-w-lg mx-auto w-full">

            {resultado.ok ? (
              /* Aprobado */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                <div className="bg-[#00a650] px-6 pt-8 pb-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-18 h-18 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <FiCheckCircle className="text-[#00a650] w-8 h-8" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" style={{ animationDuration: '2s', animationIterationCount: '2' } as any} />
                    </div>
                  </div>
                  <h1 className="text-white text-xl font-semibold mb-1">Pago acreditado</h1>
                  <p className="text-white/75 text-sm">Te notificaremos cuando el pedido sea confirmado</p>
                </div>

                {/* Ola decorativa */}
                <div className="bg-[#00a650] h-4 relative">
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-[50%]" />
                </div>

                <div className="px-6 pt-2 pb-5">

                  {/* Producto */}
                  <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getImage(productoSeleccionado?.categoria || '')}
                        alt={productoSeleccionado?.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-xs">{productoSeleccionado?.categoria}</p>
                      <p className="text-gray-800 font-medium text-sm truncate">{productoSeleccionado?.nombre}</p>
                      <p className="text-gray-400 text-xs">100 × 200 cm (ejemplo)</p>
                    </div>
                    <p className="text-gray-800 font-semibold text-sm flex-shrink-0">
                      S/ {productoSeleccionado?.precio_base?.toFixed(2)}
                    </p>
                  </div>

                  {/* Desglose */}
                  <div className="py-4 space-y-2.5 border-b border-gray-100 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-700">S/ {productoSeleccionado?.precio_base?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Envío e instalación</span>
                      <span className="text-[#00a650] font-medium">Incluido</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Medio de pago</span>
                      <span className="text-gray-700">Tarjeta</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="py-4 flex justify-between items-center border-b border-gray-100">
                    <span className="text-gray-800 font-semibold">Total</span>
                    <span className="text-gray-900 font-bold text-lg">S/ {productoSeleccionado?.precio_base?.toFixed(2)}</span>
                  </div>

                  {/* Nº operación */}
                  {resultado.paymentId && (
                    <div className="py-4 flex justify-between items-center border-b border-gray-100 text-sm">
                      <span className="text-gray-500">Nº de operación</span>
                      <span className="text-gray-600 font-mono">{resultado.paymentId}</span>
                    </div>
                  )}

                  {/* Estado */}
                  <div className="py-4 flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Estado</span>
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-[#00a650] text-xs font-semibold px-3 py-1 rounded-lg border border-green-200">
                      <FiCheckCircle className="w-3 h-3" />
                      Acreditado
                    </span>
                  </div>
                </div>

                {/* Aviso fabricación */}
                <div className="mx-6 mb-5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <FiInfo className="text-[#009ee3] w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Recibirás una confirmación por correo. El tiempo de fabricación e instalación es de{' '}
                    <strong>7 a 15 días hábiles</strong>.
                  </p>
                </div>

                {/* Botones */}
                <div className="px-6 pb-6 flex flex-col gap-2.5">
                  <button
                    onClick={resetear}
                    className="w-full bg-[#009ee3] hover:bg-[#0080bb] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
                  >
                    Comprar otro producto
                  </button>
                  <a
                    href="/"
                    className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors text-sm text-center"
                  >
                    Volver al inicio
                  </a>
                </div>

                <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-center gap-1.5">
                  <FiShield className="w-3 h-3 text-gray-300" />
                  <span className="text-gray-400 text-xs">Pago procesado con</span>
                  <span className="text-[#009ee3] text-xs font-semibold">Mercado Pago</span>
                </div>
              </div>

            ) : (
              /* Rechazado */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#f23d4f] px-6 pt-8 pb-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <FiXCircle className="text-[#f23d4f] w-8 h-8" />
                    </div>
                  </div>
                  <h1 className="text-white text-xl font-semibold mb-1">Pago no procesado</h1>
                  <p className="text-white/75 text-sm">{resultado.msg}</p>
                </div>

                <div className="bg-[#f23d4f] h-4 relative">
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-[50%]" />
                </div>

                <div className="px-6 pt-2 pb-5">
                  <div className="py-4 border-b border-gray-100">
                    <p className="text-gray-500 text-sm mb-3">Posibles causas:</p>
                    <ul className="space-y-2">
                      {[
                        'Fondos insuficientes en la cuenta',
                        'Datos de tarjeta incorrectos',
                        'Tarjeta vencida o bloqueada',
                      ].map(r => (
                        <li key={r} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="py-4 bg-amber-50 border border-amber-100 rounded-xl px-4 my-4 flex items-start gap-2.5">
                    <FiAlertTriangle className="text-amber-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Para aprobar el pago usa la tarjeta <strong>5031 7557 3453 0604</strong> con nombre titular <strong>APRO</strong>.
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-2.5">
                  <button
                    onClick={resetear}
                    className="w-full bg-[#009ee3] hover:bg-[#0080bb] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
                  >
                    Intentar nuevamente
                  </button>
                  <a
                    href="/"
                    className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors text-sm text-center"
                  >
                    Volver al inicio
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
