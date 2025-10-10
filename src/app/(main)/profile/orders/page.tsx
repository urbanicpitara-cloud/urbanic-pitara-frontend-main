"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import React from "react";
import { ordersRepository } from "@/lib/api/repositories/orders";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function OrdersPage() {
  const router = useRouter();
  const cookies = parseCookies();
  const customerAccessToken = cookies.customerAccessToken;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [orders, setOrders] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function run() {
      if (!customerAccessToken) return;
      setLoading(true);
      setError(null);
      try {
        const res = await ordersRepository.list(customerAccessToken);
        setOrders(res.items);
      } catch (e: any) {
        setError(e?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [customerAccessToken]);

  useEffect(() => {
    if (!customerAccessToken) {
      router.push("/auth");
    }
  }, [customerAccessToken, router]);

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
        <p className="text-red-500 mb-4">Error loading orders</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const ordersData = orders;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">My Orders</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Back to Profile
          </Button>
        </div>

        {ordersData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {ordersData.map((order) => (
              <div key={order.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium">Order {order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.placedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.totalAmount} {order.totalCurrency}</p>
                    <p className="text-sm text-gray-500">Status: {order.status}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={`${order.id}-${item.id}`} className="flex gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0">
                        <div className="h-20 w-20 bg-gray-100 rounded" />
                      </div>
                      <div>
                        <p className="font-medium">{item.productId}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.priceAmount} {item.priceCurrency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}