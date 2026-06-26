import Link from 'next/link';
import { Ruler } from 'lucide-react';
import { Producto } from '@/lib/types';
import { formatSoles } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  producto: Producto;
}

export function ProductCard({ producto }: ProductCardProps) {
  const colorMap: Record<string, string> = {
    dormitorio: 'bg-amber-100 text-amber-800',
    cocina: 'bg-orange-100 text-orange-800',
    oficina: 'bg-blue-100 text-blue-800',
    baño: 'bg-cyan-100 text-cyan-800',
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <Ruler className="h-12 w-12 text-gray-400" />
        </div>
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[producto.categoria] || 'bg-gray-100 text-gray-800'}`}>
          {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-[#1D6B48] px-2.5 py-0.5 text-xs font-medium text-white">
          A medida
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-gray-900">{producto.nombre}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{producto.descripcionCorta}</p>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-sm text-gray-500">Desde</span>
          <span className="text-xl font-bold text-[#1D6B48]">{formatSoles(producto.precioDesde)}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" className="flex-1 border-[#1D6B48] text-[#1D6B48] hover:bg-[#1D6B48] hover:text-white">
            <Link href={`/catalogo?producto=${producto.slug}`}>Ver más</Link>
          </Button>
          <Button asChild className="flex-1 bg-[#1D6B48] hover:bg-[#165536]">
            <Link href={`/cotizar?producto=${producto.slug}`}>Cotizar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
