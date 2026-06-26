import { Phone, MapPin, Mail, Instagram, Facebook, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-gray-900">MelaminaPro</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Muebles de melamina a medida en Lima, Perú. Calidad, diseño y funcionalidad para cada espacio de tu hogar.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-[#1D6B48]" />
                <a href="https://wa.me/51999999999" target="_blank" rel="noopener noreferrer" className="hover:text-[#1D6B48]">
                  WhatsApp: +51 999 999 999
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-[#1D6B48]" />
                <span>info@melaminapro.pe</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-[#1D6B48]" />
                <span>Lima, Perú</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-[#1D6B48]" />
                <span>Lun - Sáb: 9:00 - 18:00</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <a href="/catalogo" className="text-sm text-gray-600 hover:text-[#1D6B48]">Catálogo</a>
              </li>
              <li>
                <a href="/cotizar" className="text-sm text-gray-600 hover:text-[#1D6B48]">Cotizar</a>
              </li>
              <li>
                <a href="/admin" className="text-sm text-gray-600 hover:text-[#1D6B48]">Panel Admin</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Síguenos</h3>
            <div className="flex gap-3">
              <a href="#" className="rounded-full bg-[#1D6B48] p-2 text-white transition-colors hover:bg-[#165536]">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-[#1D6B48] p-2 text-white transition-colors hover:bg-[#165536]">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MelaminaPro. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
