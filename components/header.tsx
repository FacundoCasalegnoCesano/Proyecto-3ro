// components/Header.tsx
"use client";

import { Button } from "../components/ui/button";
import { Globe, Menu, User, X } from "lucide-react";
import Image from "next/image";
import { UserDropdown } from "./user-dropdown";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <header className="bg-babalu-primary text-babalu-medium">
        <div className="container mx-auto px-4 py-3">
          <div className="flex min-w-0 items-center justify-between">
            {/* Logo y navegación con skeleton loading */}
            <div className="flex min-w-0 items-center space-x-2">
              <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-babalu-medium/20"></div>
              <div className="hidden h-6 w-32 animate-pulse rounded bg-babalu-medium/20 sm:block"></div>
            </div>

            <nav className="hidden items-center space-x-4 md:flex">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-6 w-14 animate-pulse rounded bg-babalu-medium/20"
                ></div>
              ))}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="h-6 w-12 animate-pulse rounded bg-babalu-medium/20"></div>
              <div className="h-11 w-11 animate-pulse rounded bg-babalu-medium/20 md:hidden"></div>
              <div className="hidden h-10 w-20 animate-pulse rounded bg-babalu-medium/20 md:block"></div>
              <div className="hidden h-10 w-24 animate-pulse rounded bg-babalu-medium/20 md:block"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const isLoggedIn = !!session?.user;

  return (
    <header className={`bg-babalu-primary text-babalu-medium transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <Image
                src="/img/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <span className="hidden text-lg font-bold sm:inline">
              Babalu Aye Reiki & Tarot
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="/#" className="hover:text-orange-200 transition-colors">
              Inicio
            </a>
            <a
              href="/productos"
              className="hover:text-orange-200 transition-colors"
            >
              Productos
            </a>
            <a
              href="/servicios"
              className="hover:text-orange-200 transition-colors"
            >
              Servicios
            </a>
            <a
              href="/mi-camino"
              className="hover:text-orange-200 transition-colors"
            >
              Mi Camino
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-babalu-medium/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium md:hidden"
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

            <div className="flex items-center space-x-1">
              <Globe aria-hidden="true" className="h-4 w-4" />
              <span className="text-sm">ES</span>
            </div>

            {isLoggedIn ? (
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
              <Link href="/iniciar-sesion">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#FBE9E7] text-babalu-medium border-babalu-medium hover:bg-[#FBE9E7]/80 transition-colors"
                >
                  <User className="w-4 h-4 mr-1" />
                  Ingresar
                </Button>
              </Link>
            )}
          </div>
        </div>

        <nav
          id="mobile-navigation"
          aria-label="Navegación móvil"
          className={`${isMobileMenuOpen ? "block" : "hidden"} mt-3 border-t border-babalu-medium/20 pt-3 md:hidden`}
        >
          <a
            href="/#"
            onClick={closeMobileMenu}
            className="block rounded-md px-3 py-3 hover:bg-babalu-medium/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium"
          >
            Inicio
          </a>
          <a
            href="/productos"
            onClick={closeMobileMenu}
            className="block rounded-md px-3 py-3 hover:bg-babalu-medium/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium"
          >
            Productos
          </a>
          <a
            href="/servicios"
            onClick={closeMobileMenu}
            className="block rounded-md px-3 py-3 hover:bg-babalu-medium/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium"
          >
            Servicios
          </a>
          <a
            href="/mi-camino"
            onClick={closeMobileMenu}
            className="block rounded-md px-3 py-3 hover:bg-babalu-medium/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-medium"
          >
            Mi Camino
          </a>
        </nav>
      </div>
    </header>
  );
}
