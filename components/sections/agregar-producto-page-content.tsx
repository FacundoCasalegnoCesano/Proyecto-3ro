"use client";

import { AgregarProductoForm } from "components/agregar-producto-form";

export function AgregarProductoPageContent() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Agregar Nuevo Producto
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Completa la información del producto para agregarlo a tu catálogo
          </p>
        </div>

        {/* Formulario de agregar producto */}
        <AgregarProductoForm />
      </div>
    </div>
  );
}
