'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, Upload, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { coloresMelamina, acabados, tiposMueble, productos } from '@/lib/data';

function CotizarContent() {
  const searchParams = useSearchParams();
  const productoSlug = searchParams.get('producto');

  const [tipoMueble, setTipoMueble] = useState('');
  const [color, setColor] = useState('');
  const [acabado, setAcabado] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productoSlug) {
      const prod = productos.find((p) => p.slug === productoSlug);
      if (prod) {
        setTipoMueble(prod.nombre);
      }
    }
  }, [productoSlug]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      nombre: formData.get('nombre'),
      whatsapp: formData.get('whatsapp'),
      email: formData.get('email') || '',
      tipoMueble: formData.get('tipoMueble'),
      ancho: Number(formData.get('ancho')),
      alto: Number(formData.get('alto')),
      profundidad: formData.get('profundidad') ? Number(formData.get('profundidad')) : null,
      colorMelamina: color,
      acabado: acabado,
      descripcionAdicional: formData.get('descripcionAdicional') || '',
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Error al enviar la cotización');
      }

      setSuccess(true);
    } catch {
      setError('No pudimos enviar tu cotización. Por favor intenta más tarde o escríbenos por WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
          <div className="mb-6 inline-flex rounded-full bg-green-100 p-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">¡Cotización enviada!</h1>
          <p className="mt-4 text-lg text-gray-600">
            Te contactaremos en menos de 24 horas por WhatsApp con tu propuesta personalizada.
          </p>
          <Button asChild className="mt-8 bg-[#1D6B48] hover:bg-[#165536]">
            <a href="/">Volver al inicio</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Solicita tu cotización</h1>
          <p className="mt-4 text-gray-600">
            Cuéntanos qué mueble necesitas y te enviamos una propuesta personalizada
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos personales */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Tus datos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input id="nombre" name="nombre" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" placeholder="999 999 999" required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="juan@email.com" />
                </div>
              </div>
            </div>

            {/* Detalles del mueble */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Detalles del mueble</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="tipoMueble">Tipo de mueble</Label>
                  <select
                    id="tipoMueble"
                    name="tipoMueble"
                    value={tipoMueble}
                    onChange={(e) => setTipoMueble(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Selecciona un tipo</option>
                    {tiposMueble.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ancho">Ancho (cm)</Label>
                  <Input id="ancho" name="ancho" type="number" min={1} placeholder="200" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alto">Alto (cm)</Label>
                  <Input id="alto" name="alto" type="number" min={1} placeholder="240" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profundidad">Profundidad (cm) - opcional</Label>
                  <Input id="profundidad" name="profundidad" type="number" min={1} placeholder="60" />
                </div>
              </div>
            </div>

            {/* Color y acabado */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Color y acabado</h2>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Color de melamina</Label>
                  <div className="flex flex-wrap gap-3">
                    {coloresMelamina.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c.id)}
                        className={`group flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                          color === c.id
                            ? 'border-[#1D6B48] ring-2 ring-[#1D6B48] ring-offset-2'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className="h-8 w-8 rounded-full border border-gray-200 shadow-sm"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs text-gray-600">{c.nombre}</span>
                      </button>
                    ))}
                  </div>
                  {color && (
                    <p className="mt-2 text-sm text-[#1D6B48]">
                      Seleccionado: {coloresMelamina.find((c) => c.id === color)?.nombre}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block">Acabado</Label>
                  <div className="flex flex-wrap gap-2">
                    {acabados.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAcabado(a)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          acabado === a
                            ? 'bg-[#1D6B48] text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:border-[#1D6B48] hover:text-[#1D6B48]'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción y fotos */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Información adicional</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descripcionAdicional">Descripción adicional</Label>
                  <Textarea
                    id="descripcionAdicional"
                    name="descripcionAdicional"
                    placeholder="Describe detalles adicionales: número de cajones, tipo de puertas, distribución interna, etc."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fotos">Fotos del ambiente</Label>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="fotos"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      {files && files.length > 0 ? `${files.length} archivo(s)` : 'Subir fotos'}
                    </label>
                    <input
                      id="fotos"
                      name="fotos"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFiles(e.target.files)}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Puedes subir varias fotos del espacio donde irá el mueble</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !color || !acabado}
              className="w-full bg-[#1D6B48] py-6 text-base hover:bg-[#165536] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Enviando...
                </span>
              ) : (
                'Enviar cotización'
              )}
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function CotizarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CotizarContent />
    </Suspense>
  );
}
