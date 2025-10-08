// hooks/useCartModal.ts
"use client"

import { useCart } from "contexts/cart-context"

export function useCartModal() {
  const { 
    state, 
    toggleCart, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCart()

  return {
    isOpen: state.isOpen,
    items: state.items,
    totalPrice: getTotalPrice(),
    totalItems: getTotalItems(),
    onClose: toggleCart,
    onUpdateQuantity: updateQuantity,
    onRemoveItem: removeItem,
    onClearCart: clearCart,
    onViewFullCart: () => {
      // Navegar a la página del carrito completo
      window.location.href = "/carrito"
    }
  }
}