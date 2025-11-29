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
      setState({ cart: response.data, loading: false, error: null });
    } catch (err) {
      console.error("❌ Failed to fetch cart:", err);
      setState(prev => ({ ...prev, loading: false, error: "Failed to fetch cart" }));
    }
  }, []);

  /** ➕ Add item */
  const addItem = useCallback(
    async (productId: string, quantity = 1, variantId?: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await cartAPI.addItem({ productId, quantity, variantId });
        setState({ cart: result.data, loading: false, error: null });
      } catch (err) {
        console.error("❌ Failed to add item:", err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to add item to cart",
        }));
        // Refresh cart to ensure consistent state
        await fetchCart();
      }
    },
    [fetchCart]
  );

  /** ✏️ Update item */
  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await cartAPI.updateItem(lineId, { quantity });
        console.log('✅ Item updated, response:', result.data);
        setState({ cart: result.data, loading: false, error: null });
      } catch (err) {
        console.error("❌ Failed to update item:", err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to update item in cart",
        }));
      }
    },
    []
  );

  /** ❌ Remove item */
  const removeItem = useCallback(
    async (lineId: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await cartAPI.removeItem(lineId);
        console.log('✅ Item removed, response:', result.data);
        setState({ cart: result.data, loading: false, error: null });
      } catch (err) {
        console.error("❌ Failed to remove item:", err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to remove item from cart",
        }));
      }
    },
    []
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
