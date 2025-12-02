"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Image from "next/image";
import { ordersAPI } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Clock, CreditCard, MapPin, Edit2, Trash2, Copy } from "lucide-react";

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
        amount: number | string;
        currency: string;
        createdAt?: string;
        rawResponse?: any;
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
            // prefill payment status update select with empty (user must choose)
            setPaymentStatusUpdate("");
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
            setPaymentStatusUpdate("");
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order <span className="text-indigo-600">#{order._id ?? order.id}</span>
                        </h1>
                        <p className="text-sm text-gray-500">
                            {order.user?.firstName ?? ""} {order.user?.lastName ?? ""} • {order.user?.email ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status ?? "PENDING"]}`}>
                        {order.status}
                    </span>
                    <select
                        value={order.status ?? "PENDING"}
                        onChange={(e) => updateStatus(e.target.value as StatusType)}
                        disabled={updating}
                        className="border rounded-md px-3 py-1 text-sm"
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items + Notes (left) */}
                <div className="lg:col-span-2 space-y-6">
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
                                    <li key={item._id ?? item.id ?? idx} className="flex items-start gap-4 p-4 rounded-md hover:bg-gray-50 transition border">
                                        {imgUrl ? (
                                            <div className="w-20 h-20 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                <Image src={imgUrl} alt={alt || "product"} fill sizes="80px" className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500 flex-shrink-0">No image</div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-800">{title ?? "Unknown product"}</p>
                                                        {isCustom && <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded">Custom Design</span>}
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
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <h4 className="text-sm text-gray-500">Payment</h4>
                            <div className="mt-3 text-sm text-gray-700 space-y-2">
                                <div className="flex justify-between"><span>Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[order.payment.status] || 'bg-gray-50 text-gray-800'}`}>{order.payment.status}</span></div>
                                <div className="flex justify-between"><span>Method</span><span className="font-medium">{order.payment.method}</span></div>
                                <div className="flex justify-between"><span>Amount</span><span className="font-medium">{order.payment.currency} {Number(order.payment.amount || 0).toFixed(2)}</span></div>
                                <div className="text-xs text-gray-400">Recorded at: {order.payment.createdAt ? new Date(order.payment.createdAt).toLocaleString() : "—"}</div>

                                <div className="mt-2 flex gap-2">
                                    <select value={paymentStatusUpdate} onChange={(e) => setPaymentStatusUpdate(e.target.value)} className="border rounded px-2 py-1 text-sm flex-1">
                                        <option value=''>Change status…</option>
                                        <option value='INITIATED'>INITIATED</option>
                                        <option value='PAID'>PAID</option>
                                        <option value='FAILED'>FAILED</option>
                                        <option value='REFUNDED'>REFUNDED</option>
                                        <option value='NONE'>NONE</option>
                                    </select>
                                    <button onClick={handleUpdatePaymentStatus} disabled={updating || !paymentStatusUpdate || paymentStatusUpdate === order.payment.status} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                                        {updating ? 'Updating…' : 'Update'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
