"use client"

import Image from "next/image"

interface MiCaminoSection {
  id: string
  title: string
  content: string
  image: string
}

interface MiCaminoCardProps {
  section: MiCaminoSection
  reverse?: boolean
}

export function MiCaminoCard({ section, reverse = false }: MiCaminoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${reverse ? "lg:grid-flow-col-dense" : ""}`}>
        {/* Contenido de texto */}
        <div className={`p-6 lg:p-8 xl:p-12 flex flex-col justify-center ${reverse ? "lg:col-start-2" : ""}`}>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 lg:mb-6">{section.title}</h2>
          <p className="text-gray-600 leading-relaxed text-base lg:text-lg">{section.content}</p>
        </div>

        {/* Contenedor de imagen - Mejorado */}
        <div className={`relative ${reverse ? "lg:col-start-1" : ""}`}>
          <div className="relative aspect-video lg:aspect-square lg:min-h-[400px]">
            <div className="absolute inset-4 lg:ins-6">
              <div className="bg-babalu-primary rounded-2xl h-full w-full p-3 lg:p-4">
                <div className="bg-white rounded-xl h-full w-full flex items-center justify-center p-2 lg:p-3 overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src={section.image || "/placeholder.svg"}
                      alt={section.title}
                      fill
                      className="object-contain rounded-lg"
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
  )
}