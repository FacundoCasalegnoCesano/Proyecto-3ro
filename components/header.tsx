// components/Header.tsx
"use client";

import { Button } from "../components/ui/button";
import { Globe, User, ShoppingCart } from "lucide-react";
import { useCart } from "../contexts/cart-context";
import Image from "next/image";
import { UserDropdown } from "./user-dropdown";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { toggleCart, getTotalItems, getTotalPrice } = useCart();
  const { data: session, status } = useSession();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <header className="bg-babalu-primary text-babalu-medium">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo y navegación con skeleton loading */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-babalu-medium/20 rounded-full animate-pulse"></div>
              <div className="w-32 h-6 bg-babalu-medium/20 rounded animate-pulse"></div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-6 bg-babalu-medium/20 rounded animate-pulse"></div>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-6 bg-babalu-medium/20 rounded animate-pulse"></div>
              <div className="w-20 h-10 bg-babalu-medium/20 rounded animate-pulse"></div>
              <div className="w-24 h-10 bg-babalu-medium/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const isLoggedIn = !!session?.user;

  return (
    <header className="bg-babalu-primary text-babalu-medium">
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
            <span className="font-bold text-lg">Babalu Aye Reiki & Tarot</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="/#" className="hover:text-orange-200 transition-colors">
              Inicio
            </a>
            <a href="/productos" className="hover:text-orange-200 transition-colors">
              Productos
            </a>
            <a href="/servicios" className="hover:text-orange-200 transition-colors">
              Servicios
            </a>
            <a href="/mi-camino" className="hover:text-orange-200 transition-colors">
              Mi Camino
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm">ES</span>
            </div>

            {/* Carrito de Compras */}
            <Button
              variant="outline"
              size="sm"
              className="relative bg-[#FBE9E7] text-babalu-medium border-babalu-medium"
              onClick={toggleCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                ${totalPrice.toFixed(2)}
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>

            {isLoggedIn ? (
              <UserDropdown 
                user={{
                  firstName: session.user.nombre || "Usuario",
                  lastName: session.user.apellido || "",
                  email: session.user.email || ""
                }} 
                onLogout={() => signOut({ callbackUrl: "/" })} 
              />
            ) : (
              <Link href="/iniciar-sesion">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#FBE9E7] text-babalu-medium border-babalu-medium hover:bg-[#FBE9E7]/80"
                >
                  <User className="w-4 h-4 mr-1" />
                  Ingresar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}