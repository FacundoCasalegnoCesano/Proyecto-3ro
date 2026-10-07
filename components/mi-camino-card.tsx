"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface MiCaminoSection {
  id: string;
  title: string;
  content: string;
  image: string;
}

interface MiCaminoCardProps {
  section: MiCaminoSection;
  reverse?: boolean;
}

export function MiCaminoCard({ section, reverse = false }: MiCaminoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Encabezado de la card - Siempre visible */}
      <h2>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={`contenido-${section.id}`}
          onClick={toggleExpand}
          className={`flex min-h-16 w-full items-center justify-between gap-4 p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-babalu-action sm:p-6 ${
            isExpanded ? "border-b border-gray-200 bg-orange-50/50" : "hover:bg-orange-50/40"
          }`}
        >
          <span className="text-xl font-bold text-gray-900 sm:text-2xl">
            {section.title}
          </span>
          <span className="flex flex-shrink-0 items-center gap-2 text-sm font-medium text-babalu-action">
            <span className="hidden sm:block">
              {isExpanded ? 'Cerrar' : 'Ver más'}
            </span>
            <span className={`transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}>
              <ChevronDown aria-hidden="true" className="h-5 w-5" />
            </span>
          </span>
        </button>
      </h2>

      {/* Contenido expandido con animación */}
      <div id={`contenido-${section.id}`} hidden={!isExpanded} className="overflow-hidden">
        <div className="p-5 sm:p-6 lg:p-8">
          <div className={`flex flex-col items-center gap-6 lg:gap-8 ${
            section.content.trim()
              ? reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
              : 'mx-auto max-w-2xl'
          }`}>
            
            {/* Texto */}
            {section.content.trim() && <div className="min-w-0 flex-1">
              <p className="max-w-prose break-words text-base leading-relaxed text-gray-700 lg:text-lg">
                {section.content}
              </p>
            </div>}
            
            {/* Imagen */}
            <div className="w-full min-w-0 flex-1">
              <div className="rounded-2xl bg-babalu-primary p-2.5 sm:p-3">
                <div className="overflow-hidden rounded-xl bg-white">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={section.image || "/placeholder.svg"}
                      alt={section.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
