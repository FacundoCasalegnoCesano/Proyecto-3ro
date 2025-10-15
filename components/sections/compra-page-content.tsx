// sections/compra-page-content.tsx
"use client";

import { CompraWizard } from "components/compra/CompraWizard";
import { useCart } from "../../contexts/cart-context";
import { useAuthStatus } from "app/hooks/useAuthStatus";
import { useEffect } from "react";

export function CompraPageContent() {
  const { getTotalItems } = useCart();
  const { isLoggedIn, isLoading: authLoading } = useAuthStatus();

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (getTotalItems() === 0) {
      alert("Tu carrito está vacío. Serás redirigido a la tienda.");
      window.location.href = "/productos";
    }
  }, [getTotalItems]);

  // Redirigir si no está logueado
  useEffect(() => {
    if (!authLoading && isLoggedIn() === false) {
      alert("Debes iniciar sesión para realizar una compra.");
      window.location.href = "/iniciar-sesion";
    }
  }, [isLoggedIn, authLoading]);

  if (getTotalItems() === 0 || authLoading || isLoggedIn() === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-babalu-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
          <p className="mt-2 text-sm text-gray-600">
            Completa tu información para procesar el pago de forma segura
          </p>
        </div>

        {/* CompraWizard ahora maneja su propio layout con ResumenCompra */}
        <CompraWizard />
      </div>
    </div>
  );
}
