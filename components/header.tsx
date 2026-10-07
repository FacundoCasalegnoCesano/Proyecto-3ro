"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Globe, Menu, User, X } from "lucide-react";
import { UserDropdown } from "./user-dropdown";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/mi-camino", label: "Mi Camino" },
];

export function Header() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const closeMenuForDesktop = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    const closeMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    window.addEventListener("resize", closeMenuForDesktop);
    window.addEventListener("keydown", closeMenuOnEscape);
    return () => {
      window.removeEventListener("resize", closeMenuForDesktop);
      window.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isLoggedIn = !!session?.user;

  const navigationLink = (
    href: string,
    label: string,
    mobile = false
  ) => {
    const isCurrentPage =
      pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

    return (
      <Link
        key={href}
        href={href}
        aria-current={isCurrentPage ? "page" : undefined}
        onClick={mobile ? closeMobileMenu : undefined}
        className={mobile
          ? `block min-h-11 rounded-md px-3 py-3 transition-colors hover:bg-babalu-medium/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium ${isCurrentPage ? "bg-babalu-medium/10 font-semibold" : ""}`
          : `rounded-sm py-2 transition-colors hover:text-babalu-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium ${isCurrentPage ? "font-semibold underline decoration-2 underline-offset-8" : ""}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-babalu-primary text-babalu-medium">
      <div className="container mx-auto px-4 py-2.5 md:py-3">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Babalu Aye Reiki & Tarot, inicio"
            className="flex min-w-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium focus-visible:ring-offset-2 focus-visible:ring-offset-babalu-primary"
          >
            <Image
              src="/img/logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <span className="hidden truncate text-base font-bold sm:inline md:text-lg">
              Babalu Aye Reiki & Tarot
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
            {links.map(({ href, label }) => navigationLink(href, label))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-babalu-medium/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              {isMobileMenuOpen ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5" />
              )}
            </button>

            <span className="inline-flex items-center gap-1 text-sm" aria-label="Idioma: español">
              <Globe aria-hidden="true" className="h-4 w-4" />
              ES
            </span>

            {status === "loading" ? (
              <span
                role="status"
                className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-md border border-babalu-medium/30 bg-white/35 px-3 text-sm"
              >
                Cargando cuenta…
              </span>
            ) : isLoggedIn ? (
              <UserDropdown
                user={{
                  nombre: session.user.nombre || "Usuario",
                  apellido: session.user.apellido || "",
                  email: session.user.email || "",
                  rol: session.user.rol || "user",
                }}
                onLogout={() => signOut({ callbackUrl: "/" })}
              />
            ) : (
              <Link
                href="/iniciar-sesion"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-babalu-medium bg-[#FBE9E7] px-3 text-sm font-medium text-babalu-medium transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium focus-visible:ring-offset-2 focus-visible:ring-offset-babalu-primary"
              >
                <User aria-hidden="true" className="h-4 w-4" />
                <span>Ingresar</span>
              </Link>
            )}
          </div>
        </div>

        <nav
          id="mobile-navigation"
          aria-label="Navegación móvil"
          className={`${isMobileMenuOpen ? "block" : "hidden"} mt-3 border-t border-babalu-medium/20 pt-3 md:hidden`}
        >
          {links.map(({ href, label }) => navigationLink(href, label, true))}
        </nav>
      </div>
    </header>
  );
}
