"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300">
      {/* Encabezado de la card - Siempre visible */}
      <div 
        className={`p-6 cursor-pointer transition-all duration-200 ${
          isExpanded ? 'bg-gray-50 border-b border-gray-100' : 'hover:bg-gray-50'
        }`}
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
            {section.title}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 hidden sm:block">
              {isExpanded ? 'Cerrar' : 'Ver más'}
            </span>
            <div className={`transform transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido expandido con animación */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[2000px]' : 'max-h-0'
      }`}>
        <div className={`p-6 lg:p-8 transform transition-all duration-500 ${
          isExpanded 
            ? 'translate-y-0 opacity-100 scale-100' 
            : '-translate-y-4 opacity-0 scale-95'
        }`}>
          <div className={`flex flex-col ${
            reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
          } gap-6 lg:gap-8 items-center`}>
            
            {/* Texto */}
            <div className="flex-1">
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                {section.content}
              </p>
            </div>
            
            {/* Imagen */}
            <div className="flex-1">
              <div className="bg-babalu-primary rounded-2xl p-3">
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={section.image || "/placeholder.svg"}
                      alt={section.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}