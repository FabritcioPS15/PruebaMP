'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sofa } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[#1D6B48]">
          <Sofa className="h-6 w-6" />
          <span>MelaminaPro</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-700 transition-colors hover:text-[#1D6B48]">
            Inicio
          </Link>
          <Link href="/catalogo" className="text-sm font-medium text-gray-700 transition-colors hover:text-[#1D6B48]">
            Catálogo
          </Link>
          <Link href="/cotizar" className="text-sm font-medium text-gray-700 transition-colors hover:text-[#1D6B48]">
            Cotizar
          </Link>
          <Link href="/mis-compras" className="text-sm font-medium text-gray-700 transition-colors hover:text-[#1D6B48]">
            Mis compras
          </Link>
          <Button asChild variant="outline" className="border-[#1D6B48] text-[#1D6B48] hover:bg-[#1D6B48] hover:text-white">
            <Link href="/cotizar">Cotizar</Link>
          </Button>
          <Button asChild className="bg-[#1D6B48] hover:bg-[#165536] font-semibold">
            <Link href="/comprar-prueba">🛒 Comprar ahora</Link>
          </Button>
        </div>

        <button
          className="p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
              Inicio
            </Link>
            <Link href="/catalogo" className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
              Catálogo
            </Link>
            <Link href="/cotizar" className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
              Cotizar
            </Link>
            <Link href="/mis-compras" className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
              Mis compras
            </Link>
            <Button asChild variant="outline" className="border-[#1D6B48] text-[#1D6B48]">
              <Link href="/cotizar" onClick={() => setOpen(false)}>Pedir cotización</Link>
            </Button>
            <Button asChild className="bg-[#1D6B48] hover:bg-[#165536] font-semibold">
              <Link href="/comprar-prueba" onClick={() => setOpen(false)}>🛒 Comprar ahora</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
