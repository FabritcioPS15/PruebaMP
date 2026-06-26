'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import axios from 'axios';
import { MdSecurity } from 'react-icons/md';
import { FiCheckCircle, FiBox, FiCreditCard } from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

type EstadoPago = 'idle' | 'procesando' | 'aprobado' | 'rechazado';

export default function PagarPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const cotizacionId = params.cotizacionId as string;
  const monto = parseFloat(searchParams.get('monto') || '100');
  const productoNombre = searchParams.get('producto') || 'Mueble a medida';

  const [brickReady, setBrickReady] = useState(false);
  const [estado, setEstado] = useState<EstadoPago>('idle');
  const [paymentId, setPaymentId] = useState('');
  const [cotizacion, setCotizacion] = useState<any>(null);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';
    if (pk) initMercadoPago(pk, { locale: 'es-PE' });

    if (cotizacionId) {
      axios.get(`${API_URL}/api/cotizaciones/${cotizacionId}`)
        .then(res => setCotizacion(res.data))
        .catch(err => console.error("Error cargando detalles:", err));
    }
  }, [cotizacionId]);

  const onSubmit = async ({ formData }: any) => {
    return new Promise<void>(async (resolve, reject) => {
      setEstado('procesando');
      try {
        const res = await axios.post(`${API_URL}/api/pagos/crear`, {
          token: formData.token,
          paymentMethodId: formData.payment_method_id,
          installments: formData.installments,
          issuerId: formData.issuer_id,
          payer: formData.payer,
          cotizacionId
        });

        if (res.data.success && res.data.status === 'approved') {
          setPaymentId(res.data.paymentId);
          setEstado('aprobado');
          resolve();
        } else {
          setEstado('rechazado');
          reject();
        }
      } catch (err: any) {
        console.error('Detalle error API:', err.response?.data || err.message);
        setEstado('rechazado');
        reject();
      }
    });
  };

  const onError = (error: any) => {
    console.error('Error Brick:', error);
  };

  if (estado === 'aprobado') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="text-center max-w-lg w-full bg-white/80 backdrop-blur-xl p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10">
          <div className="flex justify-center mb-8 relative">
             <div className="absolute inset-0 bg-green-100 rounded-full scale-150 blur-xl opacity-50 animate-pulse"></div>
             <FiCheckCircle className="text-[5.5rem] text-green-500 drop-shadow-md relative z-10" />
          </div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-slate-900">¡Compra Exitosa!</h1>
          <p className="text-slate-500 text-sm mb-8">Tu transacción se completó de forma segura.</p>
          
          <div className="bg-slate-50/80 rounded-3xl p-6 mb-10 border border-slate-100 shadow-sm text-left">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 text-center">Ticket de Compra</h3>
            
            <div className="space-y-3 text-sm text-slate-600 mb-5">
              <div className="flex justify-between items-start gap-4">
                <span>Producto:</span>
                <span className="font-semibold text-slate-900 text-right">{cotizacion?.producto?.nombre || productoNombre}</span>
              </div>
              {(cotizacion?.ancho_cm || cotizacion?.alto_cm) && (
                <div className="flex justify-between items-start gap-4">
                  <span>Medidas:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {cotizacion.ancho_cm} x {cotizacion.alto_cm} x {cotizacion.profundidad_cm} cm
                  </span>
                </div>
              )}
              {cotizacion?.color && (
                <div className="flex justify-between items-start gap-4">
                  <span>Color:</span>
                  <span className="font-semibold text-slate-900 text-right">{cotizacion.color}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Pagado:</span>
              <span className="font-extrabold text-2xl text-slate-900">S/ {monto.toFixed(2)}</span>
            </div>
            
            <div className="mt-5 pt-3 border-t border-slate-200 border-dashed flex flex-col items-center text-[10px] text-slate-400 font-mono">
              <span className="uppercase tracking-widest mb-1">ID Transacción</span>
              <span className="font-bold text-slate-500">{paymentId}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-2xl text-slate-600 font-semibold border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all w-full sm:w-auto" onClick={() => window.print()}>
              Guardar Recibo
            </button>
            <a href="/productos"
              className="px-8 py-4 rounded-2xl text-white font-bold transition-all hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 bg-slate-900 hover:bg-black w-full sm:w-auto text-center flex items-center justify-center gap-2">
              Volver al catálogo <span className="text-xl">→</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header Minimalista */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">M</div>
            <span className="font-semibold text-lg tracking-tight">MelaminaPro</span>
          </div>
          <a href="/productos" className="text-slate-500 hover:text-black text-sm font-medium transition-colors">Cancelar pago</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left: Resumen Premium */}
          <div className="lg:w-[38%] space-y-6">
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-6 tracking-tight">Resumen de compra</h2>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                  <FiBox className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 leading-snug">{productoNombre}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">Mueble a medida personalizado</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 mb-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-medium">Total a pagar</p>
                    <p className="text-4xl font-extrabold tracking-tight text-slate-900">S/ <span>{monto.toFixed(2)}</span></p>
                  </div>
                  <span className="text-slate-500 text-xs font-medium pb-1">PEN</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-start gap-3">
                <MdSecurity className="text-green-600 text-2xl shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-900 font-semibold text-sm">Pago seguro garantizado</p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Tus datos están protegidos por encriptación de grado bancario de Mercado Pago.</p>
                </div>
              </div>
            </div>

            {/* Datos de prueba discretos */}
            <div className="bg-slate-100 rounded-3xl p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <FiCreditCard className="text-slate-500 text-lg" />
                <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">Modo Prueba (Test)</p>
              </div>
              <div className="space-y-3 text-slate-600 text-sm font-mono bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center"><span className="text-slate-400">Tarjeta</span> <span className="font-semibold text-slate-800">5031 7557 3453 0604</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Vence</span> <span className="font-semibold text-slate-800">11/25</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">CVV</span> <span className="font-semibold text-slate-800">123</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Nombre</span> <span className="font-semibold text-slate-800">APRO</span></div>
              </div>
            </div>
          </div>

          {/* Right: Payment Brick Integrado */}
          <div className="lg:flex-1 w-full">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[500px]">

              {/* Loader overlay */}
              {estado === 'procesando' && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-black rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-900 font-medium animate-pulse">Procesando pago de forma segura...</p>
                </div>
              )}

              {estado === 'rechazado' && (
                <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <p className="text-red-800 text-sm font-medium">El pago fue rechazado. Por favor intenta con otra tarjeta.</p>
                </div>
              )}

              <div className="p-8 lg:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Detalles de pago</h2>
                  <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                        <MdSecurity className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-700 text-[11px] font-bold uppercase tracking-wider">Seguro</span>
                      </div>
                  </div>
                </div>
                
                <Payment
                  key={cotizacionId}
                  initialization={{ amount: monto }}
                  customization={{
                    paymentMethods: {
                      creditCard: 'all',
                      debitCard: 'all',
                    },
                    visual: {
                      style: {
                        theme: 'flat',
                        customVariables: {
                          baseColor: '#0f172a', /* slate-900 */
                          formBackgroundColor: '#ffffff',
                          borderRadiusMedium: '16px',
                        },
                      },
                    },
                  }}
                  onSubmit={onSubmit}
                  onReady={() => setBrickReady(true)}
                  onError={onError}
                />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
