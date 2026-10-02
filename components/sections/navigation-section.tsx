"use client";

import { NavigationLinks } from "../../components/navigation-links";

export function NavigationSection() {
  const navigationLinks = [
    { href: "/productos?category=Sahumerio", label: "Sahumerios" },
    { href: "/productos?category=Bomba%20de%20Humo", label: "Bombas de humo" },
    { href: "/productos?category=Lampara%20De%20Sal", label: "Lámparas de sal" },
    { href: "/productos?category=Aromatizante%20De%20Ambientes", label: "Aromatizantes de ambientes" },
    { href: "/productos?category=Rocio%20Aurico", label: "Rocío áurico" },
  ];

  return <NavigationLinks links={navigationLinks} showViewMore={true} />;
}
