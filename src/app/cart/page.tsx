"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
import { CartPageLoading } from "@/components/ui/loading-states";
import { cartAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface CartItem {
  id: string;
  product: {
    id: string;
    title: string;
    featuredImageUrl?: string;
    featuredImageAlt?: string;
  };
  variantId: string;
  title: string;
  quantity: number;
  priceAmount: number;
  currency: string;
}

interface Cart {
  items: CartItem[];
  subtotalAmount: number;
  totalAmount: number;
  currency: string;
  checkoutUrl: string;
}

export default function CartPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Map API response to Cart shape
  const mapCartResponse = (apiData: any): Cart => {
    const items: CartItem[] = apiData.lines.map((line: any) => ({
      id: line.id,
      product: {
        id: line.product.id,
        title: line.product.title,
        featuredImageUrl: line.product.featuredImage?.url,
        featuredImageAlt: line.product.featuredImage?.altText,
      },
      variantId: line.variant.id,
      title: line.variant.selectedOptions.size
        ? `Size: ${line.variant.selectedOptions.size}`
        : "",
      quantity: line.quantity,
      priceAmount: parseFloat(line.price.amount),
      currency: line.price.currencyCode,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.priceAmount * item.quantity, 0);

    return {
      items,
      subtotalAmount: subtotal,
      totalAmount: subtotal, // adjust if API returns total differently
      currency: apiData.subtotal.currencyCode,
      checkoutUrl: `/checkout/${apiData.id}`,
    };
  };

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await cartAPI.get();
      setCart(mapCartResponse(res.data));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Optimistic update: keep item order and update quantity immediately
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;
    if (quantity <= 0) return removeItem(itemId);

    setCart((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.priceAmount * item.quantity, 0);
      return { ...prev, items: updatedItems, subtotalAmount: newSubtotal, totalAmount: newSubtotal };
    });

    try {
      await cartAPI.updateItem(itemId, { quantity });
    } catch (err) {
      console.error(err);
      fetchCart(); // fallback: reload cart from API if error
    }
  };

  const removeItem = async (itemId: string) => {
    if (!cart) return;
    setCart((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.filter((item) => item.id !== itemId);
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.priceAmount * item.quantity, 0);
      return { ...prev, items: updatedItems, subtotalAmount: newSubtotal, totalAmount: newSubtotal };
    });

    try {
      await cartAPI.removeItem(itemId);
    } catch (err) {
      console.error(err);
      fetchCart(); // fallback
    }
  };

  if (loading) {
    return <CartPageLoading />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchCart}>Try Again</Button>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some products to your cart to continue shopping.</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-8">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                  src={item.product.featuredImageUrl || "/placeholder.png"}
                  alt={item.product.featuredImageAlt || item.product.title}
                  fill
                  sizes="100px"
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-medium">{item.product.title}</h3>
                <p className="text-sm text-gray-500">{item.title}</p>

                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  {item.priceAmount * item.quantity} {item.currency}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{cart.subtotalAmount} {cart.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Total</span>
                <span>{cart.totalAmount} {cart.currency}</span>
              </div>
            </div>

            <Link
              href={user ? cart.checkoutUrl : "/auth"}
              className="mt-4 w-full"
            >
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
