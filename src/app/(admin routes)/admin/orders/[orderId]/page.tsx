"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Image from "next/image";
import { ordersAPI } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Clock, CreditCard, MapPin, Edit2, Trash2, Copy, Download, Loader2 } from "lucide-react";

type StatusType =
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELED"
    | "REFUNDED";

interface CustomProduct {
    id: string;
    title: string;
    color: string;
    size: string;
    previewUrl: string;
    snapshots?: Record<string, string> | null;
}

interface OrderItem {
    _id?: string;
    id?: string;
    product?: { title?: string; featuredImage?: { url: string; altText?: string } } | null;
    customProduct?: CustomProduct | null;
    quantity?: number;
    subtotal?: { amount: string; currencyCode?: string } | null;
    price?: { amount?: string; currencyCode?: string } | null;
    variant?: { selectedOptions?: Record<string, string> } | null;
}

interface AddressShape {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
}

interface Order {
    _id?: string;
    id?: string;
    createdAt?: string;
    user?: { firstName?: string; lastName?: string; email?: string };
    items?: OrderItem[];
    status?: StatusType;
    shippingAddress?: AddressShape;
    billingAddress?: AddressShape;
    total?: number | string | null;
    totalAmount?: number | string | null;
    subtotal?: number | string | null;
    adminNotes?: string | null;
    payment?: {
        id: string;
        status: string;
        method: string;
        provider?: string | null;
        providerOrderId?: string | null;
        providerPaymentId?: string | null;
        amount: number | string;
        currency: string;
        createdAt?: string;
        rawResponse?: any;
        refundId?: string | null;
        refundAmount?: number | string | null;
        refundedAt?: string | null;
        refundReason?: string | null;
    } | null;
    trackingNumber?: string | null;
    trackingCompany?: string | null;
    cancelReason?: string | null;
}

const statusColors: Record<StatusType, string> = {
    PENDING: "bg-yellow-50 text-yellow-800",
    PROCESSING: "bg-blue-50 text-blue-800",
    SHIPPED: "bg-purple-50 text-purple-800",
    DELIVERED: "bg-green-50 text-green-800",
    CANCELED: "bg-red-50 text-red-800",
    REFUNDED: "bg-gray-50 text-gray-800",
};

const paymentStatusColors: Record<string, string> = {
    INITIATED: "bg-yellow-50 text-yellow-800",
    PAID: "bg-green-50 text-green-800",
    SUCCESS: "bg-green-50 text-green-800",
    PAYMENT_SUCCESS: "bg-green-50 text-green-800",
    FAILED: "bg-red-50 text-red-800",
    REFUNDED: "bg-purple-50 text-purple-800",
    NONE: "bg-gray-50 text-gray-800",
};

function formatCurrency(amount: number | string = 0, currency = "INR") {
    const n = typeof amount === "string" ? Number(amount || 0) : amount || 0;
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
    } catch {
        // Intl may throw if an invalid currency; fall back:
        return `${n.toFixed(2)} ${currency}`;
    }
}

/** Normalize address returned from API to our UI shape */
function normalizeAddress(apiAddr: any): AddressShape {
    if (!apiAddr) return {};
    return {
        line1: apiAddr.address1 ?? apiAddr.line1 ?? "",
        line2: apiAddr.address2 ?? apiAddr.line2 ?? "",
        city: apiAddr.city ?? "",
        state: apiAddr.province ?? apiAddr.state ?? "",
        postalCode: apiAddr.zip ?? apiAddr.postalCode ?? "",
        country: apiAddr.country ?? "",
        phone: apiAddr.phone ?? "",
    };
}

/** Normalize raw order -> UI-friendly order */
function normalizeOrder(raw: any): Order {
    if (!raw) return raw;
    const items: OrderItem[] = (raw.items || []).map((it: any) => ({
        _id: it._id ?? it.id,
        id: it.id ?? it._id,
        product: it.product ?? null,
        customProduct: it.customProduct ?? null,
        quantity: it.quantity ?? 0,
        subtotal: it.subtotal ?? (it.price ? { amount: it.price.amount, currencyCode: it.price.currencyCode } : null),
        price: it.price ?? null,
        variant: it.variant ?? null,
    }));

    const payment = raw.payment
        ? {
            ...raw.payment,
            amount: raw.payment.amount !== undefined ? Number(raw.payment.amount) : undefined,
        }
        : null;

    const totalFromItems = items.reduce((s, it) => s + (Number(it.subtotal?.amount || 0) || 0), 0);

    return {
        ...raw,
        items,
        payment,
        shippingAddress: normalizeAddress(raw.shippingAddress),
        billingAddress: normalizeAddress(raw.billingAddress ?? raw.billing_address),
        totalAmount: raw.totalAmount ?? raw.total ?? totalFromItems,
        subtotal: raw.subtotal ?? totalFromItems,
    };
}

