// components/cart-modal.tsx
"use client"

import { Button } from "../components/ui/button"
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from "lucide-react"
import Image from "next/image"
import { useCart } from "contexts/cart-context"

export function CartModal() {
  const {
    state,
    removeItem,
    updateQuantity,
    clearCart,
    closeCart,
    getTotalPrice,
    getTotalItems,
  } = useCart()

  const { isOpen, items } = state
  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

  const formatPrice = (price: number) => {
    const validPrice = Number(price) || 0
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(validPrice)
  }

  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateQuantity(id, quantity)
  }

  const handleRemoveItem = (id: number) => {
    removeItem(id)
  }

  const handleClearCart = () => {
    clearCart()
  }

  const handleViewFullCart = () => {
    closeCart()
    window.location.href = "/carrito"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex justify-end" onClick={closeCart}>
      <div
        className="bg-gradient-to-b from-white to-gray-50 w-full max-w-md h-full shadow-2xl transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between p-6 bg-gradient-to-r from-babalu-primary to-babalu-dark text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-babalu-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Mi Carrito</h2>
              <p className="text-xs text-white/80">
                {totalItems} {totalItems === 1 ? "producto" : "productos"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeCart}
            className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-88px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h3>
                <p className="text-gray-500 mb-6">¡Agrega productos para comenzar!</p>
                <Button
                  onClick={closeCart}
                  className="bg-gradient-to-r from-babalu-primary to-babalu-dark hover:shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  Explorar Productos
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white p-4 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                        <Image 
                          src={item.image || "/placeholder.svg"} 
                          alt={item.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">{item.name}</h3>
                        
                        {/* MOSTRAR LÍNEA Y AROMA */}
                        {(item.linea || item.aroma) && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.linea && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Línea: {item.linea}
                              </span>
                            )}
                            {item.aroma && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Aroma: {item.aroma}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-3 h-3 text-babalu-primary" />
                          <p className="text-lg font-bold text-babalu-primary">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* MOSTRAR STOCK DISPONIBLE */}
                        <div className="text-xs text-gray-500 mb-2">
                          Stock disponible: {item.stockIndividual}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0 hover:bg-babalu-primary/10 hover:text-babalu-primary transition-all duration-200"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>

                            <span className="w-10 text-center font-semibold text-sm">
                              {item.quantity}
                            </span>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0 hover:bg-babalu-primary/10 hover:text-babalu-primary transition-all duration-200"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <span className="text-xs text-gray-500 ml-auto">
                            Subtotal: {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-2 right-2 w-8 h-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transform transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-white border-t border-gray-200 p-6 space-y-4 shadow-lg">
                {/* Total */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total a pagar</p>
                    <p className="text-xs text-gray-500">{totalItems} productos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-babalu-primary">
                      {formatPrice(totalPrice)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-babalu-primary to-babalu-dark hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] text-white font-semibold py-6"
                    onClick={handleViewFullCart}
                  >
                    Ver Carrito Completo
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-gray-600 hover:bg-gray-100 transition-all duration-200"
                    onClick={handleClearCart}
                  >
                    Vaciar Carrito
                  </Button>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                  <span>Compra segura y protegida</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}