"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { cartRepository } from "@/lib/api/repositories/cart";

interface CartState {
  cart: any | null;
  loading: boolean;
  error: string | null;
}

interface CartContextType extends CartState {
  initializeCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "up:cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({
    cart: null,
    loading: false,
    error: null,
  });
  const initialized = useRef(false);

  const fetchCart = async (cartId: string) => {
    try {
      const data = await cartRepository.get(cartId);
      if (data?.id) {
        setState((prev) => ({ ...prev, cart: data, loading: false }));
        return data;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      return null;
    }
  };

  const initializeCart = useCallback(async () => {
    if (initialized.current) return;

    setState((prev) => ({ ...prev, loading: true }));
    const storedId = typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null;

    if (storedId) {
      const cart = await fetchCart(storedId);
      if (cart) {
        initialized.current = true;
        return;
      }
      localStorage.removeItem(CART_ID_KEY);
    }

    try {
      const cart = await cartRepository.create();
      if (cart?.id) {
        localStorage.setItem(CART_ID_KEY, cart.id);
        setState((prev) => ({ ...prev, cart, loading: false }));
        initialized.current = true;
      }
    } catch (err) {
      console.log(err);
      setState((prev) => ({ ...prev, loading: false, error: "Failed to create cart" }));
    }
  }, []);

  const addItem = async (productId: string, quantity = 1, variantId?: string) => {
    if (!state.cart?.id) {
      await initializeCart();
      if (!state.cart?.id) throw new Error("Could not initialize cart");
    }

    try {
      await cartRepository.addLine(state.cart.id, { productId, variantId, quantity });
      await fetchCart(state.cart.id);
      setState((prev) => ({ ...prev, error: null }));
    } catch (err) {
      await fetchCart(state.cart.id);
      setState((prev) => ({ ...prev, error: err instanceof Error ? err.message : "Failed to add item" }));
    }
  };

  const updateItem = async (lineId: string, quantity: number) => {
    if (!state.cart?.id) throw new Error("No active cart");
    try {
      await cartRepository.updateLine(state.cart.id, lineId, quantity);
      await fetchCart(state.cart.id);
      setState((prev) => ({ ...prev, error: null }));
    } catch (err) {
      await fetchCart(state.cart.id);
      setState((prev) => ({ ...prev, error: err instanceof Error ? err.message : "Failed to update item" }));
    }
  };

  const removeItem = async (lineId: string) => {
    if (!state.cart?.id) throw new Error("No active cart");
    try {
      await cartRepository.removeLine(state.cart.id, lineId);
      await fetchCart(state.cart.id);
      setState((prev) => ({ ...prev, error: null }));
    } catch (err) {
      await fetchCart(state.cart.id);
      setState((prev) => ({ ...prev, error: err instanceof Error ? err.message : "Failed to remove item" }));
    }
  };

  const clearCart = () => {
    if (typeof window !== "undefined") localStorage.removeItem(CART_ID_KEY);
    setState({ cart: null, loading: false, error: null });
  };

  useEffect(() => {
    if (!initialized.current) {
      initializeCart();
    }
  }, [initializeCart]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        initializeCart,
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
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