export default function AdminOrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = (params?.orderId ?? params?.id) as string | undefined;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatusUpdate, setPaymentStatusUpdate] = useState<string>("");
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Refund state
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refunding, setRefunding] = useState(false);

    const downloadAssets = async (customProductId: string) => {
        try {
            setDownloadingId(customProductId);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/download-assets/orders/${orderId}/custom-product/${customProductId}`);

            if (!res.ok) throw new Error("Failed to download assets");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `assets-${customProductId}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Assets downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download assets");
        } finally {
            setDownloadingId(null);
        }
    };

    const fetchOrder = async () => {
        if (!orderId) {
            setError("Missing order id");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const res = await ordersAPI.getById(orderId);
            const raw = res?.data?.order ?? res?.data ?? null;
            if (!raw) {
                setOrder(null);
                setError("Order not found");
                return;
            }
            const normalized = normalizeOrder(raw);
            setOrder(normalized);
            // prefill payment status update select with current status
            setPaymentStatusUpdate(normalized.payment?.status || "");
        } catch (err) {
            console.error("Failed to load order:", err);
            setError("Failed to load order details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async () => {
        if (!order?.payment || !paymentStatusUpdate) return;
        if (paymentStatusUpdate === order.payment.status) {
            toast("Choose a different status");
            return;
        }
        try {
            setUpdating(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
            const resp = await fetch(`${apiBaseUrl}/admin/payment/${order.payment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: paymentStatusUpdate }),
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data?.error || "Failed to update payment");
            toast.success("Payment status updated");
            await fetchOrder();
        } catch (err: any) {
            console.error("Update payment failed", err);
            toast.error(err?.message || "Failed to update payment status");
        } finally {
            setUpdating(false);
        }
    };

    const updateStatus = async (newStatus: StatusType) => {
        if (!orderId) return;
        if (newStatus === order?.status) return;
        try {
            setUpdating(true);
            await ordersAPI.updateStatusAdmin(orderId, { status: newStatus });
            await fetchOrder();
            toast.success("Order status updated");
        } catch (err) {
            console.error("Status update failed:", err);
            toast.error("Failed to update order status.");
        } finally {
            setUpdating(false);
        }
    };

    const handleInitiateRefund = async () => {
        if (!order?.payment || !refundAmount) {
            toast.error('Please enter refund amount');
            return;
        }

        const amount = parseFloat(refundAmount);
        const paymentAmount = Number(order.payment.amount);

        if (amount <= 0 || amount > paymentAmount) {
            toast.error(`Refund amount must be between 0 and ${paymentAmount}`);
            return;
        }

        if (!window.confirm(`Refund ${order.payment.currency} ${amount}? This cannot be undone.`)) {
            return;
        }

        try {
            setRefunding(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

            const resp = await fetch(`${apiBaseUrl}/admin/payment/${order.payment.id}/refund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    amount: amount,
                    reason: refundReason || 'Customer requested refund'
                })
            });

            const data = await resp.json();

            if (!resp.ok) {
                throw new Error(data.error || 'Refund failed');
            }

            toast.success('Refund initiated successfully!');
            setShowRefundModal(false);
            setRefundAmount('');
            setRefundReason('');
            await fetchOrder(); // Refresh order data

        } catch (error: any) {
            console.error('Refund error:', error);
            toast.error(error.message || 'Failed to initiate refund');
        } finally {
            setRefunding(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
                <Clock className="mr-2" /> Loading order details...
            </div>
        );

    if (error)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
                <p>{error}</p>
                <button
                    onClick={fetchOrder}
                    className="mt-4 inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                    Retry
                </button>
            </div>
        );

    if (!order) return <p className="text-center text-gray-500">Order not found.</p>;

    // totals: prefer server totalAmount, otherwise sum of item subtotals
    const itemSum = (order.items || []).reduce((s, it) => s + (Number(it.subtotal?.amount || 0) || 0), 0);
    const totalNum = Number(order.totalAmount ?? order.total ?? itemSum ?? 0);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <button
                        onClick={async () => {
                            if (!orderId) return;
                            if (!confirm("Resend invoice to customer?")) return;
                            try {
                                setUpdating(true);
                                await ordersAPI.resendInvoice(orderId);
                                toast.success("Invoice sent successfully");
                            } catch (error) {
                                console.error(error);
                                toast.error("Failed to send invoice");
                            } finally {
                                setUpdating(false);
                            }
                        }}
                        disabled={updating}
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                        <CreditCard size={16} /> Resend Invoice
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 break-all">
                            Order <span className="text-indigo-600">#{order._id ?? order.id}</span>
                        </h1>
                        <p className="text-sm text-gray-500">
                            {order.user?.firstName ?? ""} {order.user?.lastName ?? ""} • {order.user?.email ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${statusColors[order.status ?? "PENDING"]}`}>
                        {order.status}
                    </span>
                    <select
                        value={order.status ?? "PENDING"}
                        onChange={(e) => updateStatus(e.target.value as StatusType)}
                        disabled={updating}
                        className="border rounded-md px-3 py-1 text-sm bg-white"
                    >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELED">Canceled</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Items + Notes (left) */}
                <div className="md:col-span-2 xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="font-semibold text-lg mb-4">Items ({order.items?.length || 0})</h2>
                        <ul className="space-y-4">
                            {order.items?.map((item, idx) => {
                                const itemTotal = Number(item.subtotal?.amount || item.price?.amount || 0) || 0;
                                const isCustom = !!item.customProduct;
                                const imgUrl = isCustom ? item.customProduct?.previewUrl : (item.product?.featuredImage?.url ?? "");
                                const alt = isCustom ? item.customProduct?.title : (item.product?.featuredImage?.altText ?? item.product?.title ?? "product");
                                const title = isCustom ? item.customProduct?.title : item.product?.title;

                                return (
                                    <li key={item._id ?? item.id ?? idx} className="flex flex-wrap sm:flex-nowrap items-start gap-4 p-4 rounded-md hover:bg-gray-50 transition border">
                                        {imgUrl ? (
                                            <div className="w-20 h-20 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                <Image src={imgUrl} alt={alt || "product"} fill sizes="80px" className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500 flex-shrink-0">No image</div>
                                        )}

                                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                                            <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-medium text-gray-800 break-words">{title ?? "Unknown product"}</p>
                                                        {isCustom && <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded whitespace-nowrap">Custom Design</span>}
                                                    </div>

                                                    {isCustom && item.customProduct && (
                                                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                                                            <p>🎨 <strong>Color:</strong> {item.customProduct.color}</p>
                                                            <p>📏 <strong>Size:</strong> {item.customProduct.size}</p>
                                                            <p className="text-xs text-gray-500 mt-1">Custom product ID: {item.customProduct.id}</p>

                                                            {item.customProduct.snapshots && (
                                                                <div className="mt-3 pt-2 border-t border-gray-100">
                                                                    <p className="font-medium mb-2 text-xs text-gray-500 uppercase">Design Views</p>
                                                                    <div className="flex gap-2 flex-wrap">
                                                                        {Object.entries(item.customProduct.snapshots).map(([side, url]) => (
                                                                            <div key={side} className="flex flex-col items-center group">
                                                                                <div className="w-20 h-20 relative border rounded bg-gray-50 overflow-hidden">
                                                                                    <Image
                                                                                        src={url}
                                                                                        alt={side}
                                                                                        fill
                                                                                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                                                                                    />
                                                                                </div>
                                                                                <span className="text-[10px] capitalize mt-1 text-gray-500">{side}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => downloadAssets(item.customProduct!.id)}
                                                                        disabled={downloadingId === item.customProduct.id}
                                                                        className="mt-3 flex items-center gap-2 text-xs bg-black text-white px-3 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                                                                    >
                                                                        {downloadingId === item.customProduct.id ? (
                                                                            <Loader2 size={12} className="animate-spin" />
                                                                        ) : (
                                                                            <Download size={12} />
                                                                        )}
                                                                        Download Production Assets
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {!isCustom && item.variant?.selectedOptions && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {Object.entries(item.variant.selectedOptions)
                                                                .map(([k, v]) => `${k}: ${v}`)
                                                                .join(" • ")}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity ?? 0}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-semibold text-gray-900">{formatCurrency(itemTotal, order.payment?.currency ?? "INR")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Order activity</h3>
                            <span className="text-sm text-gray-500">{new Date().toLocaleString()}</span>
                        </div>
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <div className="flex items-start gap-3">
                                <Clock className="mt-1" />
                                <div>
                                    <p>
                                        <strong>Placed:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                                    </p>
                                </div>
                            </div>

                            {order.payment && (
                                <div className="flex items-start gap-3">
                                    <CreditCard className="mt-1" />
                                    <div>
                                        <p>
                                            <strong>Payment:</strong> {order.payment.status} — {order.payment.method}
                                        </p>
                                        <p className="text-xs text-gray-500">{order.payment.provider ?? ""}</p>
                                        <p className="text-xs text-gray-500">Created: {order.payment.createdAt ? new Date(order.payment.createdAt).toLocaleString() : "—"}</p>
                                    </div>
                                </div>
                            )}

                            {order.status === "CANCELED" && order.cancelReason && (
                                <div className="text-sm text-red-600">
                                    <strong>Cancel reason:</strong> {order.cancelReason}
                                </div>
                            )}

                            {(order.trackingNumber || order.trackingCompany) && (
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="mt-1" />
                                    <div>
                                        <p><strong>Tracking:</strong> {order.trackingCompany ?? "—"} {order.trackingNumber ? `• ${order.trackingNumber}` : ""}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {order.adminNotes ? (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Admin Notes</h3>
                                <div className="flex gap-2">
                                    <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><Edit2 size={14} /> Edit</button>
                                    <button className="inline-flex items-center gap-2 text-sm text-red-600 hover:opacity-80"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                            <p className="mt-3 text-gray-700">{order.adminNotes}</p>
                        </div>
                    ) : null}
                </div>

                {/* Right: Summary */}
                <aside className="space-y-4">
                    <div className="bg-white rounded-lg shadow-sm p-5">
                        <h4 className="text-sm text-gray-500">Summary</h4>
                        <div className="mt-3 flex flex-col gap-2">
                            <div className="flex justify-between"><span className="text-sm text-gray-600">Items</span><span className="font-medium">{formatCurrency(itemSum, order.payment?.currency ?? "INR")}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-gray-600">Shipping</span><span className="font-medium">—</span></div>
                            <div className="border-t pt-3 flex justify-between"><span className="text-sm">Total</span><span className="text-lg font-bold">{formatCurrency(totalNum, order.payment?.currency ?? "INR")}</span></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-5">
                        <h4 className="text-sm text-gray-500">Shipping</h4>
                        <div className="mt-3 text-sm text-gray-700">
                            <div className="flex items-start gap-2"><MapPin className="mt-1" />
                                <div>
                                    <p className="font-medium">{order.shippingAddress?.line1 ?? "—"}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}</p>
                                    <p className="text-xs text-gray-500">{order.shippingAddress?.city ?? ""}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress?.postalCode ?? ""}</p>
                                    <p className="text-xs text-gray-500">{order.shippingAddress?.country ?? ""} • {order.shippingAddress?.phone ?? ""}</p>
                                </div>
                            </div>
                            {/* {order.billingAddress && (
                <div className="mt-3 text-sm">
                  <p className="text-gray-500 text-xs">Billing:</p>
                  <p className="font-medium">{order.billingAddress.line1 ?? "—"}</p>
                </div>
              )} */}
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button
                                className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm"
                                onClick={() => {
                                    navigator.clipboard?.writeText(window.location.href);
                                    toast.success("Order link copied");
                                }}
                            >
                                <Copy size={14} /> Copy link
                            </button>
                            {order.shippingAddress?.phone && (
                                <a className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm" href={`tel:${order.shippingAddress.phone}`}>
                                    Call customer
                                </a>
                            )}
                        </div>
                    </div>

                    {order.payment && (
                        <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900">Payment Details</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.payment.status] || 'bg-gray-50 text-gray-800'}`}>
                                        {order.payment.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Method</span>
                                    <span className="font-medium">{order.payment.method}</span>
                                </div>
                                {order.payment.provider && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Provider</span>
                                        <span className="font-medium">{order.payment.provider}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount</span>
                                    <span className="font-medium">{order.payment.currency} {Number(order.payment.amount || 0).toFixed(2)}</span>
                                </div>

                                {/* Transaction IDs Section */}
                                {(order.payment as any).providerOrderId && (
                                    <div className="pt-3 border-t space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Transaction Details</p>
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-gray-600 text-xs">Order ID</span>
                                            <div className="flex items-center gap-2 max-w-full">
                                                <code className="bg-gray-50 px-2 py-1 rounded text-xs font-mono text-gray-800 break-all">
                                                    {(order.payment as any).providerOrderId}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard?.writeText((order.payment as any).providerOrderId);
                                                        toast.success("Order ID copied");
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                    title="Copy Order ID"
                                                >
                                                    <Copy className="h-3 w-3 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(order.payment as any).providerPaymentId && (
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-gray-600 text-xs">Payment ID</span>
                                        <div className="flex items-center gap-2 max-w-full">
                                            <code className="bg-gray-50 px-2 py-1 rounded text-xs font-mono text-gray-800 break-all">
                                                {(order.payment as any).providerPaymentId}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard?.writeText((order.payment as any).providerPaymentId);
                                                    toast.success("Payment ID copied");
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="Copy Payment ID"
                                            >
                                                <Copy className="h-3 w-3 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Verification Link */}
                                {(order.payment as any).providerPaymentId && order.payment.provider && (
                                    <a
                                        href={
                                            order.payment.provider.toUpperCase() === 'RAZORPAY'
                                                ? `https://dashboard.razorpay.com/app/payments/${(order.payment as any).providerPaymentId}`
                                                : order.payment.provider.toUpperCase() === 'STRIPE'
                                                    ? `https://dashboard.stripe.com/payments/${(order.payment as any).providerPaymentId}`
                                                    : '#'
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs font-medium mt-2"
                                    >
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Verify in {order.payment.provider} Dashboard
                                    </a>
                                )}

                                <div className="text-xs text-gray-400 pt-2 border-t">
                                    Recorded: {order.payment.createdAt ? new Date(order.payment.createdAt).toLocaleString() : "—"}
                                </div>

                                {/* Update Payment Status */}
                                <div className="pt-3 border-t">
                                    <div className="flex gap-2">
                                        <select
                                            value={paymentStatusUpdate}
                                            onChange={(e) => setPaymentStatusUpdate(e.target.value)}
                                            className="border rounded px-2 py-1 text-sm flex-1"
                                        >
                                            <option value=''>Change status…</option>
                                            <option value='INITIATED'>INITIATED</option>
                                            <option value='PAID'>PAID</option>
                                            <option value='SUCCESS'>SUCCESS</option>
                                            <option value='PAYMENT_SUCCESS'>PAYMENT_SUCCESS</option>
                                            <option value='FAILED'>FAILED</option>
                                            <option value='REFUNDED'>REFUNDED</option>
                                            <option value='NONE'>NONE</option>
                                        </select>
                                        <button
                                            onClick={handleUpdatePaymentStatus}
                                            disabled={updating || !paymentStatusUpdate || paymentStatusUpdate === order.payment.status}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                                        >
                                            {updating ? 'Updating…' : 'Update'}
                                        </button>
                                    </div>
                                </div>

                                {/* Refund Section */}
                                {['PAID', 'SUCCESS', 'PAYMENT_SUCCESS'].includes(order.payment.status) && !order.payment.refundId && (
                                    <div className="pt-3 border-t">
                                        <button
                                            onClick={() => setShowRefundModal(true)}
                                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
                                        >
                                            Initiate Refund
                                        </button>
                                    </div>
                                )}

                                {/* Show refund details if refunded */}
                                {order.payment.refundId && (
                                    <div className="pt-3 border-t space-y-2 bg-red-50 p-3 rounded">
                                        <p className="text-xs font-semibold text-red-900 uppercase">Refund Details</p>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-red-700">Refund ID</span>
                                            <code className="bg-white px-2 py-1 rounded font-mono text-red-900">
                                                {order.payment.refundId}
                                            </code>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-red-700">Amount</span>
                                            <span className="font-medium text-red-900">
                                                {order.payment.currency} {Number(order.payment.refundAmount || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        {order.payment.refundedAt && (
                                            <div className="text-xs text-red-700">
                                                Refunded: {new Date(order.payment.refundedAt).toLocaleString()}
                                            </div>
                                        )}
                                        {order.payment.refundReason && (
                                            <div className="text-xs text-red-700">
                                                Reason: {order.payment.refundReason}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Raw Response (Collapsible) */}
                                {order.payment.rawResponse && (
                                    <details className="pt-3 border-t">
                                        <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-900 font-medium">
                                            View Raw Payment Response
                                        </summary>
                                        <pre className="mt-2 p-3 bg-gray-50 rounded text-[10px] overflow-auto max-h-64 font-mono">
                                            {JSON.stringify(order.payment.rawResponse, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Refund Modal */}
            {showRefundModal && order?.payment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Initiate Refund</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Refund Amount ({order.payment.currency})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    max={Number(order.payment.amount)}
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder={`Max: ${Number(order.payment.amount).toFixed(2)}`}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Payment amount: {order.payment.currency} {Number(order.payment.amount).toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Reason for Refund
                                </label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                    placeholder="e.g., Customer requested cancellation"
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <p className="text-xs text-yellow-800">
                                    ⚠️ This will process a real refund through {order.payment.provider}.
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRefundModal(false);
                                    setRefundAmount('');
                                    setRefundReason('');
                                }}
                                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                                disabled={refunding}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInitiateRefund}
                                disabled={refunding || !refundAmount}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {refunding ? 'Processing...' : 'Confirm Refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
