"use client"

import { NavigationLinks } from "../../components/navigation-links"

export function NavigationSection() {
  const navigationLinks = [
    { href: "#", label: "Sahumerios" },
    { href: "#", label: "Inciensos" },
    { href: "#", label: "Velas" },
    { href: "#", label: "Bombas de humo" },
    { href: "#", label: "Porta Sahumerios" },
    { href: "#", label: "Palo santos" },
  ]

  return <NavigationLinks links={navigationLinks} showViewMore={true} />
}
