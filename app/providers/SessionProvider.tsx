// app/providers/SessionProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "contexts/cart-context";
import { CartModal } from "components/cart-modal";
import { ReactNode } from "react";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <CartModal />
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
          duration={3000}
        />
      </CartProvider>
    </SessionProvider>
  );
}
