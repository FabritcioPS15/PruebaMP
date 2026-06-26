'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  FiShoppingBag,
  FiArrowLeft,
  FiPlus,
  FiCalendar,
  FiHash,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiMaximize2,
  FiUser,
} from 'react-icons/fi';

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
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
    <div className="min-h-screen bg-[#f5f5f5] font-sans">

      {/* Header */}
      <header className="bg-[#009ee3] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              Inicio
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white text-sm font-medium">Mis compras</span>
          </div>
          <Link
            href="/comprar-prueba"
            className="flex items-center gap-1.5 bg-white text-[#009ee3] font-semibold text-xs px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiPlus className="w-3.5 h-3.5" />
            Nueva compra
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight">Mis compras</h1>
          <p className="text-gray-500 text-sm mt-1">Historial de pagos procesados exitosamente</p>
        </div>

        {/* Cargando */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#009ee3] rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Cargando historial...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
            <FiAlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-1 text-[#009ee3] text-xs hover:underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && compras.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-gray-700 font-semibold text-base mb-1">Sin compras registradas</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Cuando realices un pago exitoso, aparecerá aquí.
            </p>
            <Link
              href="/comprar-prueba"
              className="inline-flex items-center gap-2 bg-[#009ee3] hover:bg-[#0080bb] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              <FiShoppingBag className="w-4 h-4" />
              Realizar primera compra
            </Link>
          </div>
        )}

        {/* Lista de compras */}
        {!loading && compras.length > 0 && (
          <div className="space-y-3">
            {compras.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">

                  {/* Imagen */}
                  <div className="relative w-full sm:w-32 h-36 sm:h-auto flex-shrink-0">
                    <img
                      src={getImg(c.cotizacion?.producto?.categoria)}
                      alt={c.cotizacion?.producto?.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/50 to-transparent" />
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 bg-[#00a650] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      <FiCheckCircle className="w-2.5 h-2.5" />
                      Acreditado
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                      {/* Info producto */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[#009ee3] text-xs font-medium uppercase tracking-wide mb-0.5">
                          {c.cotizacion?.producto?.categoria}
                        </p>
                        <h3 className="text-gray-800 font-semibold text-sm leading-snug mb-2">
                          {c.cotizacion?.producto?.nombre || 'Mueble a medida'}
                        </h3>

                        <div className="flex flex-col gap-1">
                          {c.cotizacion?.ancho_cm && (
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                              <FiMaximize2 className="w-3 h-3 flex-shrink-0" />
                              {c.cotizacion.ancho_cm} × {c.cotizacion.alto_cm} cm
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                            <FiUser className="w-3 h-3 flex-shrink-0" />
                            {c.cotizacion?.cliente?.nombre}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                            <FiCreditCard className="w-3 h-3 flex-shrink-0" />
                            <span className="capitalize">{c.metodo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Monto */}
                      <div className="sm:text-right flex-shrink-0">
                        <p className="text-gray-400 text-xs mb-0.5">Total pagado</p>
                        <p className="text-gray-900 font-bold text-lg">S/ {Number(c.monto).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Footer de la card */}
                    <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <FiCalendar className="w-3 h-3 flex-shrink-0" />
                          {formatFecha(c.pagado_en)}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-mono">
                          <FiHash className="w-3 h-3 flex-shrink-0" />
                          <span className="text-gray-500">{c.mp_payment_id}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 bg-[#f0fdf4] text-[#00a650] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#bbf7d0]">
                        <FiCheckCircle className="w-3 h-3" />
                        Pago confirmado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pie de página */}
        {!loading && compras.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              {compras.length} {compras.length === 1 ? 'pago registrado' : 'pagos registrados'} · Procesado con{' '}
              <span className="text-[#009ee3] font-medium">Mercado Pago</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
