'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Copy,
  Eye,
  Loader2,
  Lock,
  LogOut,
  Search,
  Send,
  X,
} from 'lucide-react';
import { Cotizacion } from '@/lib/types';
import { estadosCotizacion } from '@/lib/data';
import { formatSoles } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminPage() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<Cotizacion | null>(null);
  const [precioInput, setPrecioInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

  useEffect(() => {
    const auth = localStorage.getItem('melaminapro_admin');
    if (auth === 'true') {
      setAutenticado(true);
    }
  }, []);

  useEffect(() => {
    if (!autenticado) return;
    fetchCotizaciones();
  }, [autenticado]);

  async function fetchCotizaciones() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cotizaciones`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCotizaciones(data);
    } catch {
      // Demo data
      setCotizaciones([
        {
          id: 'demo-1',
          nombre: 'María García',
          whatsapp: '987654321',
          email: 'maria@email.com',
          tipoMueble: 'Closet / Ropero',
          ancho: 200,
          alto: 240,
          profundidad: 60,
          colorMelamina: 'blanco',
          acabado: 'Normal',
          estado: 'nueva',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'demo-2',
          nombre: 'Carlos López',
          whatsapp: '912345678',
          tipoMueble: 'Cocina integral',
          ancho: 300,
          alto: 220,
          profundidad: 60,
          colorMelamina: 'nogal',
          acabado: 'Enchapado',
          estado: 'cotizada',
          precioFinal: 4500,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'demo-3',
          nombre: 'Ana Torres',
          whatsapp: '956789123',
          tipoMueble: 'Escritorio',
          ancho: 150,
          alto: 75,
          profundidad: 70,
          colorMelamina: 'gris',
          acabado: 'Laqueado',
          estado: 'aprobada',
          precioFinal: 1200,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAutenticado(true);
      localStorage.setItem('melaminapro_admin', 'true');
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setAutenticado(false);
    localStorage.removeItem('melaminapro_admin');
    router.push('/');
  };

  const filtradas = cotizaciones.filter((c) => {
    const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
    const term = busqueda.toLowerCase();
    const matchBusqueda =
      c.nombre.toLowerCase().includes(term) ||
      c.whatsapp.includes(term) ||
      c.tipoMueble.toLowerCase().includes(term);
    return matchEstado && matchBusqueda;
  });

  const getEstadoColor = (estado: string) => {
    return estadosCotizacion.find((e) => e.key === estado)?.color || 'bg-gray-100 text-gray-800';
  };

  const getEstadoLabel = (estado: string) => {
    return estadosCotizacion.find((e) => e.key === estado)?.label || estado;
  };

  const copiarLinkPago = (id: string) => {
    const url = `${window.location.origin}/pagar/${id}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const enviarCotizacion = async () => {
    if (!cotizacionSeleccionada || !precioInput) return;
    setEnviando(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cotizaciones/${cotizacionSeleccionada.id}/cotizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ precioFinal: Number(precioInput) }),
      });
      if (!res.ok) throw new Error();
      setCotizaciones((prev) =>
        prev.map((c) =>
          c.id === cotizacionSeleccionada.id ? { ...c, estado: 'cotizada', precioFinal: Number(precioInput) } : c
        )
      );
      setCotizacionSeleccionada(null);
      setPrecioInput('');
    } catch {
      alert('Error al enviar cotización');
    } finally {
      setEnviando(false);
    }
  };

  if (!autenticado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-full bg-[#1D6B48]/10 p-3">
              <Lock className="h-6 w-6 text-[#1D6B48]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Panel de administración</h1>
            <p className="mt-1 text-sm text-gray-500">Ingresa la contraseña para continuar</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={loginError ? 'border-red-500' : ''}
              />
              {loginError && <p className="mt-1 text-xs text-red-500">{loginError}</p>}
            </div>
            <Button type="submit" className="w-full bg-[#1D6B48] hover:bg-[#165536]">
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <h1 className="text-lg font-bold text-gray-900">MelaminaPro Admin</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600">
            <LogOut className="mr-2 h-4 w-4" /> Salir
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Filtros */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtroEstado === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroEstado('todos')}
              className={filtroEstado === 'todos' ? 'bg-[#1D6B48] hover:bg-[#165536]' : ''}
            >
              Todos
            </Button>
            {estadosCotizacion.map((e) => (
              <Button
                key={e.key}
                variant={filtroEstado === e.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroEstado(e.key)}
                className={filtroEstado === e.key ? 'bg-[#1D6B48] hover:bg-[#165536]' : ''}
              >
                {e.label}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#1D6B48]" />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="rounded-xl border bg-white py-20 text-center">
            <p className="text-gray-500">No hay cotizaciones</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Producto</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Medidas</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtradas.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{c.nombre}</div>
                        <div className="text-xs text-gray-500">{c.whatsapp}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{c.tipoMueble}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.ancho}x{c.alto}{c.profundidad ? `x${c.profundidad}` : ''} cm
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(c.createdAt).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getEstadoColor(c.estado)}`}>
                          {getEstadoLabel(c.estado)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCotizacionSeleccionada(c)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copiarLinkPago(c.id)}
                          >
                            {copiado ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal detalle */}
      <Dialog open={!!cotizacionSeleccionada} onOpenChange={() => setCotizacionSeleccionada(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de cotización</DialogTitle>
          </DialogHeader>
          {cotizacionSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Cliente</p>
                  <p className="font-medium">{cotizacionSeleccionada.nombre}</p>
                </div>
                <div>
                  <p className="text-gray-500">WhatsApp</p>
                  <p className="font-medium">{cotizacionSeleccionada.whatsapp}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{cotizacionSeleccionada.email || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tipo</p>
                  <p className="font-medium">{cotizacionSeleccionada.tipoMueble}</p>
                </div>
                <div>
                  <p className="text-gray-500">Medidas</p>
                  <p className="font-medium">
                    {cotizacionSeleccionada.ancho}x{cotizacionSeleccionada.alto}
                    {cotizacionSeleccionada.profundidad ? `x${cotizacionSeleccionada.profundidad}` : ''} cm
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Color</p>
                  <p className="font-medium capitalize">{cotizacionSeleccionada.colorMelamina}</p>
                </div>
                <div>
                  <p className="text-gray-500">Acabado</p>
                  <p className="font-medium">{cotizacionSeleccionada.acabado}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getEstadoColor(cotizacionSeleccionada.estado)}`}>
                    {getEstadoLabel(cotizacionSeleccionada.estado)}
                  </span>
                </div>
              </div>

              {cotizacionSeleccionada.descripcionAdicional && (
                <div>
                  <p className="text-gray-500">Descripción adicional</p>
                  <p className="text-sm text-gray-700">{cotizacionSeleccionada.descripcionAdicional}</p>
                </div>
              )}

              {cotizacionSeleccionada.precioFinal && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Precio cotizado</p>
                  <p className="text-lg font-bold text-[#1D6B48]">{formatSoles(cotizacionSeleccionada.precioFinal)}</p>
                </div>
              )}

              {/* Enviar precio */}
              {cotizacionSeleccionada.estado === 'nueva' && (
                <div className="space-y-2 rounded-lg border p-4">
                  <Label htmlFor="precio">Ingresar precio final (S/)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="precio"
                      type="number"
                      placeholder="2500"
                      value={precioInput}
                      onChange={(e) => setPrecioInput(e.target.value)}
                    />
                    <Button
                      onClick={enviarCotizacion}
                      disabled={enviando || !precioInput}
                      className="bg-[#1D6B48] hover:bg-[#165536]"
                    >
                      {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => copiarLinkPago(cotizacionSeleccionada.id)}
                >
                  {copiado ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copiado ? 'Copiado' : 'Link de pago'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(`https://wa.me/51${cotizacionSeleccionada.whatsapp}`, '_blank');
                  }}
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
