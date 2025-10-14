// components/resumen-compra.tsx
"use client"

import Image from "next/image"
import { Package, Truck, CreditCard } from "lucide-react"
import { CartItem } from "app/types/cart"

interface ShippingOption {
  carrier: string
  service: string
  price: number
  deliveryDays: number
  estimatedDate: string
}

interface ResumenCompraProps {
  items: CartItem[]
  totalPrice: number
  shippingOption?: ShippingOption | null
}

export function ResumenCompra({ items, totalPrice, shippingOption }: ResumenCompraProps) {
  const shippingCost = shippingOption?.price || 0
  const tax = totalPrice * 0.21 // IVA 21%
  const finalTotal = totalPrice + shippingCost + tax

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  // Función para generar keys únicas
  const getUniqueKey = (item: CartItem, index: number) => {
    return `${item.id}-${item.quantity}-${index}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
      <div className="flex items-center space-x-2 mb-6">
        <Package className="w-5 h-5 text-babalu-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Resumen del Pedido</h3>
      </div>

      {/* Items del carrito */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <div 
            key={getUniqueKey(item, index)} // Key única que incluye id, cantidad e índice
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={48}
                height={48}
                sizes="48px"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
              <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="space-y-3 py-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <Truck className="w-4 h-4 mr-1" />
            Envío
          </span>
          {shippingOption ? (
            <div className="text-right">
              <span className="font-medium text-gray-900">{formatPrice(shippingCost)}</span>
              <p className="text-xs text-gray-500">{shippingOption.carrier} - {shippingOption.service}</p>
            </div>
          ) : (
            <span className="text-gray-500 text-xs">A calcular</span>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">IVA (21%)</span>
          <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
        </div>

        <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
          <span className="text-gray-900">Total</span>
          <span className="text-babalu-primary">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Información de envío (si está seleccionado) */}
      {shippingOption && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Entrega estimada:</strong> {shippingOption.deliveryDays} días hábiles
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Fecha aproximada: {shippingOption.estimatedDate}
          </p>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CreditCard className="w-4 h-4" />
          <span>Pago seguro con SSL</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Package className="w-4 h-4" />
          <span>Garantía de satisfacción</span>
        </div>
      </div>

      {/* Contacto de soporte */}
      <div className="mt-6 p-4 bg-babalu-primary/10 rounded-lg">
        <h4 className="text-sm font-medium text-babalu-primary mb-2">¿Necesitas ayuda?</h4>
        <p className="text-xs text-gray-600 mb-2">Contáctanos si tienes alguna duda sobre tu pedido</p>
        <div className="space-y-1 text-xs text-gray-600">
          <p>📧 hola@babalu.com</p>
          <p>📱 +54 11 1234-5678</p>
        </div>
      </div>
    </div>
  )
}