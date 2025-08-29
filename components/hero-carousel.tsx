"use client"

import { useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel"

interface CarouselApi {
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
}

interface HeroCarouselProps {
  images: HeroImage[]
  className?: string
  onSlideChange: (index: number) => void
}

export function HeroCarousel({ images = [], className = "", onSlideChange }: HeroCarouselProps) {
  const apiRef = useRef<CarouselApi | null>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  // Memorizar stopAutoplay para evitar recreación en cada render
  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
      autoplayRef.current = null
    }
  }, [])

  // Memorizar startAutoplay para evitar recreación en cada render
  const startAutoplay = useCallback(() => {
    stopAutoplay()
    autoplayRef.current = setInterval(() => {
      apiRef.current?.scrollNext()
    }, 5000)
  }, [stopAutoplay])

  // Inicialización del carrusel
  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    
    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap()
      onSlideChange(selectedIndex)
    }
    
    api.on("select", handleSelect)
    api.on("pointerDown", stopAutoplay)
    api.on("pointerUp", startAutoplay)
    
    // Iniciar autoplay después de configurar los listeners
    startAutoplay()
    
    return () => {
      stopAutoplay()
      api.off("select", handleSelect)
      api.off("pointerDown", stopAutoplay)
      api.off("pointerUp", startAutoplay)
    }
  }, [onSlideChange, startAutoplay, stopAutoplay])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setCarouselApi = (api: any) => {
    apiRef.current = api
    if (api) {
      // Notificar el slide inicial inmediatamente
      onSlideChange(api.selectedScrollSnap())
    }
  }

  if (!images?.length) {
    return (
      <div className={`relative w-full h-[65vh] bg-gray-200 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No hay imágenes disponibles</p>
      </div>
    )
  }

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Carousel
        className="w-full h-full"
        opts={{
          loop: true,
          skipSnaps: false,
        }}
        setApi={setCarouselApi}
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
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious 
          className="left-2 md:left-4 text-white border-white hover:bg-white/20"
          onClick={stopAutoplay}
        />
        <CarouselNext 
          className="right-2 md:right-4 text-white border-white hover:bg-white/20"
          onClick={stopAutoplay}
        />
      </Carousel>
    </div>
  )
}