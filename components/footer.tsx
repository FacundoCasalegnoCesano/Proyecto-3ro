import { Instagram, Phone, Mail } from "lucide-react"

interface FooterLink {
  href: string
  label: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface FooterProps {
  sections?: FooterSection[]
  contactInfo?: {
    instagram?: string
    phone?: string
    email?: string
  }
  footerText?: {
    quote?: string
    copyright?: string
  }
}

export function Footer({ sections = [], contactInfo = {}, footerText = {} }: FooterProps) {
  const defaultSections: FooterSection[] = [
    {
      title: "Mapa Del Sitio",
      links: [
        { href: "/#", label: "Inicio" },
        { href: "/productos", label: "Productos" },
      ],
    },
    {
      title: "Servicios",
      links: [
        { href: "/servicios", label: "Reiki" },
        { href: "/servicios", label: "Lectura de Tarot" },
        { href: "/servicios", label: "Limpieza Espiritual" },
        { href: "/servicios", label: "Limpieza de Espacios" },
      ],
    },
    {
      title: "Mi Camino",
      links: [{ href: "/mi-camino", label: "Sobre Mi" }],
    },
  ]

  const finalSections = sections.length > 0 ? sections : defaultSections

  return (
    <footer className="bg-white py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Contactos</h3>
            <div className="space-y-3">
              {contactInfo.instagram && (
                <a
                  href="https://www.instagram.com/babaluaye.reiki?igsh=MWw0MDVyMDU0djB6cA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 hover:text-babalu-primary transition-colors cursor-pointer"
                >
                  <Instagram className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">{contactInfo.instagram}</span>
                </a>
              )}
              {contactInfo.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">{contactInfo.phone}</span>
                </div>
              )}
              {contactInfo.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">{contactInfo.email}</span>
                </div>
              )}
            </div>
          </div>

          {finalSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-gray-800 mb-4">{section.title}</h3>
              <div className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    className="block text-gray-600 hover:text-babalu-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm mb-2">
            {footerText.quote || "Tu energía habla más fuerte que tus palabras"}
          </p>
          <p className="text-gray-500 text-xs">
            {footerText.copyright || "Todos los derechos reservados © 2025 Facundo Casalegno Cesano"}
          </p>
        </div>
      </div>
    </footer>
  )
}
