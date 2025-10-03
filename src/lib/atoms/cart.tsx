"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { fetchGraphQL } from "@/shopify/client";
import { GET_CART, CREATE_CART, ADD_TO_CART, UPDATE_CART_ITEMS, REMOVE_FROM_CART } from "@/graphql/cart";

interface Money {
  amount: string;
  currencyCode: string;
}

interface CartCost {
  subtotalAmount: Money;
  totalAmount: Money;
  totalTaxAmount?: Money;
}

interface CartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      images: {
        edges: Array<{
          node: {
            url: string;
            altText?: string;
          };
        }>;
      };
    };
  };
}

interface Cart {
  id: string;
  checkoutUrl: string;
  cost: CartCost;
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
  totalQuantity: number;
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

interface CartContextType extends CartState {
  initializeCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "shopify:cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({
    cart: null,
    loading: false,
    error: null
  });
  const initialized = useRef(false);

  const fetchCart = async (cartId: string) => {
    try {
      const data = await fetchGraphQL(GET_CART, { cartId });
      if (data?.cart) {
        setState(prev => ({ ...prev, cart: data.cart, loading: false }));
        return data.cart;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      return null;
    }
  };

  const initializeCart = useCallback(async () => {
    if (initialized.current) return;
    
    setState(prev => ({ ...prev, loading: true }));
    const storedId = localStorage.getItem(CART_ID_KEY);

    if (storedId) {
      const cart = await fetchCart(storedId);
      if (cart) {
        initialized.current = true;
        return;
      }
      localStorage.removeItem(CART_ID_KEY);
    }

    try {
      const result = await fetchGraphQL(CREATE_CART, { input: {} });
      const cart = result?.cartCreate?.cart;
      if (cart?.id) {
        localStorage.setItem(CART_ID_KEY, cart.id);
        setState(prev => ({ ...prev, cart, loading: false }));
        initialized.current = true;
      }
    } catch (err) {
      console.log(err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to create cart"
      }));
    }
  }, []);

  const addItem = async (variantId: string, quantity = 1) => {
    if (!state.cart?.id) {
      await initializeCart();
      if (!state.cart?.id) throw new Error("Could not initialize cart");
    }

    // Optimistic update
    setState(prev => ({
      ...prev,
      cart: prev.cart ? {
        ...prev.cart,
        totalQuantity: (prev.cart.totalQuantity || 0) + quantity,
        lines: {
          edges: [
            ...prev.cart.lines.edges,
            {
              node: {
                id: `temp-${variantId}`,
                quantity,
                cost: { totalAmount: { amount: "0", currencyCode: "USD" } },
                merchandise: {
                  id: variantId,
                  title: "Loading...",
                  product: {
                    title: "Loading...",
                    images: { edges: [] }
                  }
                }
              }
            }
          ]
        }
      } : null
    }));

    try {
      const result = await fetchGraphQL(ADD_TO_CART, {
        cartId: state.cart.id,
        lines: [{ merchandiseId: variantId, quantity }],
      });

      const cart = result?.cartLinesAdd?.cart;
      if (!cart) throw new Error("Failed to add item to cart");

      setState(prev => ({ ...prev, cart, error: null }));
    } catch (err) {
      // Revert optimistic update on error
          console.log(err);
      await fetchCart(state.cart.id);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to add item",
      }));
    }
  };

  const updateItem = async (lineId: string, quantity: number) => {
    if (!state.cart?.id) throw new Error("No active cart");

    // Optimistic update
    setState(prev => ({
      ...prev,
      cart: prev.cart ? {
        ...prev.cart,
        totalQuantity: prev.cart.lines.edges.reduce((total, { node }) => 
          total + (node.id === lineId ? quantity : node.quantity), 0),
        lines: {
          ...prev.cart.lines,
          edges: prev.cart.lines.edges.map(edge => 
            edge.node.id === lineId 
              ? { ...edge, node: { ...edge.node, quantity } }
              : edge
          )
        }
      } : null
    }));

    try {
      const result = await fetchGraphQL(UPDATE_CART_ITEMS, {
        cartId: state.cart.id,
        lines: [{ id: lineId, quantity }],
      });

      const cart = result?.cartLinesUpdate?.cart;
      if (!cart) throw new Error("Failed to update cart");

      setState(prev => ({ ...prev, cart, error: null }));
    } catch (err) {
      // Revert optimistic update on error
          console.log(err);
      await fetchCart(state.cart.id);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to update item",
      }));
    }
  };

  const removeItem = async (lineId: string) => {
    if (!state.cart?.id) throw new Error("No active cart");

    // Optimistic update
    setState(prev => ({
      ...prev,
      cart: prev.cart ? {
        ...prev.cart,
        totalQuantity: prev.cart.lines.edges.reduce((total, { node }) => 
          node.id === lineId ? total : total + node.quantity, 0),
        lines: {
          ...prev.cart.lines,
          edges: prev.cart.lines.edges.filter(edge => edge.node.id !== lineId)
        }
      } : null
    }));

    try {
      const result = await fetchGraphQL(REMOVE_FROM_CART, {
        cartId: state.cart.id,
        lineIds: [lineId],
      });

      const cart = result?.cartLinesRemove?.cart;
      if (!cart) throw new Error("Failed to remove item");

      setState(prev => ({ ...prev, cart, error: null }));
    } catch (err) {
      // Revert optimistic update on error
      console.log(err);
      await fetchCart(state.cart.id);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to remove item",
      }));
    }
  };

  const clearCart = () => {
    localStorage.removeItem(CART_ID_KEY);
    setState({ cart: null, loading: false, error: null });
  };

  // Run initialization only once on mount
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
