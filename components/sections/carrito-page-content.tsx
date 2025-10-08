// components/sections/carrito-page-content.tsx
"use client"

import { PageLayout } from "../layout/page-layout"
import { CarritoDetalle } from "components/carrito-detalle"
import { useCart } from "../../contexts/cart-context"
import { useRouter } from "next/navigation"

export function CarritoPageContent() {
  const { 
    state, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCart()
  
  const router = useRouter()

  // Asegurarse de que items siempre sea un array
  const items = state?.items || []
  const totalItems = getTotalItems()
  const subtotal = getTotalPrice()
  const iva = subtotal * 0.21
  const envio = subtotal > 5000 ? 0 : 500
  const total = subtotal + iva + envio

  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateQuantity(id, quantity)
  }

  const handleRemoveItem = (id: number) => {
    removeItem(id)
  }

  const handleClearCart = () => {
    clearCart()
  }

  const handleBack = () => {
    router.back()
  }

  const handleProceedToCheckout = () => {
    router.push("/compra")
  }

  return (
    <PageLayout>
      <CarritoDetalle
        items={items}
        totalItems={totalItems}
        subtotal={subtotal}
        iva={iva}
        envio={envio}
        total={total}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onBack={handleBack}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </PageLayout>
  )
}