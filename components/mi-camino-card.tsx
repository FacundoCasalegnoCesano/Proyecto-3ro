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
        <div className={`p-8 lg:p-12 flex flex-col justify-center ${reverse ? "lg:col-start-2" : ""}`}>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">{section.title}</h2>
          <p className="text-gray-600 leading-relaxed text-lg">{section.content}</p>
        </div>

        {/* Imagen */}
        <div className={`relative min-h-[300px] lg:min-h-[400px] ${reverse ? "lg:col-start-1" : ""}`}>
          <div className="absolute inset-4">
            <div className="bg-babalu-primary rounded-2xl h-full p-4">
              <div className="bg-white rounded-xl h-full flex items-center justify-center">
                <Image
                  src={section.image || "/placeholder.svg"}
                  alt={section.title}
                  width={400}
                  height={300}
                  className="object-cover rounded-lg max-w-full max-h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
