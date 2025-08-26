"use client"

import { NavigationLinks } from "../../components/navigation-links"

export function NavigationSection() {
  const navigationLinks = [
    { href: "/productos?category==Sahumerios", label: "Sahumerios" },
    { href: "/productos?category==Inciensos", label: "Inciensos" },
    { href: "/productos?category==Velas", label: "Velas" },
    { href: "/productos?category==Bombas de humo", label: "Bombas de humo" },
    { href: "/productos?category==Porta Sahumerios", label: "Porta Sahumerios" },
    { href: "/productos?category==Estatuas", label: "Estatuas" },
  ]

  return <NavigationLinks links={navigationLinks} showViewMore={true} />
}
