"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { useStorefrontQuery } from "@/hooks/useStorefront";
import { GET_CUSTOMER_ORDERS } from "@/graphql/profile";
import type { CustomerOrders } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function OrdersPage() {
  const router = useRouter();
  const cookies = parseCookies();
  const customerAccessToken = cookies.customerAccessToken;

  const { 
    data, 
    isLoading: loading, 
    error 
  } = useStorefrontQuery<{ customer: CustomerOrders }>(
    ["customerOrders", customerAccessToken],
    {
      query: GET_CUSTOMER_ORDERS,
      variables: { customerAccessToken },
      enabled: !!customerAccessToken,
    }
  );

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

  if (error || !data?.customer) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500 mb-4">Error loading orders</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const { orders } = data.customer;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">My Orders</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Back to Profile
          </Button>
        </div>

        {orders.edges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.edges.map(({ node: order }) => (
              <div key={order.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.processedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {order.currentTotalPrice.amount} {order.currentTotalPrice.currencyCode}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {order.fulfillmentStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.lineItems.edges.map(({ node: item }) => (
                    <div key={`${order.id}-${item.title}`} className="flex gap-4">
                      {item.variant.image && (
                        <div className="relative h-20 w-20 flex-shrink-0">
                          <Image
                            src={item.variant.image.url}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.variant.price.amount} {item.variant.price.currencyCode}
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