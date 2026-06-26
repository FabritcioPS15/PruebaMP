'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ruler } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { productos } from '@/lib/data';
import { Button } from '@/components/ui/button';

type Categoria = 'todos' | 'dormitorio' | 'cocina' | 'oficina' | 'baño';

const categorias: { key: Categoria; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'dormitorio', label: 'Dormitorio' },
  { key: 'cocina', label: 'Cocina' },
  { key: 'oficina', label: 'Oficina' },
  { key: 'baño', label: 'Baño' },
];

function CatalogoContent() {
  const searchParams = useSearchParams();
  const productoSlug = searchParams.get('producto');
  const [categoria, setCategoria] = useState<Categoria>('todos');

  useEffect(() => {
    if (productoSlug) {
      const prod = productos.find((p) => p.slug === productoSlug);
      if (prod) {
        setCategoria(prod.categoria);
      }
    }
  }, [productoSlug]);

  const filtrados = categoria === 'todos'
    ? productos
    : productos.filter((p) => p.categoria === categoria);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Nuestro catálogo</h1>
          <p className="mt-4 text-gray-600">Todos nuestros productos fabricados a medida</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Filtros */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categorias.map((cat) => (
              <Button
                key={cat.key}
                onClick={() => setCategoria(cat.key)}
                variant={categoria === cat.key ? 'default' : 'outline'}
                className={
                  categoria === cat.key
                    ? 'bg-[#1D6B48] text-white hover:bg-[#165536]'
                    : 'border-gray-300 text-gray-700 hover:border-[#1D6B48] hover:text-[#1D6B48]'
                }
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {filtrados.length === 0 ? (
            <div className="py-20 text-center">
              <Ruler className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No hay productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CatalogoContent />
    </Suspense>
  );
}
