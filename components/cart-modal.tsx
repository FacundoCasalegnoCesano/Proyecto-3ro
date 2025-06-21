"use client"

import { useCart } from "../contexts/cart-context"
import { Button } from "../components/ui/button"
import { X, Plus, Minus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

export function CartModal() {
  const { state, closeCart, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart()
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (state.isOpen) {
      setIsVisible(true)
      // Pequeño delay para permitir que el elemento se monte antes de la animación
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      // Esperar a que termine la animación antes de ocultar
      setTimeout(() => setIsVisible(false), 400)
    }
  }, [state.isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      closeCart()
    }, 400)
  }

  if (!isVisible) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-all duration-400 ease-out ${
        isAnimating ? "bg-opacity-50 backdrop-blur-sm" : "bg-opacity-0"
      } flex justify-end`}
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl transform transition-all duration-400 ease-out ${
          isAnimating ? "translate-x-0 scale-100 opacity-100" : "translate-x-full scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b bg-babalu-primary text-white transform transition-all duration-500 ease-out ${
            isAnimating ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <h2 className="text-lg font-bold">Mi Carrito</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/10 transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            <div
              className={`flex-1 flex items-center justify-center p-8 transform transition-all duration-600 ease-out ${
                isAnimating ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
              }`}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-700 ease-out hover:scale-110">
                  <span className="text-2xl">🛒</span>
                </div>
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <Button
                  onClick={handleClose}
                  className="bg-babalu-primary hover:bg-babalu-dark transform transition-all duration-200 hover:scale-105"
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 p-4 space-y-4">
                {state.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center space-x-3 bg-gray-50 p-3 rounded-lg transform transition-all duration-500 ease-out hover:shadow-md hover:scale-[1.02] ${
                      isAnimating ? "translate-x-0 opacity-100 scale-100" : "translate-x-8 opacity-0 scale-95"
                    }`}
                    style={{
                      transitionDelay: isAnimating ? `${index * 150 + 200}ms` : "0ms",
                    }}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 transform transition-transform duration-300 hover:scale-105">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-800 truncate">{item.name}</h3>
                      <p className="text-babalu-primary font-bold">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 p-0 hover:bg-babalu-primary/10 transform transition-all duration-200 hover:scale-110"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>

                      <span className="w-8 text-center font-medium transition-all duration-300">{item.quantity}</span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 p-0 hover:bg-babalu-primary/10 transform transition-all duration-200 hover:scale-110"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transform transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className={`border-t p-4 space-y-4 transform transition-all duration-600 ease-out ${
                  isAnimating ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{
                  transitionDelay: isAnimating ? `${state.items.length * 150 + 400}ms` : "0ms",
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-xl text-babalu-primary transition-all duration-300">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-babalu-primary hover:bg-babalu-dark transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => {
                      // Aquí iría la lógica de checkout
                      alert("Ir a checkout")
                    }}
                  >
                    Proceder al Pago
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02]"
                    onClick={clearCart}
                  >
                    Vaciar Carrito
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
