"use client";

import { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Marcas de ejemplo - tú puedes pasar tu propio array
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
      logo: "/img/logos-marcas/Diseño minimalista de logo _tao_.webp",
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

    // Aquí el usuario implementará su lógica
    if (onContactSubmit) {
      await onContactSubmit(formData);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <section className="w-full py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className={`text-center mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 transform transition-transform duration-300 hover:scale-105">
              Marcas con las que Trabajamos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Colaboramos con las mejores marcas del mercado para ofrecerte
              productos de calidad
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {displayBrands.map((brand, index) => (
              <a
                key={brand.id}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className="relative w-full h-24 flex items-center justify-center">
                  <Image
                    src={brand.logo || "/placeholder.svg"}
                    alt={brand.alt}
                    fill
                    className="object-contain grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Icono de enlace externo que aparece al hacer hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                  <ExternalLink className="h-4 w-4 text-babalu-primary" />
                </div>

                {/* Overlay sutil al hacer hover */}
                <div className="absolute inset-0 bg-babalu-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            ))}
          </div>

          <div className={`mt-10 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-sm text-gray-500">
              ¿Eres una marca y quieres trabajar con nosotros?{" "}
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-babalu-primary hover:underline font-medium cursor-pointer transform transition-transform duration-300 hover:scale-105"
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