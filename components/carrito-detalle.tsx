"use client"

import { Button } from "./ui/button"
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Tag, Package } from "lucide-react"
import Image from "next/image"
import { CartItem } from "app/types/cart" // Importa la interfaz compartida

interface CarritoDetalleProps {
  items?: CartItem[] // Usa la interfaz compartida
  totalItems?: number
  subtotal?: number
  iva?: number
  envio?: number
  total?: number
  onUpdateQuantity?: (id: number, quantity: number) => void
  onRemoveItem?: (id: number) => void
  onClearCart?: () => void
  onBack?: () => void
  onProceedToCheckout?: () => void
}

export function CarritoDetalle({
  items = [],
  totalItems = 0,
  subtotal = 0,
  iva = 0,
  envio = 0,
  total = 0,
  onUpdateQuantity = () => {},
  onRemoveItem = () => {},
  onClearCart = () => {},
  onBack = () => {},
  onProceedToCheckout = () => {},
}: CarritoDetalleProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  // Si no hay items, mostrar estado vacío
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={onBack} className="mb-4 hover:bg-gray-100 transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-8 h-8 text-babalu-primary" />
              <h1 className="text-4xl font-bold text-gray-900">Mi Carrito</h1>
            </div>
            <p className="text-gray-600">Tu carrito está vacío</p>
          </div>

          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No hay productos en tu carrito</h2>
            <p className="text-gray-600 mb-8">Agrega algunos productos para comenzar</p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-babalu-primary to-babalu-dark hover:shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              Explorar Productos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4 hover:bg-gray-100 transition-all duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-babalu-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Mi Carrito</h1>
          </div>
          <p className="text-gray-600">
            {totalItems} {totalItems === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List Container */}
          <div className="lg:col-span-2">
            {/* Contenedor diferenciado para los productos */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl shadow-sm border border-blue-100/50 p-6 mb-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-babalu-primary" />
                  Productos en el carrito
                </h2>
                <span className="bg-babalu-primary/10 text-babalu-primary px-3 py-1 rounded-full text-sm font-medium">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md border border-blue-100/50 p-4 transition-all duration-300 hover:bg-white"
                  >
                    <div className="flex gap-4">
                      {/* Image - Más pequeña */}
                      <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        <Image 
                          src={item.image || "/placeholder.svg"} 
                          alt={item.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                            <div className="flex items-center gap-2">
                              <Tag className="w-3 h-3 text-babalu-primary" />
                              <p className="text-xl font-bold text-babalu-primary">{formatPrice(item.price)}</p>
                              <span className="text-xs text-gray-500">c/u</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Quantity and Subtotal */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 font-medium">Cantidad:</span>
                            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 p-0 hover:bg-babalu-primary/10 hover:text-babalu-primary transition-all duration-200"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>

                              <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 p-0 hover:bg-babalu-primary/10 hover:text-babalu-primary transition-all duration-200"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-600 mb-1">Subtotal</p>
                            <p className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Cart Button */}
            {items.length > 0 && (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 bg-transparent"
                onClick={onClearCart}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vaciar Carrito
              </Button>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-babalu-primary" />
                Resumen del Pedido
              </h2>

              <div className="space-y-4 py-4 border-y border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal ({totalItems} productos)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">IVA (21%)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(iva)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-semibold text-gray-900">
                    {envio === 0 ? <span className="text-green-600 font-bold">¡GRATIS!</span> : formatPrice(envio)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-babalu-primary">{formatPrice(total)}</span>
              </div>

              {/* Free Shipping Alert */}
              {envio > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">¡Estás cerca!</span> Agrega {formatPrice(5000 - subtotal)} más para
                    obtener envío gratis
                  </p>
                </div>
              )}

              {envio === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-semibold">✓ Envío gratis en este pedido</p>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-babalu-primary to-babalu-dark hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] text-white font-bold py-6 text-lg"
                onClick={onProceedToCheckout}
              >
                Proceder al Pago
              </Button>

              {/* Security Badges */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-lg">✓</span>
                  </div>
                  <span>Compra 100% segura</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-lg">✓</span>
                  </div>
                  <span>Devolución gratuita en 30 días</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-lg">✓</span>
                  </div>
                  <span>Garantía de satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}