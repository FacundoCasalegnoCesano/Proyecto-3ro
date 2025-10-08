"use client"

import { createContext, useContext, useReducer, type ReactNode, useEffect } from "react"
import { CartItem } from "app/types/cart"

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }

interface CartContextType {
  state: CartState
  addItem: (item: CartItem) => Promise<void>
  removeItem: (id: number) => Promise<void>
  updateQuantity: (id: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_ITEMS":
      return { ...state, items: action.payload, isLoading: false }

    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id 
              ? { ...item, quantity: item.quantity + action.payload.quantity } 
              : item
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      }
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }

    case "UPDATE_QUANTITY": {
      const newQuantity = action.payload.quantity
      if (newQuantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id 
            ? { ...item, quantity: newQuantity } 
            : item
        ),
      }
    }

    case "CLEAR_CART":
      return { ...state, items: [] }

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen }

    case "OPEN_CART":
      return { ...state, isOpen: true }

    case "CLOSE_CART":
      return { ...state, isOpen: false }

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  isLoading: true
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Cargar carrito desde la base de datos al inicializar
  useEffect(() => {
    refreshCart()
  }, [])

  const refreshCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const response = await fetch('/api/cart')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          dispatch({ type: "SET_ITEMS", payload: result.data })
        }
      }
    } catch (error) {
      console.error('❌ Error cargando carrito:', error)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const addItem = async (item: CartItem) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          dispatch({ type: "ADD_ITEM", payload: result.data })
        }
      }
    } catch (error) {
      console.error('❌ Error agregando item:', error)
    }
  }

  const removeItem = async (id: number) => {
    try {
      const response = await fetch(`/api/cart?productId=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        dispatch({ type: "REMOVE_ITEM", payload: id })
      }
    } catch (error) {
      console.error('❌ Error eliminando item:', error)
    }
  }

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: id,
          quantity: quantity
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (result.data) {
            dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
          } else {
            // Item fue eliminado (quantity = 0)
            dispatch({ type: "REMOVE_ITEM", payload: id })
          }
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando cantidad:', error)
    }
  }

  const clearCart = async () => {
    try {
      // Implementar limpieza del carrito en la API si es necesario
      dispatch({ type: "CLEAR_CART" })
    } catch (error) {
      console.error('❌ Error limpiando carrito:', error)
    }
  }

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" })
  }

  const openCart = () => {
    dispatch({ type: "OPEN_CART" })
  }

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" })
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getTotalPrice,
        getTotalItems,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}