"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersAPI } from "@/lib/api";
import Image from "next/image";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string };
}

interface OrderItem {
  id: string;
  quantity: number;
  product: Product;
}

interface Order {
  _id?: string;
  id?: string;
  user?: { firstName?: string; lastName?: string; email?: string };
  status?: string;
  total?: number;
  totalAmount?: number;
  subtotal?: number;
  createdAt?: string;
  items?: OrderItem[];
}

const PAGE_SIZE = 10;
// const MAX_AVATAR_DISPLAY = 5;
const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getAllAdmin({ all: true });
      setOrders(res?.data?.orders ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Please check your admin session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== "all") {
      result = result.filter(
        (order) => order.status?.toLowerCase() === statusFilter
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      result = result.filter(
        (order) => order.createdAt && new Date(order.createdAt) >= start
      );
    }
    if (endDate) {
      const end = new Date(endDate);
      result = result.filter(
        (order) => order.createdAt && new Date(order.createdAt) <= end
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [orders, statusFilter, startDate, endDate]);

  const formatAmount = (order: Order) => {
    const value = order.total ?? order.totalAmount ?? order.subtotal ?? 0;
    return Number(value || 0).toFixed(2);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
  };

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSelectOrder = (id: string, checked: boolean) => {
    setSelectedOrders((prev) =>
      checked ? [...prev, id] : prev.filter((oid) => oid !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const idsOnPage = paginatedOrders.map((o, i) => o._id ?? o.id ?? `unknown-${i}`);
      setSelectedOrders(idsOnPage);
    } else {
      setSelectedOrders([]);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedOrders.length === 0) return;
    try {
      await Promise.all(
        selectedOrders.map((id) =>
          ordersAPI.updateStatusAdmin(id, { status: bulkStatus as any })
        )
      );
      await fetchOrders();
      setSelectedOrders([]);
      setBulkStatus("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update orders.");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateStatusAdmin(orderId, { status: newStatus as any });
      await fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Loading orders...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 space-y-4">
        <p>{error}</p>
        <button
          onClick={fetchOrders}
          className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="canceled">Cancelled</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="mb-4 flex gap-2 items-center">
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Change Status...</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Selected ({selectedOrders.length})
          </button>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={
                      selectedOrders.length === paginatedOrders.length &&
                      paginatedOrders.length > 0
                    }
                  />
                </th>
                <th className="px-4 py-3 text-left border">Order ID</th>
                <th className="px-4 py-3 text-left border">User</th>
                <th className="px-4 py-3 text-left border">Products</th>
                <th className="px-4 py-3 text-left border">Total (₹)</th>
                <th className="px-4 py-3 text-left border">Status</th>
                <th className="px-4 py-3 text-left border">Date</th>
                <th className="px-4 py-3 text-left border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, i) => {
                const id = order._id ?? order.id ?? `unknown-${i}`;
                const shortId = typeof id === "string" ? id.slice(0, 8) + "..." : "—";
                const statusClass =
                  order.status && statusColors[order.status.toLowerCase()]
                    ? statusColors[order.status.toLowerCase()]
                    : "bg-gray-100 text-gray-800";

                // const productsToShow = order.items?.slice(0, MAX_AVATAR_DISPLAY) ?? [];
                // const extraCount = (order.items?.length ?? 0) - MAX_AVATAR_DISPLAY;

                return (
                  <tr key={id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 border">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(id)}
                        onChange={(e) => handleSelectOrder(id, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-2 border">{shortId}</td>
                    <td className="px-4 py-2 border">
                      {order.user?.firstName || ""} {order.user?.lastName || ""} (
                      {order.user?.email || "No Email"})
                    </td>
                    <td className="px-2 py-2 border">
                      <div className="flex items-center justify-center">
                        <div className="flex -space-x-2">
                          {order.items?.slice(0, 4).map((item) =>
                            item.product.featuredImage?.url ? (
                              <Image
                                key={item.id}
                                src={item.product.featuredImage.url}
                                alt={item.product.featuredImage.altText || item.product.title}
                                width={25}
                                height={25}
                                sizes="80px"
                                className="rounded-full object-cover border-2 border-white hover:scale-110 transition"
                                title={item.product.title}
                              />
                            ) : null
                          )}
                          {(order.items?.length ?? 0) > 4 && (
                            <span className="w-8 h-8 flex items-center justify-center text-xs font-medium bg-gray-200 text-gray-700 rounded-full border-2 border-white">
                              +{(order.items?.length ?? 0) - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2 border">{formatAmount(order)}</td>
                    <td className="px-4 py-2 border">
                      <select
                        value={order.status?.toUpperCase() ?? ""}
                        onChange={(e) => handleStatusChange(id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 border">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2 border">
                      <Link href={`/admin/orders/${id}`} className="text-blue-600 hover:underline text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
