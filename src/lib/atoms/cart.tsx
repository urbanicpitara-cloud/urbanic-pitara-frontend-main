"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { cartAPI } from "@/lib/api";
import type { Cart } from "@/types/cart";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

interface CartOperation {
  type: 'add' | 'update' | 'remove';
  productId?: string;
  variantId?: string;
  customProductId?: string;
  quantity?: number;
  lineId?: string;
}

interface CartContextType extends CartState {
  itemCount: number;
  hasPendingOperations: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string, cartId?: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({
    cart: null,
    loading: false,
    error: null,
  });

  // Operation queue for batching
  const operationQueue = useRef<Array<CartOperation>>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimer = useRef<NodeJS.Timeout | null>(null);
  const [pendingOps, setPendingOps] = useState(0);

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

  /** 🔄 Flush batched operations */
  const flushBatch = useCallback(async () => {
    if (operationQueue.current.length === 0) return;

    const ops = [...operationQueue.current];
    operationQueue.current = [];

    // Clear both timers
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    if (maxWaitTimer.current) {
      clearTimeout(maxWaitTimer.current);
      maxWaitTimer.current = null;
    }

    // Remember the current cart state before the batch
    // const cartBeforeBatch = state.cart;

    console.log(`🔄 Flushing ${ops.length} batched operations`);

    try {
      const cartId = state.cart?.id;
      const result = await cartAPI.batch(ops, cartId);

      // CRITICAL: Only update state if:
      // 1. No new operations were queued during the batch request
      // 2. This will be the last pending operation (after we decrement)
      // This prevents the batch response from overwriting newer optimistic updates
      const willHaveNoPendingOps = (pendingOps - ops.length) === 0;

      if (operationQueue.current.length === 0 && willHaveNoPendingOps) {
        setState({ cart: result.data, loading: false, error: null });
        console.log('✅ Batch operation completed, cart state updated');
      } else {
        console.log(`⚠️ Skipping state update - queue: ${operationQueue.current.length}, pending after: ${pendingOps - ops.length}`);
      }
    } catch (err) {
      console.error('❌ Batch operation failed, refreshing cart:', err);
      await fetchCart();
    } finally {
      setPendingOps(prev => Math.max(0, prev - ops.length));
    }
  }, [state.cart?.id, fetchCart, pendingOps]);

  /** 📦 Queue an operation for batching */
  const queueOperation = useCallback((operation: CartOperation) => {
    const isFirstOperation = operationQueue.current.length === 0;

    operationQueue.current.push(operation);
    setPendingOps(prev => prev + 1);

    // Clear existing debounce timer
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
    }

    // Start max wait timer on first operation (prevents infinite batching)
    if (isFirstOperation) {
      maxWaitTimer.current = setTimeout(() => {
        console.log('⏰ Max wait time reached, flushing batch');
        flushBatch();
      }, 2000); // Maximum 2 seconds wait
    }

    // Debounce timer: flush after 500ms of inactivity
    flushTimer.current = setTimeout(() => {
      flushBatch();
    }, 500);
  }, [flushBatch]);

  /** ➕ Add item */
  const addItem = useCallback(
    async (productId: string, quantity = 1, variantId?: string) => {
      try {
        // For add operations, we still use individual API calls
        // because they need price lookups and existing item checks
        setState(prev => ({ ...prev, loading: true, error: null }));
        const cartId = state.cart?.id;
        const result = await cartAPI.addItem({ productId, quantity, variantId, cartId });
        setState({ cart: result.data, loading: false, error: null });
      } catch (err) {
        console.error("❌ Failed to add item:", err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to add item to cart",
        }));
        await fetchCart();
      }
    },
    [fetchCart, state.cart?.id]
  );

  /** ✏️ Update item with batching */
  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      try {
        // Optimistic update
        const line = state.cart?.lines.find(l => l.id === lineId);
        if (!line) return;

        setState(prev => ({
          ...prev,
          cart: prev.cart ? {
            ...prev.cart,
            lines: prev.cart.lines.map(l =>
              l.id === lineId ? { ...l, quantity } : l
            ),
            totalQuantity: prev.cart.totalQuantity - line.quantity + quantity,
          } : null,
        }));

        // Queue for batch processing
        queueOperation({ type: 'update', lineId, quantity });
      } catch (err) {
        console.error('❌ Failed to update item:', err);
        await fetchCart();
      }
    },
    [state.cart, queueOperation, fetchCart]
  );

  /** ❌ Remove item with batching */
  const removeItem = useCallback(
    async (lineId: string) => {
      try {
        // Optimistic update
        const removedLine = state.cart?.lines.find(l => l.id === lineId);
        if (!removedLine) return;

        setState(prev => ({
          ...prev,
          cart: prev.cart ? {
            ...prev.cart,
            lines: prev.cart.lines.filter(l => l.id !== lineId),
            totalQuantity: prev.cart.totalQuantity - removedLine.quantity,
            subtotal: {
              amount: (parseFloat(prev.cart.subtotal.amount) - (parseFloat(removedLine.price.amount) * removedLine.quantity)).toFixed(2),
              currencyCode: prev.cart.subtotal.currencyCode,
            },
          } : null,
        }));

        // Queue for batch processing
        queueOperation({ type: 'remove', lineId });
      } catch (err) {
        console.error('❌ Failed to remove item:', err);
        await fetchCart();
      }
    },
    [state.cart, queueOperation, fetchCart]
  );

  /** 🧹 Clear local cart state */
  const clearCart = useCallback(() => {
    setState({ cart: null, loading: false, error: null });
  }, []);

  /** 🧭 Auto-fetch cart on mount */
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
      }
    };
  }, []);

  const itemCount = state.cart?.totalQuantity ?? 0;
  const hasPendingOperations = pendingOps > 0;

  return (
    <CartContext.Provider
      value={{
        ...state,
        itemCount,
        hasPendingOperations,
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
