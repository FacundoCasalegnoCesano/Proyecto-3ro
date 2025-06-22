"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel"

interface MinimalCarouselAPI {
  selectedScrollSnap: () => number
  scrollNext: () => void
  scrollPrev: () => void
  on: (event: string, callback: () => void) => void
  off: (event: string, callback: () => void) => void
}

interface HeroImage {
  src: string
  alt: string
  focalPoint?: string
  content?: {
    title?: string
    description?: string
    buttonText?: string
    buttonAction?: () => void
  }
}

interface HeroCarouselProps {
  images: HeroImage[]
  className?: string
  onSlideChange?: (index: number) => void
}

export function HeroCarousel({ images = [], className = "", onSlideChange }: HeroCarouselProps) {
  const apiRef = useRef<MinimalCarouselAPI | null>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Configuración del autoplay
  const startAutoplay = () => {
    stopAutoplay()
    autoplayRef.current = setInterval(() => {
      apiRef.current?.scrollNext()
    }, 5000)
  }

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
      autoplayRef.current = null
    }
  }

  // Manejar cambio de slide
  const handleSlideChange = (index: number) => {
    const safeIndex = ((index % images.length) + images.length) % images.length
    setCurrentIndex(safeIndex)
    onSlideChange?.(safeIndex)
  }

  // Inicialización del carrusel
  useEffect(() => {
    const api = apiRef.current
    if (!api) return

    startAutoplay()

    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap()
      handleSlideChange(selectedIndex)
    }

    api.on("select", handleSelect)
    api.on("pointerDown", stopAutoplay)
    api.on("pointerUp", startAutoplay)

    return () => {
      stopAutoplay()
      api.off("select", handleSelect)
      api.off("pointerDown", stopAutoplay)
      api.off("pointerUp", startAutoplay)
    }
  }, [images.length, onSlideChange])

  // Validación de imágenes
  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full h-[65vh] md:h-[70vh] bg-gray-200 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No hay imágenes disponibles</p>
      </div>
    )
  }

  const currentContent = images[currentIndex]?.content || {}

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Carousel
        className="w-full h-full"
        opts={{
          loop: true,
          skipSnaps: true,
          startIndex: 0,
        }}
        setApi={(api) => {
          apiRef.current = api as MinimalCarouselAPI
          if (api) {
            startAutoplay()
            // Actualizar el índice inicial
            handleSlideChange(api.selectedScrollSnap())
          }
        }}
      >
        <CarouselContent className="h-[65vh] md:h-[70vh]">
          {images.map((image, index) => (
            <CarouselItem key={`${image.src}-${index}`} className="relative p-0 h-full">
              <div className="relative w-full h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  style={{
                    objectPosition: image.focalPoint || "center center",
                  }}
                  priority={index === 0}
                  quality={100}
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious 
          className="left-2 md:left-4 text-black border-white hover:bg-white/90"
          onClick={stopAutoplay}
        />
        <CarouselNext 
          className="right-2 md:right-4 text-black border-white hover:bg-white/90"
          onClick={stopAutoplay}
        />
      </Carousel>

      {/* Contenido dinámico */}
      <div className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 max-w-xs md:max-w-md z-10">
        <div className="bg-[#FBE9E7] bg-opacity-90 p-4 md:p-6 rounded-lg shadow-lg transition-all duration-300">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
            {currentContent.title || "Título predeterminado"}
          </h1>
          {currentContent.description && (
            <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">
              {currentContent.description}
            </p>
          )}
          {currentContent.buttonText && (
            <button
              className="bg-babalu-primary hover:bg-babalu-dark text-white text-sm md:text-base px-4 py-2 rounded transition-all duration-200 hover:scale-105"
              onClick={currentContent.buttonAction}
            >
              {currentContent.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}