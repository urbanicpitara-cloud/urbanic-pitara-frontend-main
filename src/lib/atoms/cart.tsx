"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { cartAPI } from "@/lib/api";
import type { Cart } from "@/types/cart";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

interface CartContextType extends CartState {
  itemCount: number;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({
    cart: null,
    loading: false,
    error: null,
  });

  /** 🛒 Fetch current cart */
  const fetchCart = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await cartAPI.get();
      const cartData = response.data?.data || response.data; // handle both cases
      setState({ cart: cartData, loading: false, error: null });
    } catch (err) {
      console.error("❌ Failed to fetch cart:", err);
      setState({ cart: null, loading: false, error: "Failed to fetch cart" });
    }
  }, []);

  /** ➕ Add item */
  const addItem = useCallback(
    async (productId: string, quantity = 1, variantId?: string) => {
      try {
        await cartAPI.addItem({ productId, quantity, variantId });
        await fetchCart();
      } catch (err) {
        console.error("❌ Failed to add item:", err);
        setState((prev) => ({
          ...prev,
          error: "Failed to add item to cart",
        }));
      }
    },
    [fetchCart]
  );

  /** ✏️ Update item */
  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      try {
        await cartAPI.updateItem(lineId, { quantity });
        await fetchCart();
      } catch (err) {
        console.error("❌ Failed to update item:", err);
        setState((prev) => ({
          ...prev,
          error: "Failed to update item in cart",
        }));
      }
    },
    [fetchCart]
  );

  /** ❌ Remove item */
  const removeItem = useCallback(
    async (lineId: string) => {
      try {
        await cartAPI.removeItem(lineId);
        await fetchCart();
      } catch (err) {
        console.error("❌ Failed to remove item:", err);
        setState((prev) => ({
          ...prev,
          error: "Failed to remove item from cart",
        }));
      }
    },
    [fetchCart]
  );

  /** 🧹 Clear local cart state */
  const clearCart = useCallback(() => {
    setState({ cart: null, loading: false, error: null });
  }, []);

  /** 🧭 Auto-fetch cart on mount */
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const itemCount = state.cart?.totalQuantity ?? 0;

  return (
    <CartContext.Provider
      value={{
        ...state,
        itemCount,
        refreshCart: fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
