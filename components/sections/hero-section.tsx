"use client"

import { HeroCarousel } from "../../components/hero-carousel"

export function HeroSection() {
  const heroImages = [
    {
      src: "/img/cartas-tarot.jpg",
      alt: "Tarot cards spread",
    },
    {
      src: "/img/1744750643661.jpg?height=500&width=800",
      alt: "Reiki session",
    },
    {
      src: "/img/1744750643646.jpg?height=500&width=800",
      alt: "Spiritual cleansing",
    },
  ]

  return <HeroCarousel images={heroImages} autoplayInterval={5000} />
}
