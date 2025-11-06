"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ordersAPI } from "@/lib/api";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type StatusType =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "REFUNDED";

interface OrderItem {
  _id?: string;
  product?: { title?: string; featuredImage?: { url: string; altText?: string } };
  quantity?: number;
  subtotal?: {amount:string};
}

interface Order {
  _id?: string;
  id?: string;
  user?: { firstName?: string;lastName?: string; email?: string };
  items?: OrderItem[];
  status?: StatusType;
  shippingAddress?: { line1?: string; city?: string; state?: string; postalCode?: string; country?: string };
  total?: number | string | null;
  totalAmount?: number | string | null;
  subtotal?: number | string | null;
  adminNotes?: string;
}

const statusColors: Record<StatusType, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getById(orderId);
      setOrder(res.data?.order || res.data || null);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: StatusType) => {
    if (!orderId) return;
    try {
      setUpdating(true);
      await ordersAPI.updateStatusAdmin(orderId, { status: newStatus });
      await fetchOrder();
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Loading order details...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchOrder}
          className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 mt-4"
        >
          Retry
        </button>
      </div>
    );

  if (!order)
    return <p className="text-center text-gray-500">Order not found.</p>;

  const total =
    Number(order.total) ||
    Number(order.totalAmount) ||
    Number(order.subtotal) ||
    0;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Order #{order._id || order.id || "Unknown"}
      </h1>

      {/* --- Customer Info --- */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-semibold text-lg text-gray-800 mb-2">Customer</h2>
        <p className="text-gray-700">{order.user?.firstName + " " + order.user?.lastName || "—"}</p>
        <p className="text-gray-500 text-sm">{order.user?.email || "No email"}</p>
      </section>

      {/* --- Status --- */}
      <section className="bg-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-semibold text-lg text-gray-800">Status</h2>
        <div className="flex items-center gap-3">
          <select
            value={order.status || "PENDING"}
            onChange={(e) => updateStatus(e.target.value as StatusType)}
            disabled={updating}
            className={`border rounded-md px-3 py-1 font-medium ${statusColors[order.status || "PENDING"]}`}
          >
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELED">Canceled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          {updating && (
            <span className="text-sm text-gray-500 italic">Updating...</span>
          )}
        </div>
      </section>

      {/* --- Items --- */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">Items</h2>
        {order.items?.length ? (
          <ul className="space-y-4">
            {order.items.map((item, idx) => {
              const itemTotal = Number(item.subtotal?.amount) || 0;
              return (
                <li
                  key={item._id || idx}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {/* Product Image */}
                  {item.product?.featuredImage?.url && (
                    <Image
                      src={item.product.featuredImage.url}
                      alt={item.product.featuredImage.altText || item.product.title || ""}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                      sizes="60px"
                    />
                  )}

                  {/* Product Info */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.product?.title || "Unknown product"}</p>
                    <p className="text-gray-500 text-sm">
                      Qty: {item.quantity || 0} — ₹{itemTotal.toFixed(2)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500">No items found.</p>
        )}
      </section>

      {/* --- Shipping --- */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-semibold text-lg text-gray-800 mb-2">Shipping Address</h2>
        <p className="text-gray-700">
          {order.shippingAddress?.line1 || "—"}, {order.shippingAddress?.city || ""},{" "}
          {order.shippingAddress?.state || ""}, {order.shippingAddress?.postalCode || ""},{" "}
          {order.shippingAddress?.country || ""}
        </p>
      </section>

      {/* --- Total --- */}
      <section className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
        <h2 className="font-semibold text-lg text-gray-800">Total</h2>
        <p className="text-gray-900 font-bold text-lg">₹{total.toFixed(2)}</p>
      </section>

      {/* --- Admin Notes --- */}
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-semibold text-lg text-gray-800 mb-2">Admin Notes</h2>
        <p className="text-gray-700">{order.adminNotes || "None"}</p>
      </section>
    </div>
  );
}
