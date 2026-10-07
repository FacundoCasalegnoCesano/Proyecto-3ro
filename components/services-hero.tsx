"use client";

import Image from "next/image";
import Link from "next/link";

export function ServicesHero() {
  return (
    <div className="bg-orange-50/70 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Contenido de texto */}
          <div className="space-y-6">
            <h1 className="max-w-[15ch] text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Servicios de <span className="text-babalu-action">Sanación</span>{" "}
              y <span className="text-babalu-action">Guía Espiritual</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Descubre nuestros servicios especializados en armonizar tu cuerpo,
              mente y espíritu. Cada sesión está diseñada para brindarte paz,
              claridad y sanación profunda.
            </p>
            <Link href="#servicios" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-babalu-action px-6 py-3 font-semibold text-white transition-colors hover:bg-babalu-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-action focus-visible:ring-offset-2">
              Ver servicios
            </Link>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-700">
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
            <div className="relative w-full max-w-md">
              <div className="aspect-square rounded-[2rem] bg-babalu-primary p-3 sm:p-5">
                <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-white">
                  <Image
                    src="/img/Manos iluminadas por resplandor dorado.webp"
                    alt="Manos iluminadas por un resplandor dorado"
                    fill
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="object-cover"
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
