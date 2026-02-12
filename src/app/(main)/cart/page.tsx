"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
import { CartPageLoading } from "@/components/ui/loading-states";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/atoms/cart";
import { toast } from "sonner";

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { cart, loading, error, updateItem: updateCartItem, removeItem: removeCartItem, hasPendingOperations } = useCart();
  const [localError, setLocalError] = useState("");

  // Update quantity handler
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(itemId);

    try {
      await updateCartItem(itemId, quantity);
    } catch (err) {
      console.error('❌ Failed to update quantity:', err);
      setLocalError('Failed to update quantity');
    }
  };

  // Remove item handler
  const removeItem = async (itemId: string) => {
    try {
      await removeCartItem(itemId);
    } catch (err) {
      console.error('❌ Failed to remove item:', err);
      setLocalError('Failed to remove item');
    }
  };

  // Checkout handler with pending operations guard
  const handleCheckout = async (e: React.MouseEvent) => {
    if (hasPendingOperations) {
      e.preventDefault();
      toast.info('Updating cart...');

      // Wait for pending operations (max 5 seconds)
      const startTime = Date.now();
      const checkPending = () => {
        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (!hasPendingOperations || Date.now() - startTime > 5000) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      };

      await checkPending();
      router.push(user ? `/checkout/${cart?.id}` : "/auth?redirect=/cart");
    }
  };

  if (loading) {
    return <CartPageLoading />;
  }

  if (error || localError) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500 mb-4">{error || localError}</p>
      </div>
    );
  }

  if (!cart?.lines?.length) {
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
          {cart.lines.map((line) => (
            <div key={line.id} className="flex flex-wrap sm:flex-nowrap gap-4 p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex gap-4 flex-1 min-w-0">
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src={line.product?.featuredImage?.url || line.customProduct?.previewUrl || "/placeholder.png"}
                    alt={line.product?.featuredImage?.altText || line.product?.title || line.customProduct?.color || "Product"}
                    fill
                    sizes="100px"
                    className="object-cover rounded-md border border-gray-100"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{line.product?.title || `Custom ${line.customProduct?.color}`}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {line.customProduct
                      ? `Custom ${line.customProduct.color} - Size: ${line.customProduct.size || 'L'}`
                      : (line.variant?.selectedOptions?.Size || line.variant?.selectedOptions?.size ? `Size: ${line.variant.selectedOptions.Size || line.variant.selectedOptions.size}` : "")}
                  </p>

                  {/* Mobile Price Display */}
                  <div className="sm:hidden mt-2 font-medium text-gray-900">
                    {parseFloat(line.subtotal.amount).toFixed(2)} {line.subtotal.currencyCode}
                  </div>
                </div>
              </div>

              {/* Controls & Desktop Price */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto">
                <div className="hidden sm:block text-right">
                  <p className="font-medium text-gray-900">
                    {parseFloat(line.subtotal.amount).toFixed(2)} {line.subtotal.currencyCode}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center border rounded-md shadow-sm">
                    <button
                      onClick={() => updateQuantity(line.id, line.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-50 transition-colors"
                      disabled={line.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x text-sm min-w-[32px] text-center">{line.quantity}</span>
                    <button
                      onClick={() => updateQuantity(line.id, line.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-50 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(line.id)}
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
                <span className="font-medium text-gray-900">{parseFloat(cart.subtotal.amount).toFixed(2)} {cart.subtotal.currencyCode}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{parseFloat(cart.subtotal.amount).toFixed(2)} {cart.subtotal.currencyCode}</span>
              </div>
            </div>

            <Link
              href={user ? `/checkout/${cart.id}` : "/auth?redirect=/cart"}
              onClick={handleCheckout}
              className="mt-6 block"
            >
              <Button
                className="w-full h-12 text-base shadow-md hover:shadow-lg transition-shadow"
                disabled={hasPendingOperations}
              >
                {hasPendingOperations ? 'Updating cart...' : 'Proceed to Checkout'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
