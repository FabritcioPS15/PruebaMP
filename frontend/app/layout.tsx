import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MelaminaPro - Muebles de Melamina a Medida en Lima',
  description: 'Fabricamos muebles de melamina a medida en Lima, Perú. Closets, cocinas integrales, escritorios, bibliotecas, vestidores y más. Cotiza gratis.',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
