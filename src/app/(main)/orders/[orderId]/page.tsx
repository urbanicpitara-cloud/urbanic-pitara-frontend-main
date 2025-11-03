"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// -------------------- TYPES -------------------- //
type ProductImage = { url: string; altText?: string };
type Product = { id: string; title: string; handle: string; featuredImage?: ProductImage | null };
type Variant = { id: string; selectedOptions: Record<string, string> };
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
export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [canceling, setCanceling] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await ordersAPI.getById(orderId as string);
      setOrder(res.data.order || res.data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleCancel = async () => {
    if (!order || !cancelReason) return;
    setCanceling(true);
    try {
      await ordersAPI.cancel(order.id, cancelReason);
      toast.success("Order cancelled successfully");
      setCancelModal(false);
      fetchOrder();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to cancel order");
    } finally {
      setCanceling(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading order details...</p>;
  if (!order)
    return <p className="text-center mt-10 text-red-500">Order not found.</p>;

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
  };

  const status = order.status.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        ← Back to Orders
      </Button>

      <div className="border rounded-xl shadow-md p-6 bg-white">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Order #{order.id}</h1>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
            {["PENDING", "PROCESSING"].includes(status) && (
              <Button variant="destructive" onClick={() => setCancelModal(true)}>
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-3 text-gray-700">Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                <img
                  src={item.product.featuredImage?.url || "/placeholder-product.png"}
                  alt={item.product.title}
                  className="w-20 h-20 object-cover rounded-lg border bg-gray-100"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.product.title}</p>
                  {item.variant && (
                    <p className="text-sm text-gray-500">
                      {Object.entries(item.variant.selectedOptions)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} | Price: {item.price.amount}{" "}
                    {item.price.currencyCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address Info */}
        <div className="border-t mt-6 pt-4 grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <p>{order.shippingAddress?.address1}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
            <p>{order.shippingAddress?.country}</p>
            <p>{order.shippingAddress?.zip}</p>
            <p>{order.shippingAddress?.phone}</p>
          </div>
          {/* <div>
            <h3 className="font-semibold mb-2">Billing Address</h3>
            <p>{order.billingAddress?.firstName} {order.billingAddress?.lastName}</p>
            <p>{order.billingAddress?.address1}</p>
            <p>{order.billingAddress?.city}, {order.billingAddress?.province}</p>
            <p>{order.billingAddress?.country}</p>
            <p>{order.billingAddress?.zip}</p>
            <p>{order.billingAddress?.phone}</p>
          </div> */}
        </div>

        {/* Total */}
        <div className="border-t mt-6 pt-4 flex justify-between items-center">
          {order.cancelReason && (
            <p className="text-red-600 text-sm">
              <strong>Cancel Reason:</strong> {order.cancelReason}
            </p>
          )}
          <p className="font-bold text-lg text-gray-900">
            Total: {order.totalAmount} {order.totalCurrency}
          </p>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Dialog open={cancelModal} onOpenChange={setCancelModal}>
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
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setCancelModal(false)} disabled={canceling}>
              Close
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={canceling}>
              {canceling ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
