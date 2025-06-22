"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel"

interface HeroImage {
  src: string
  alt: string
  focalPoint?: string
}

interface HeroCarouselProps {
  images: HeroImage[]
  className?: string
  onSlideChange?: (index: number) => void
}

export function HeroCarousel({ images = [], className = "", onSlideChange }: HeroCarouselProps) {
  const apiRef = useRef<any>(null) // Usamos any para evitar la dependencia de EmblaCarouselType
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  // Validación de imágenes
  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full h-[65vh] md:h-[70vh] bg-gray-200 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No hay imágenes disponibles</p>
      </div>
    )
  }

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

  // Inicialización y event listeners
  useEffect(() => {
    const api = apiRef.current
    if (!api) return

    startAutoplay()

    const handleSelect = () => {
      try {
        const selectedIndex = api.selectedScrollSnap()
        onSlideChange?.(selectedIndex)
      } catch (error) {
        console.error("Error al obtener el slide actual:", error)
      }
    }

    const handlePointerDown = () => stopAutoplay()
    const handlePointerUp = () => startAutoplay()

    api.on("select", handleSelect)
    api.on("pointerDown", handlePointerDown)
    api.on("pointerUp", handlePointerUp)

    return () => {
      stopAutoplay()
      api.off("select", handleSelect)
      api.off("pointerDown", handlePointerDown)
      api.off("pointerUp", handlePointerUp)
    }
  }, [onSlideChange])

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Carousel
        className="w-full h-full"
        opts={{
          loop: true,
          skipSnaps: true,
        }}
        setApi={(api) => {
          apiRef.current = api
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
    </div>
  )
}