"use client"

import { NavigationLinks } from "../../components/navigation-links"

export function NavigationSection() {
  const navigationLinks = [
    { href: "#", label: "Informática" },
    { href: "#", label: "Para bebes" },
    { href: "#", label: "Perfumes" },
    { href: "#", label: "Bombas de baño" },
    { href: "#", label: "Accesorios" },
    { href: "#", label: "Alimentación" },
    { href: "#", label: "Limpieza de Oro" },
  ]

  return <NavigationLinks links={navigationLinks} showViewMore={true} />
}
