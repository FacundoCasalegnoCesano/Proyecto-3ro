"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { BrandContactModal, type BrandContactFormData } from "../../components/brand-contact-modal"

interface Brand {
  id: number
  name: string
  logo: string
  url: string
  alt: string
}

interface BrandsSectionProps {
  brands?: Brand[]
  onContactSubmit?: (formData: BrandContactFormData) => void | Promise<void>
}

export function BrandsSection({ brands, onContactSubmit }: BrandsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Marcas de ejemplo - tú puedes pasar tu propio array
  const defaultBrands: Brand[] = [
    {
      id: 1,
      name: "Marca 1",
      logo: "/placeholder.svg?height=120&width=180&text=Marca+1",
      url: "https://example.com/marca1",
      alt: "Logo Marca 1",
    },
    {
      id: 2,
      name: "Marca 2",
      logo: "/placeholder.svg?height=120&width=180&text=Marca+2",
      url: "https://example.com/marca2",
      alt: "Logo Marca 2",
    },
    {
      id: 3,
      name: "Marca 3",
      logo: "/placeholder.svg?height=120&width=180&text=Marca+3",
      url: "https://example.com/marca3",
      alt: "Logo Marca 3",
    },
    {
      id: 4,
      name: "Marca 4",
      logo: "/placeholder.svg?height=120&width=180&text=Marca+4",
      url: "https://example.com/marca4",
      alt: "Logo Marca 4",
    },
    {
      id: 5,
      name: "Marca 5",
      logo: "/placeholder.svg?height=120&width=180&text=Marca+5",
      url: "https://example.com/marca5",
      alt: "Logo Marca 5",
    },
    {
      id: 6,
      name: "Marca 6",
      logo: "/placeholder.svg?height=120&width=180&text=Marca+6",
      url: "https://example.com/marca6",
      alt: "Logo Marca 6",
    },
  ]

  const displayBrands = brands || defaultBrands

  const handleContactSubmit = async (formData: BrandContactFormData) => {
    setIsSubmitting(true)

    // Aquí el usuario implementará su lógica
    if (onContactSubmit) {
      await onContactSubmit(formData)
    }

    setIsSubmitting(false)
    setIsModalOpen(false)
  }

  return (
    <>
      <section className="w-full py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Marcas con las que Trabajamos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Colaboramos con las mejores marcas del mercado para ofrecerte productos de calidad
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {displayBrands.map((brand) => (
              <a
                key={brand.id}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-babalu-primary"
              >
                <div className="relative w-full h-24 flex items-center justify-center">
                  <Image
                    src={brand.logo || "/placeholder.svg"}
                    alt={brand.alt}
                    fill
                    className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>

                {/* Icono de enlace externo que aparece al hacer hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ExternalLink className="h-4 w-4 text-babalu-primary" />
                </div>

                {/* Overlay sutil al hacer hover */}
                <div className="absolute inset-0 bg-babalu-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              ¿Eres una marca y quieres trabajar con nosotros?{" "}
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-babalu-primary hover:underline font-medium cursor-pointer"
              >
                Contáctanos aquí
              </button>
            </p>
          </div>
        </div>
      </section>

      <BrandContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleContactSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
