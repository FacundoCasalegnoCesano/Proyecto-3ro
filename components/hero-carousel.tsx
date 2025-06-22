"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "../components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel"

interface HeroImage {
  src: string
  alt: string
  focalPoint?: string
}

interface HeroCarouselProps {
  images: HeroImage[]
  className?: string
}

export function HeroCarousel({ 
  images, 
  className = "" 
}: HeroCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

  // Configuración del autoplay (5 segundos)
  useEffect(() => {
    if (!apiRef.current) return

    const interval = setInterval(() => {
      apiRef.current?.scrollNext()
    }, 5000)

    // Pausar autoplay cuando el usuario interactúa
    const pauseAutoplay = () => {
      clearInterval(interval)
    }

    apiRef.current.on('pointerDown', pauseAutoplay)
    
    return () => {
      clearInterval(interval)
      apiRef.current?.off('pointerDown', pauseAutoplay)
    }
  }, [])

  return (
    <div className={`relative w-full overflow-hidden ${className}`} ref={carouselRef}>
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
                    objectPosition: image.focalPoint || "center center"
                  }}
                  priority={index === 0}
                  quality={100}
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30" />
              </div>
              
              <div className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 max-w-xs md:max-w-md z-10">
                <div className="bg-[#FBE9E7] bg-opacity-90 p-4 md:p-6 rounded-lg">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
                    Armoniza Cuerpo, Mente y Espíritu
                  </h1>
                  <Button className="bg-babalu-primary hover:bg-babalu-dark text-white text-sm md:text-base">
                    Conocer Más
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="left-2 md:left-4 text-black border-white hover:bg-white" />
        <CarouselNext className="right-2 md:right-4 text-black border-white hover:bg-white" />
      </Carousel>
    </div>
  )
}