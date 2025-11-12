"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import { paymentRepository } from '@/lib/api/repositories/payment';
import { PremiumLoading } from "@/components/ui/loading-states";
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
import { CreditCard, Clock, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

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
  payment?: {
    id: string;
    status: string;
    method: string;
    provider?: string;
    amount?: number;
    currency?: string;
    createdAt?: string;
  } | null;
};

// -------------------- HELPERS -------------------- //
const formatCurrency = (amount: number | string, currency = "INR") => {
  try {
    const n = typeof amount === 'string' ? Number(amount) : amount;
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch (e) {
    console.error(e);
    return `${amount} ${currency}`;
  }
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-800",
  PROCESSING: "bg-blue-50 text-blue-800",
  SHIPPED: "bg-purple-50 text-purple-800",
  DELIVERED: "bg-green-50 text-green-800",
  CANCELED: "bg-red-50 text-red-800",
  REFUNDED: "bg-gray-50 text-gray-800",
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
    if (!order || !cancelReason) return toast.error('Please provide a cancel reason');
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

  const handlePayNow = async () => {
    if (!order) return;
    try {
      const res = await paymentRepository.initiate({
        amount: Number(order.totalAmount),
        orderId: order.id,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/status`,
      });

      if (!res || !res.data) {
        toast.error('Failed to initiate payment');
        return;
      }

      if (res.data.transactionId) localStorage.setItem('lastTransactionId', res.data.transactionId);

      const url = res.data.redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/status`;
      window.location.href = url;
    } catch (err: any) {
      console.error('Pay now failed', err);
      toast.error(err?.message || 'Payment initiation failed');
    }
  };

  if (loading) return <PremiumLoading />;
  if (!order) return <div className="text-center py-20"><XCircle size={48} className="mx-auto text-red-500" /><p className="mt-4 text-red-600">Order not found.</p></div>;

  const status = order.status.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order <span className="text-indigo-600">#{order.id}</span></h1>
            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-50 text-gray-800'}`}>
            {status === 'DELIVERED' ? <CheckCircle size={16}/> : status === 'CANCELED' ? <XCircle size={16}/> : <Clock size={16}/>}
            {status}
          </span>
          {['PENDING', 'PROCESSING'].includes(status) && (
            <Button variant="destructive" onClick={() => setCancelModal(true)}>Cancel</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items and timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Items ({order.items.length})</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center p-3 border rounded-lg">
                  <img src={item.product.featuredImage?.url || '/placeholder-product.png'} alt={item.product.title} className="w-24 h-24 object-cover rounded-md border bg-gray-50"/>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{item.product.title}</p>
                        {item.variant && (
                          <p className="text-sm text-gray-500">{Object.entries(item.variant.selectedOptions).map(([k,v])=> `${k}: ${v}`).join(' • ')}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">Qty: <strong>{item.quantity}</strong></p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(Number(item.price.amount), item.price.currencyCode)}</p>
                        <p className="text-sm text-gray-500">Subtotal: {formatCurrency(Number(item.subtotal.amount), item.subtotal.currencyCode)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order activity</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1"><Clock size={18} className="text-gray-400"/></div>
                <div>
                  <p className="text-sm text-gray-700">Placed on <strong>{new Date(order.createdAt).toLocaleString()}</strong></p>
                </div>
              </div>
              {order.payment && (
                <div className="flex items-start gap-3">
                  <div className="mt-1"><CreditCard size={18} className="text-gray-400"/></div>
                  <div>
                    <p className="text-sm text-gray-700">Payment status: <strong>{order.payment.status}</strong> — {order.payment.method}</p>
                    {order.payment.createdAt && <p className="text-xs text-gray-500">{new Date(order.payment.createdAt).toLocaleString()}</p>}
                  </div>
                </div>
              )}
              {order.cancelReason && (
                <div className="flex items-start gap-3">
                  <div className="mt-1"><XCircle size={18} className="text-gray-400"/></div>
                  <div>
                    <p className="text-sm text-red-600">Order cancelled: <strong>{order.cancelReason}</strong></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Summary, addresses, payment */}
        <aside className="space-y-4">
          <div className="bg-white border rounded-xl shadow-sm p-5">
            <h3 className="text-sm text-gray-500">Order summary</h3>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items</p>
                <p className="text-sm text-gray-600">Shipping</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(Number(order.totalAmount), order.totalCurrency)}</p>
                <p className="text-sm text-gray-600">Calculated at checkout</p>
              </div>
            </div>
            <div className="mt-4">
              {order.payment && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} />
                    <div>
                      <p className="text-sm">{order.payment.method}</p>
                      <p className="text-xs text-gray-500">{order.payment.status}</p>
                    </div>
                  </div>
                  <div>
                    {order.payment.status !== 'PAID' && order.payment.method === 'PHONEPE' && status !== 'CANCELED' ? (
                      <Button onClick={handlePayNow}>Pay Now</Button>
                    ) : (
                      <span className="text-sm text-gray-600">{order.payment.status}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-2">Shipping</h3>
            <div className="text-sm text-gray-700">
              <p className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p>{order.shippingAddress?.address1}{order.shippingAddress?.address2 ? `, ${order.shippingAddress.address2}` : ''}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.zip}</p>
              <p>{order.shippingAddress?.country}</p>
              <p className="text-xs text-gray-500 mt-2">{order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* <div className="bg-white border rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-2">Support</h3>
            <p className="text-sm text-gray-600">If something's wrong, reply to the order email or contact support.</p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline">Contact support</Button>
              <Button onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy link</Button>
            </div>
          </div> */}
        </aside>
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