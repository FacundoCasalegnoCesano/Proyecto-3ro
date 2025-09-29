"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Plus, Package } from "lucide-react";

interface AgregarProductoProps {
  onAddProduct?: () => void;
  className?: string;
}

export function AgregarProducto({
  onAddProduct,
  className = "",
}: AgregarProductoProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProduct = async () => {
    setIsLoading(true);

    try {
      if (onAddProduct) {
        onAddProduct();
      } else {
        // Redirigir a la página de agregar producto por defecto
        window.location.href = "/productos/agregar";
      }
    } catch (error) {
      console.error("Error al agregar producto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-babalu-primary/10 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-babalu-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Agregar Nuevo Producto
          </h3>
          <p className="text-sm text-gray-600">Añade productos a tu catálogo</p>
        </div>
      </div>

      <Button
        onClick={handleAddProduct}
        disabled={isLoading}
        className="bg-babalu-primary hover:bg-babalu-dark text-white px-6 py-2 flex items-center space-x-2 transition-all duration-200 hover:scale-105"
      >
        <Plus className="w-4 h-4" />
        <span>{isLoading ? "Cargando..." : "Agregar Producto"}</span>
      </Button>
    </div>
  );
}
