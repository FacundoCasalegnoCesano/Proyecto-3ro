// app/components/user-dropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Briefcase,
  ShoppingBag,
} from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface UserDropdownProps {
  user: {
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
  onLogout: () => void;
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // ✅ DEBUG: Ver qué datos llegan
  console.log("UserDropdown - user:", user);
  console.log("UserDropdown - session:", session);

  // ✅ Verificar si el usuario es admin
  const isAdmin = user.rol === "admin";
  console.log("UserDropdown - isAdmin:", isAdmin, "rol:", user.rol);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push("/configuracion");
  };

  const handleOrders = () => {
    setIsOpen(false);
    router.push("/admin/ordenes");
  };

  const handleBrands = () => {
    setIsOpen(false);
    router.push("/admin/marcas");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de usuario - Solo muestra el nombre */}
      <Button
        variant="outline"
        size="sm"
        className="bg-[#FBE9E7] text-babalu-medium border-babalu-medium hover:bg-[#FBE9E7]/80 flex items-center space-x-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-6 h-6 bg-babalu-primary rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="hidden md:block text-sm font-medium">
          {user.nombre || "Usuario"} {/* ✅ Fallback por si no hay nombre */}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Información del usuario */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-babalu-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">Rol: {user.rol}</p>{" "}
                {/* ✅ DEBUG */}
              </div>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="py-1">
            <button
              onClick={handleSettings}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-400" />
              Configuración
            </button>
            {/* ✅ Opciones de Admin - Solo visibles para admins */}
            {isAdmin && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleOrders}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 mr-3 text-babalu-primary" />
                  Órdenes de Compra
                </button>

                <button
                  onClick={handleBrands}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Briefcase className="w-4 h-4 mr-3 text-babalu-primary" />
                  Solicitudes de Marcas
                </button>
              </>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-400" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
