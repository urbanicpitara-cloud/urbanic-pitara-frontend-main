"use client";

import { useEffect, useState } from "react";
import { ordersAPI } from "@/lib/api";

// -------------------- TYPES -------------------- //
type ProductImage = { url: string; altText?: string };
type Product = { id: string; title: string; handle: string; featuredImage?: ProductImage | null };
type Variant = { id: string; selectedOptions: any };
type OrderItem = {
  id: string;
  quantity: number;
  product: Product;
  variant?: Variant | null;
  price: { amount: string | number; currencyCode: string };
  subtotal: { amount: string; currencyCode: string };
};
type Address = {
  firstName?: string;
  lastName?: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  country?: string | null;
  phone?: string | null;
};
type Order = {
  id: string;
  status: string;
  createdAt: string;
  totalAmount: string;
  totalCurrency: string;
  cancelReason?: string;
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  items: OrderItem[];
};

// -------------------- COMPONENT -------------------- //
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data.orders || res.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    const reason = prompt("Please provide a reason for cancelling this order:", "Changed my mind");
    if (!reason) return;
    try {
      await ordersAPI.cancel(orderId, reason);
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to cancel order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading orders...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (orders.length === 0) return <p className="text-center mt-10 text-gray-600">No orders found.</p>;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">My Orders</h1>
      <div className="space-y-8">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-xl shadow-md p-6 bg-white hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div className="mb-2 md:mb-0">
                <p className="font-semibold text-lg text-gray-700">Order #: {order.id}</p>
                <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[order.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status.toUpperCase()}
                </span>
                {["pending", "processing"].includes(order.status) && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md shadow"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="font-semibold mb-3 text-gray-700">Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    {item.product.featuredImage?.url && (
                      <img
                        src={item.product.featuredImage.url}
                        alt={item.product.featuredImage.altText || ""}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.product.title}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          Variant: {JSON.stringify(item.variant.selectedOptions)}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} | Price: {item.price.amount} {item.price.currencyCode} | Subtotal:{" "}
                        {item.subtotal.amount} {item.subtotal.currencyCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t mt-4 pt-4 flex flex-col md:flex-row justify-between text-sm text-gray-700">
              <div className="space-y-1">
                <p>
                  <span className="font-semibold">Shipping:</span>{" "}
                  {order.shippingAddress?.address1 || "N/A"}, {order.shippingAddress?.city || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Billing:</span>{" "}
                  {order.billingAddress?.address1 || "N/A"}, {order.billingAddress?.city || "N/A"}
                </p>
                {order.cancelReason && (
                  <p className="text-red-600">
                    <span className="font-semibold">Cancel Reason:</span> {order.cancelReason}
                  </p>
                )}
              </div>
              <div className="mt-2 md:mt-0 font-bold text-lg text-gray-800">
                Total: {order.totalAmount} {order.totalCurrency}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
