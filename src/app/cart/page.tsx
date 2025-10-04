"use client";

import { useCart } from "@/lib/atoms/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/hooks/useStorefront";

export default function CartPage() {
  const { cart, loading, error, updateItem, removeItem } = useCart();

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!cart?.lines?.edges?.length) {
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
        <div className="lg:col-span-8">
          <div className="space-y-4">
            {cart.lines.edges.map(({ node: item }) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src={item.merchandise.product.images.edges[0]?.node.url ?? ''}
                    alt={item.merchandise.product.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{item.merchandise.product.title}</h3>
                  <p className="text-sm text-gray-500">{item.merchandise.title}</p>
                  
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => updateItem(item.id, Math.max(0, item.quantity - 1))}
                        className="px-3 py-1"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-x">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
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
                    {item.cost.totalAmount.amount} {item.cost.totalAmount.currencyCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-4">
          <div className="sticky top-20 p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{cart.cost.subtotalAmount.amount} {cart.cost.subtotalAmount.currencyCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>
                  {cart.cost.totalTaxAmount?.amount ?? "-"} {cart.cost.totalTaxAmount?.currencyCode ?? ""}
                </span>
              </div>
              <div className="flex justify-between font-medium text-base pt-2 border-t">
                <span>Total</span>
                <span>{cart.cost.totalAmount.amount} {cart.cost.totalAmount.currencyCode}</span>
              </div>
            </div>
            
            <Link
              href={`${isAuthenticated() ? `${cart.checkoutUrl}` : `/auth`}`}
              className="mt-4 w-full"
            >
              <Button className="w-full">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}