"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import {
  BrandContactModal,
  type BrandContactFormData,
} from "../../components/brand-contact-modal";

interface Brand {
  id: number;
  name: string;
  logo: string;
  url: string;
  alt: string;
}

interface BrandsSectionProps {
  brands?: Brand[];
  onContactSubmit?: (formData: BrandContactFormData) => void | Promise<void>;
}

export function BrandsSection({ brands, onContactSubmit }: BrandsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultBrands: Brand[] = [
    {
      id: 1,
      name: "Aromanza",
      logo: "/img/logos-marcas/aromanza_logo-150x150.webp",
      url: "https://aromatizarmayorista.com.ar/sistema/?pagina=productos&marca=21",
      alt: "Logo Aromanza",
    },
    {
      id: 2,
      name: "Fantis",
      logo: "/img/logos-marcas/cropped-logo-4.webp",
      url: "https://fantisargentina.com.ar",
      alt: "Logo Fantis",
    },
    {
      id: 3,
      name: "Iluminarte",
      logo: "/img/logos-marcas/1-slide-1673025770188-5746374473-de5fa2a50ce6e09532ba91907932fb031673025771-480-0.webp",
      url: "https://www.iluminarte.com.ar",
      alt: "Logo Iluminarte",
    },
    {
      id: 4,
      name: "Tao",
      logo: "/img/logos-marcas/tao-logo.png",
      url: "https://www.aromatizarmayorista.com.ar",
      alt: "Logo Tao",
    },
    {
      id: 5,
      name: "Sagrada Madre",
      logo: "/img/logos-marcas/marca-1-color-Principal.webp",
      url: "https://sagradamadre.com/?p=inicio",
      alt: "Logo Sagrada Madre",
    },
    {
      id: 6,
      name: "Saphirus",
      logo: "/img/logos-marcas/Marca-Saphirus_2.webp",
      url: "https://saphirus.com.ar",
      alt: "Logo Saphirus",
    },
  ];

  const displayBrands = brands || defaultBrands;

  const handleContactSubmit = async (formData: BrandContactFormData) => {
    setIsSubmitting(true);

    if (onContactSubmit) {
      await onContactSubmit(formData);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <section className="w-full bg-gray-50 py-14 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="mb-8 text-center md:mb-10">
            <h2 className="mb-3 text-balance text-2xl font-bold text-gray-900 md:text-3xl">
              Marcas con las que Trabajamos
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
              Colaboramos con las mejores marcas del mercado para ofrecerte
              productos de calidad
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
            {displayBrands.map((brand) => (
              <a
                key={brand.id}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visitar el sitio de ${brand.name} (se abre en una pestaña nueva)`}
                className="group relative flex min-h-36 items-center justify-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-action focus-visible:ring-offset-2"
              >
                <div className="relative h-20 w-full md:h-24">
                  <Image
                    src={brand.logo || "/placeholder.svg"}
                    alt={brand.alt}
                    fill
                    className="object-contain grayscale transition-[filter] duration-200 group-hover:grayscale-0"
                    sizes="(max-width: 768px) 40vw, (max-width: 1200px) 25vw, 16vw"
                  />
                </div>
                <ExternalLink
                  aria-hidden="true"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-500 transition-colors group-hover:text-babalu-action"
                />
              </a>
            ))}
          </div>

          <div className="mt-8 text-center md:mt-10">
            <p className="text-sm text-gray-700">
              ¿Eres una marca y quieres trabajar con nosotros?{" "}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex min-h-11 items-center rounded-sm font-semibold text-babalu-action underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-action"
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
  );
}
