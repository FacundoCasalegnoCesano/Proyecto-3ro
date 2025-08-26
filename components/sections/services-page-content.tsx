"use client";

import { ServicesHero } from "../../components/services-hero";
import { ServicesGrid } from "../../components/services-grid";

export function ServicesPageContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <ServicesHero />

      {/* Grid de servicios */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Elige el servicio que mejor se adapte a tus necesidades espirituales
            y de sanación
          </p>
        </div>
        <ServicesGrid />
      </div>

      {/* Sección de contacto */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            ¿Tienes dudas sobre nuestros servicios?
          </h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Contáctanos para recibir orientación personalizada y encontrar el
            servicio perfecto para ti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5491123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="mailto:hola@babalu.com"
              className="bg-babalu-primary hover:bg-babalu-dark text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
