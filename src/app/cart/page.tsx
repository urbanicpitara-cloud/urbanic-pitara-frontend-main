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
    try {
      console.log('🔄 Mapping cart data, lines:', apiData.lines);

      const items: CartItem[] = apiData.lines.map((line: any, index: number) => {
        console.log(`📝 Mapping line ${index}:`, {
          hasVariant: !!line.variant,
          hasCustomProduct: !!line.customProduct,
          productTitle: line.product?.title || 'Custom Product',
        });

        return {
          id: line.id,
          product: line.product ? {
            id: line.product.id,
            title: line.product.title,
            featuredImageUrl: line.product.featuredImage?.url,
            featuredImageAlt: line.product.featuredImage?.altText || line.product.title,
          } : {
            id: line.customProductId,
            title: line.customProduct?.title || `Custom ${line.customProduct?.color}`,
            featuredImageUrl: line.customProduct?.previewUrl,
            featuredImageAlt: line.customProduct?.title || 'Custom Product',
          },
          variantId: line.variant?.id || "",
          title: line.customProduct
            ? `Custom ${line.customProduct.color} - Size: ${line.customProduct.size || 'L'}`
            : (line.variant?.selectedOptions?.Size || line.variant?.selectedOptions?.size ? `Size: ${line.variant.selectedOptions.Size || line.variant.selectedOptions.size}` : ""),
          quantity: line.quantity,
          priceAmount: parseFloat(line.price.amount),
          currency: line.price.currencyCode,
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.priceAmount * item.quantity, 0);

      return {
        items,
        subtotalAmount: subtotal,
        totalAmount: subtotal,
        currency: apiData.subtotal.currencyCode,
        checkoutUrl: `/checkout/${apiData.id}`,
      };
    } catch (error) {
      console.error('❌ Error mapping cart:', error);
      throw error;
    }
  };

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await cartAPI.get();
      console.log('📦 Raw cart API response:', res.data);
      const mappedCart = mapCartResponse(res.data);
      console.log('📦 Mapped cart:', mappedCart);
      setCart(mappedCart);
    } catch (err: unknown) {
      console.error('❌ Cart fetch error:', err);
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
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-full overflow-x-hidden">
      <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold mb-8 text-center md:text-left">Shopping Cart</h1>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4 min-w-0">
          {cart.items.map((item) => (
            <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-4 p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex gap-4 flex-1 min-w-0">
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src={item.product.featuredImageUrl || "/placeholder.png"}
                    alt={item.product.featuredImageAlt || item.product.title}
                    fill
                    sizes="100px"
                    className="object-cover rounded-md border border-gray-100"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.product.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{item.title}</p>

                  {/* Mobile Price Display */}
                  <div className="sm:hidden mt-2 font-medium text-gray-900">
                    {item.priceAmount * item.quantity} {item.currency}
                  </div>
                </div>
              </div>

              {/* Controls & Desktop Price */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto">
                <div className="hidden sm:block text-right">
                  <p className="font-medium text-gray-900">
                    {item.priceAmount * item.quantity} {item.currency}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center border rounded-md shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-50 transition-colors"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x text-sm min-w-[32px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-50 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full xl:w-[320px] 2xl:w-[380px] flex-shrink-0">
          <div className="sticky top-20 p-6 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{cart.subtotalAmount} {cart.currency}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{cart.totalAmount} {cart.currency}</span>
              </div>
            </div>

            <Link
              href={user ? cart.checkoutUrl : "/auth?redirect=/cart"}
              className="mt-6 block"
            >
              <Button className="w-full h-12 text-base shadow-md hover:shadow-lg transition-shadow">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
