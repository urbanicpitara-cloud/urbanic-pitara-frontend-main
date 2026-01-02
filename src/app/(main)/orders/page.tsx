"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { ordersAPI } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { OrdersPageLoading } from "@/components/ui/loading-states";

// -------------------- TYPES -------------------- //
type ProductImage = { url: string; altText?: string };
type Product = { id: string; title: string; handle: string; featuredImage?: ProductImage | null };
type CustomProduct = { id: string; title: string; color: string; size: string; previewUrl: string };
type Variant = { id: string; selectedOptions: Record<string, string> };
type OrderItem = {
  id: string;
  quantity: number;
  product?: Product | null;
  customProduct?: CustomProduct | null;
  variant?: Variant | null;
  price: { amount: string | number; currencyCode: string };
  subtotal: { amount: string; currencyCode: string };
};
type Address = {
  firstName?: string;
  lastName?: string;
  address1?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  country?: string | null;
};
type PaymentInfo = {
  id: string;
  status: string;
  method: string;
  provider?: string;
  amount: number;
  currency: string;
  createdAt: string;
};
type Order = {
  id: string;
  status: string;
  createdAt: string;
  totalAmount: string;
  totalCurrency: string;
  cancelReason?: string;
  shippingAddress?: Address | null;
  items: OrderItem[];
  payment?: PaymentInfo | null;
};

// -------------------- COMPONENT -------------------- //
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [canceling, setCanceling] = useState(false);

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const openCancelModal = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelReason("Changed my mind");
  };

  const closeCancelModal = () => {
    setCancelOrderId(null);
    setCancelReason("");
    setCanceling(false);
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId || !cancelReason) return;
    setCanceling(true);
    try {
      await ordersAPI.cancel(cancelOrderId, cancelReason);
      toast.success("Order cancelled successfully");
      closeCancelModal();
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to cancel order");
      setCanceling(false);
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto"><OrdersPageLoading /></div>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (orders.length === 0) return <p className="text-center mt-10 text-gray-600">No orders found.</p>;

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    PROCESSING: "bg-blue-50 text-blue-700 border border-blue-200",
    SHIPPED: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    CANCELED: "bg-rose-50 text-rose-700 border border-rose-200",
    REFUNDED: "bg-gray-100 text-gray-800 border border-gray-300",
  };

  const paymentStatusColors: Record<string, string> = {
    INITIATED: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    PAID: "bg-green-50 text-green-700 border border-green-200",
    SUCCESS: "bg-green-50 text-green-700 border border-green-200",
    PAYMENT_SUCCESS: "bg-green-50 text-green-700 border border-green-200",
    FAILED: "bg-red-50 text-red-700 border border-red-200",
    REFUNDED: "bg-purple-50 text-purple-700 border border-purple-200",
    NONE: "bg-gray-50 text-gray-700 border border-gray-200",
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-10 text-gray-900 tracking-tight">My Orders</h1>

      {/* Desktop version */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl shadow-sm border border-gray-200 bg-white">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr className="text-sm text-gray-600">
                <th className="px-6 py-3 text-left font-semibold">Order ID</th>
                <th className="px-6 py-3 text-left font-semibold">Date</th>
                <th className="px-6 py-3 text-left font-semibold">Items</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Payment</th>
                <th className="px-6 py-3 text-left font-semibold">Total</th>
                <th className="px-6 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const status = order.status.toUpperCase();
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 4).map((item) => {
                          const imgSrc = item.customProduct?.previewUrl ||
                            item.product?.featuredImage?.url ||
                            (item.product as any)?.featuredImageUrl;
                          const imgAlt = item.customProduct?.title ||
                            item.product?.featuredImage?.altText ||
                            item.product?.title || "item";
                          return imgSrc ? (
                            <Image
                              key={item.id}
                              src={imgSrc}
                              alt={imgAlt}
                              width={36}
                              height={36}
                              className="rounded-full border-2 border-white object-cover shadow-sm"
                            />
                          ) : (
                            <div
                              key={item.id}
                              className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500"
                            >
                              ?
                            </div>
                          );
                        })}
                        {order.items.length > 4 && (
                          <span className="w-9 h-9 flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-600 rounded-full border-2 border-white">
                            +{order.items.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.payment ? (
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full w-fit ${paymentStatusColors[order.payment.status]}`}
                          >
                            {order.payment.status}
                          </span>
                          <p className="text-xs text-gray-500">{order.payment.method}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No payment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {order.totalAmount} {order.totalCurrency}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        View
                      </Link>
                      {["PENDING", "PROCESSING"].includes(status) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="px-3 py-1 text-xs"
                          onClick={() => openCancelModal(order.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="space-y-6 md:hidden">
        {orders.map((order) => {
          const status = order.status.toUpperCase();
          return (
            <div
              key={order.id}
              className="rounded-lg border border-gray-200 shadow-sm p-4 bg-white hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-gray-800 text-sm">Order #{order.id}</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
              {order.payment && (
                <div className="mb-3 p-2 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-semibold">Payment:</span>{" "}
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${paymentStatusColors[order.payment.status]}`}
                    >
                      {order.payment.status}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Method:</span> {order.payment.method}
                  </p>
                </div>
              )}

              <div className="flex items-center -space-x-2 mb-4">
                {order.items.slice(0, 3).map((item) => {
                  const imgSrc = item.customProduct?.previewUrl ||
                    item.product?.featuredImage?.url ||
                    (item.product as any)?.featuredImageUrl;
                  const imgAlt = item.customProduct?.title ||
                    item.product?.featuredImage?.altText ||
                    item.product?.title || "item";
                  return imgSrc ? (
                    <Image
                      key={item.id}
                      src={imgSrc}
                      alt={imgAlt}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ) : null;
                })}
                {order.items.length > 3 && (
                  <span className="w-8 h-8 flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-700 rounded-full border-2 border-white">
                    +{order.items.length - 3}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800 text-sm">
                  Total: {order.totalAmount} {order.totalCurrency}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md text-xs font-medium"
                  >
                    View
                  </Link>
                  {["PENDING", "PROCESSING"].includes(status) && (
                    <button
                      onClick={() => openCancelModal(order.id)}
                      className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md text-xs font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Modal */}
      <Dialog open={!!cancelOrderId} onOpenChange={closeCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Please provide a reason for cancelling this order:</p>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeCancelModal} disabled={canceling}>
              Close
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder} disabled={canceling}>
              {canceling ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
