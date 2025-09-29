"use client";

import { StockProductos } from "components/stock-productos";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AdminAgregarProducto } from "components/admin-agregar-producto";

export function StockPageContent() {
  const handleGoBack = () => {
    window.location.href = "/productos";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón de volver */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Stock
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Administra el inventario y stock de todos tus productos
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 bg-white border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Productos</span>
          </Button>
        </div>

        {/* Componente AdminAgregarProducto - Solo visible para admins */}
        <div className="container mx-auto px-4 py-4 mb-6">
          <AdminAgregarProducto />
        </div>

        {/* Componente Stock de Productos */}
        <StockProductos />
      </div>
    </div>
  );
}
