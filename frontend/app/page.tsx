import Link from 'next/link';
import { ArrowRight, Shield, Truck, Gem, Ruler, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { productos } from '@/lib/data';

export default function Home() {
  const destacados = productos.filter((p) => p.destacado);

  const razones = [
    {
      icon: Shield,
      title: 'Garantía de 2 años',
      desc: 'Todos nuestros muebles incluyen garantía extendida por defectos de fabricación.',
    },
    {
      icon: Truck,
      title: 'Delivery en Lima',
      desc: 'Entrega e instalación incluida dentro de Lima metropolitana.',
    },
    {
      icon: Gem,
      title: 'Materiales premium',
      desc: 'Usamos melamina de 18mm de las mejores marcas del mercado.',
    },
    {
      icon: Ruler,
      title: '100% a medida',
      desc: 'Cada mueble se diseña y fabrica según las medidas exactas de tu espacio.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Muebles de melamina{' '}
              <span className="text-[#1D6B48]">a medida</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
              Diseñamos y fabricamos closets, cocinas integrales, escritorios y más.
              Calidad premium para tu hogar u oficina en Lima, Perú.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-[#1D6B48] px-8 hover:bg-[#165536] text-base font-bold shadow-lg">
                <Link href="/comprar-prueba">🛒 Comprar ahora</Link>
              </Button>
              <Button asChild size="lg" className="bg-white border-2 border-[#1D6B48] text-[#1D6B48] px-8 hover:bg-[#f0faf5]">
                <Link href="/cotizar">Solicitar cotización</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gray-300 px-8 text-gray-700 hover:bg-gray-100">
                <Link href="/catalogo">
                  Ver proyectos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Productos destacados</h2>
            <p className="mt-4 text-gray-600">Nuestros muebles más solicitados, fabricados a medida</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="border-[#1D6B48] text-[#1D6B48] hover:bg-[#1D6B48] hover:text-white">
              <Link href="/catalogo">Ver catálogo completo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">¿Por qué elegirnos?</h2>
            <p className="mt-4 text-gray-600">Más de 500 familias en Lima confían en nosotros</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {razones.map((r) => (
              <div key={r.title} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-[#1D6B48]/10 p-3">
                  <r.icon className="h-6 w-6 text-[#1D6B48]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl bg-[#1D6B48] px-6 py-16 text-center text-white sm:px-12">
            <h2 className="text-3xl font-bold sm:text-4xl">¿Listo para transformar tu espacio?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Solicita una cotización gratuita y recibe una propuesta personalizada en menos de 24 horas.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-[#1D6B48] hover:bg-gray-100 font-bold text-base px-8">
                <Link href="/comprar-prueba">🛒 Comprar ahora</Link>
              </Button>
              <Button asChild size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8">
                <Link href="/cotizar">Solicitar cotización gratis</Link>
              </Button>
              <a
                href="https://wa.me/51999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-white transition-colors hover:bg-white/10"
              >
                <Check className="h-4 w-4" /> Escribir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
