// components/admin-stock-manager.tsx
'use client';

import { useSession } from "next-auth/react";
import { Package } from "lucide-react";
import { Button } from "../components/ui/button"; // Corrige esta ruta

interface AdminStockManagerProps {
  onStockRedirect: () => void;
}

export function AdminStockManager({ onStockRedirect }: AdminStockManagerProps) {
  const { data: session, status } = useSession();

  // Muestra loading mientras carga la sesión
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="animate-pulse">Cargando...</div>
        </div>
      </div>
    );
  }

  // Solo muestra si el usuario es admin
  if (session?.user?.rol !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-babalu-primary/10 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-babalu-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Gestionar Stock</h3>
            <p className="text-sm text-gray-600">Ver y administrar el inventario de productos</p>
          </div>
        </div>

        <Button
          onClick={onStockRedirect}
          className="bg-babalu-primary hover:bg-babalu-dark text-white px-6 py-2 flex items-center space-x-2 transition-all duration-200 hover:scale-105"
        >
          <Package className="w-4 h-4" />
          <span>Ver Stock</span>
        </Button>
      </div>
    </div>
  );
}