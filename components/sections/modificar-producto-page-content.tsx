"use client"

import { ModificarProductoForm } from "components/modificar-producto-form"
import { useSearchParams } from "next/navigation"

export function ModificarProductoPageContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Modificar Producto</h1>
          <p className="mt-2 text-sm text-gray-600">Actualiza la información del producto seleccionado</p>
        </div>

        {/* Formulario de modificar producto */}
        <ModificarProductoForm productId={productId || undefined} />
      </div>
    </div>
  )
}
