"use client";

import Image from "next/image";

export function ServicesHero() {
  return (
    <div className="bg-gradient-to-r from-babalu-primary/10 to-babalu-primary/5 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contenido de texto */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">
              Servicios de <span className="text-babalu-primary">Sanación</span>{" "}
              y <span className="text-babalu-primary">Guía Espiritual</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Descubre nuestros servicios especializados en armonizar tu cuerpo,
              mente y espíritu. Cada sesión está diseñada para brindarte paz,
              claridad y sanación profunda.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-babalu-primary rounded-full"></div>
                <span>Más de 5 años de experiencia</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-babalu-primary rounded-full"></div>
                <span>Técnicas ancestrales y modernas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-babalu-primary rounded-full"></div>
                <span>Atención personalizada</span>
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-babalu-primary rounded-full p-8">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Image
                    src="/placeholder.svg?height=250&width=250&text=Spiritual+Services&bg=F5F5F5"
                    alt="Servicios Espirituales"
                    width={250}
                    height={250}
                    className="rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
