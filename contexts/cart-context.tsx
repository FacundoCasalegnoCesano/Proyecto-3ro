// contexts/cart-context.tsx
"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  useEffect,
} from "react";
import { CartItem } from "app/types/cart";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
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
  | { type: "CLOSE_CART" };

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

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ITEMS":
      // Filtrar duplicados al cargar items
      const uniqueItems = action.payload.filter(
        (item, index, self) => index === self.findIndex((i) => i.id === item.id)
      );
      return { ...state, items: uniqueItems, isLoading: false };

    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex > -1) {
        // Si ya existe, actualizar la cantidad
        const updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return { ...state, items: updatedItems };
      } else {
        // Si no existe, agregar nuevo item
        return { ...state, items: [...state.items, action.payload] };
      }
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== id),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "OPEN_CART":
      return { ...state, isOpen: true };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  isOpen: false,
  isLoading: true,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde la base de datos al inicializar
  useEffect(() => {
    refreshCart();
  }, []);

  const refreshCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch("/api/cart");

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          dispatch({ type: "SET_ITEMS", payload: result.data });
        }
      }
    } catch (error) {
      console.error("❌ Error cargando carrito:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Función para mostrar toast de éxito
  const mostrarToastSuccess = (mensaje: string) => {
    // Reemplaza con tu implementación de toast
    console.log("✅", mensaje);
    if (typeof window !== "undefined" && (window as any).toast) {
      (window as any).toast.success(mensaje);
    }
  };

  // Función para mostrar toast de error
  const mostrarToastError = (mensaje: string) => {
    // Reemplaza con tu implementación de toast
    console.log("❌", mensaje);
    if (typeof window !== "undefined" && (window as any).toast) {
      (window as any).toast.error(mensaje);
    }
  };

  const addItem = async (item: CartItem) => {
    try {
      // VERIFICAR STOCK ANTES DE AGREGAR
      const stockResponse = await fetch(`/api/productos?id=${item.id}`);
      if (stockResponse.ok) {
        const stockResult = await stockResponse.json();
        if (stockResult.success) {
          const producto = stockResult.data;

          // Verificar stock disponible
          const itemExistente = state.items.find((i) => i.id === item.id);
          const cantidadEnCarrito = itemExistente ? itemExistente.quantity : 0;
          const cantidadTotalSolicitada = cantidadEnCarrito + item.quantity;

          if (cantidadTotalSolicitada > producto.stock) {
            const disponible = producto.stock - cantidadEnCarrito;
            const nombreCompleto = `${producto.name}${
              producto.linea ? ` (${producto.linea}` : ""
            }${producto.aroma ? ` - ${producto.aroma}` : ""}${
              producto.linea ? ")" : ""
            }`;

            mostrarToastError(
              `Stock insuficiente para: ${nombreCompleto} - Solicitado: ${
                item.quantity
              }, Disponible: ${disponible > 0 ? disponible : 0}`
            );
            return;
          }
        }
      }

      // Si hay stock, proceder con la adición
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          dispatch({ type: "ADD_ITEM", payload: result.data });
          const nombreCompleto = `${item.name}${
            item.linea ? ` (${item.linea}` : ""
          }${item.aroma ? ` - ${item.aroma}` : ""}${item.linea ? ")" : ""}`;
          mostrarToastSuccess(`${nombreCompleto} agregado al carrito`);
        }
      } else {
        const errorResult = await response.json();
        mostrarToastError(
          errorResult.error || "Error al agregar producto al carrito"
        );
      }
    } catch (error) {
      console.error("❌ Error agregando item:", error);
      mostrarToastError("Error al agregar producto al carrito");
    }
  };

  const removeItem = async (id: number) => {
    try {
      const response = await fetch(`/api/cart?productId=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        dispatch({ type: "REMOVE_ITEM", payload: id });
        mostrarToastSuccess("Producto eliminado del carrito");
      }
    } catch (error) {
      console.error("❌ Error eliminando item:", error);
      mostrarToastError("Error al eliminar producto del carrito");
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      // VERIFICAR STOCK ANTES DE ACTUALIZAR
      if (quantity > 0) {
        const stockResponse = await fetch(`/api/productos?id=${id}`);
        if (stockResponse.ok) {
          const stockResult = await stockResponse.json();
          if (stockResult.success) {
            const producto = stockResult.data;

            if (quantity > producto.stock) {
              const itemExistente = state.items.find((i) => i.id === id);
              const nombreCompleto = `${producto.name}${
                producto.linea ? ` (${producto.linea}` : ""
              }${producto.aroma ? ` - ${producto.aroma}` : ""}${
                producto.linea ? ")" : ""
              }`;
              mostrarToastError(
                `Stock insuficiente para: ${nombreCompleto} - Máximo disponible: ${producto.stock}`
              );
              return;
            }
          }
        }
      }

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (result.data) {
            dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
          } else {
            // Item fue eliminado (quantity = 0)
            dispatch({ type: "REMOVE_ITEM", payload: id });
          }
        }
      } else {
        const errorResult = await response.json();
        mostrarToastError(errorResult.error || "Error al actualizar cantidad");
      }
    } catch (error) {
      console.error("❌ Error actualizando cantidad:", error);
      mostrarToastError("Error al actualizar cantidad");
    }
  };

  const clearCart = async () => {
    try {
      // Implementar limpieza del carrito en la API si es necesario
      dispatch({ type: "CLEAR_CART" });
      mostrarToastSuccess("Carrito vaciado");
    } catch (error) {
      console.error("❌ Error limpiando carrito:", error);
      mostrarToastError("Error al vaciar el carrito");
    }
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const openCart = () => {
    dispatch({ type: "OPEN_CART" });
  };

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  const getTotalPrice = () => {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

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
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
