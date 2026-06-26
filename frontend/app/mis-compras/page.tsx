'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const CATEGORY_IMAGES: Record<string, string> = {
  Closets:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
  Cocinas:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format',
  Escritorios: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop&auto=format',
  Bibliotecas: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format',
  Baños:       'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop&auto=format',
  default:     'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&auto=format',
};

interface CompraItem {
  id: string;
  monto: number;
  estado: string;
  metodo: string;
  pagado_en: string;
  mp_payment_id: string;
  cotizacion: {
    id: string;
    ancho_cm: number;
    alto_cm: number;
    producto: { nombre: string; categoria: string; descripcion: string };
    cliente: { nombre: string; email: string };
  };
}

function formatFecha(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MisComprasPage() {
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/pagos/recientes`)
      .then(r => setCompras(r.data))
      .catch(() => setError('No se pudo cargar el historial de compras.'))
      .finally(() => setLoading(false));
  }, []);

  const getImg = (categoria?: string) =>
    CATEGORY_IMAGES[categoria || ''] || CATEGORY_IMAGES.default;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header azul MP */}
      <header className="bg-[#009ee3] shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/70 hover:text-white transition-colors text-sm">← Inicio</Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold text-sm">Mis compras</span>
          </div>
          <Link
            href="/comprar-prueba"
            className="bg-white text-[#009ee3] font-bold text-xs px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
          >
            + Nueva compra
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mis compras</h1>
          <p className="text-gray-500 text-sm mt-1">Historial de pagos procesados exitosamente</p>
        </div>

        {/* Estados */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#009ee3] rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Cargando historial...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-[#009ee3] text-sm font-semibold hover:underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && compras.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-gray-700 font-semibold text-lg mb-2">Aún no hay compras</h2>
            <p className="text-gray-400 text-sm mb-6">Cuando realices un pago exitoso aparecerá aquí.</p>
            <Link
              href="/comprar-prueba"
              className="inline-block bg-[#009ee3] hover:bg-[#0080bb] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Hacer mi primera compra
            </Link>
          </div>
        )}

        {/* Lista de compras */}
        {!loading && compras.length > 0 && (
          <div className="space-y-4">
            {compras.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Mobile: vertical · Desktop: horizontal */}
                <div className="flex flex-col sm:flex-row">
                  {/* Imagen del producto */}
                  <div className="relative w-full sm:w-36 h-40 sm:h-auto flex-shrink-0">
                    <img
                      src={getImg(c.cotizacion?.producto?.categoria)}
                      alt={c.cotizacion?.producto?.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/40 to-transparent" />
                    {/* Badge estado */}
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#00a650] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      Acreditado
                    </span>
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#009ee3] text-xs font-semibold uppercase tracking-wider mb-0.5">
                          {c.cotizacion?.producto?.categoria}
                        </p>
                        <h3 className="text-gray-800 font-bold text-base leading-snug mb-1">
                          {c.cotizacion?.producto?.nombre || 'Mueble a medida'}
                        </h3>
                        {c.cotizacion?.ancho_cm && (
                          <p className="text-gray-400 text-xs">
                            Medidas: {c.cotizacion.ancho_cm} × {c.cotizacion.alto_cm} cm
                          </p>
                        )}
                        <p className="text-gray-400 text-xs mt-0.5">
                          Comprado por: <span className="text-gray-600 font-medium">{c.cotizacion?.cliente?.nombre}</span>
                        </p>
                      </div>

                      {/* Monto */}
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-gray-400 text-xs mb-0.5">Total pagado</p>
                        <p className="text-gray-900 font-extrabold text-xl">S/ {Number(c.monto).toFixed(2)}</p>
                        <p className="text-gray-400 text-xs mt-0.5 capitalize">{c.metodo}</p>
                      </div>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="text-gray-400 text-xs">
                          📅 {formatFecha(c.pagado_en)}
                        </p>
                        <p className="text-gray-400 text-xs font-mono">
                          Nº operación: <span className="text-gray-600">{c.mp_payment_id}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-[#f0fdf4] text-[#00a650] text-xs font-bold px-3 py-1.5 rounded-full border border-[#bbf7d0]">
                          ✓ Pago confirmado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        {!loading && compras.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              Mostrando los últimos {compras.length} pagos procesados · Powered by{' '}
              <span className="text-[#009ee3] font-semibold">Mercado Pago</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
