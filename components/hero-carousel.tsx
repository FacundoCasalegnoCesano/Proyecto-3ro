"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "../components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel"

interface HeroImage {
  src: string;
  alt: string;
}

interface HeroCarouselProps {
  images: HeroImage[];
  autoplayInterval?: number;
  className?: string;
}

export function HeroCarousel({ images, autoplayInterval = 5000, className = "" }: HeroCarouselProps) {
  const carouselRef = useRef<any>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      carouselRef.current?.api?.scrollNext()
    }, autoplayInterval)

    return () => clearInterval(interval)
  }, [autoplayInterval])

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Carousel
        ref={carouselRef}
        className="w-full"
        opts={{
          loop: true,
          skipSnaps: true,
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
                  <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed">
                    Conecta con tu esencia a través de sesiones de Reiki, descubre respuestas con el Tarot y encuentra la
                    armonía que necesitas para tu bienestar integral.
                  </p>
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