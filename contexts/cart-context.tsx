"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CartItem } from "app/types/cart";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
}

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  refreshCart: () => Promise<void>;
}

const emptyCart: CartState = { items: [], isOpen: false, isLoading: false };

// Retain the provider contract for older, now-unreachable cart components.
// The public catalog does not load, persist, or mutate a cart.
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const value: CartContextType = {
    state: emptyCart,
    addItem: async () => {},
    removeItem: async () => {},
    updateQuantity: async () => {},
    clearCart: async () => {},
    toggleCart: () => {},
    openCart: () => {},
    closeCart: () => {},
    getTotalPrice: () => 0,
    getTotalItems: () => 0,
    refreshCart: async () => {},
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
