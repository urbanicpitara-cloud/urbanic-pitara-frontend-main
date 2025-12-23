"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersAPI } from "@/lib/api";
import { exportToCSV } from "@/lib/export";
import Image from "next/image";
import { toast } from "sonner";
import { OrdersPageLoading } from "@/components/ui/loading-states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MoreHorizontal, Eye, Trash2, FileDown } from "lucide-react";

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string };
}

interface OrderItem {
  id: string;
  quantity: number;
  product: Product | null;
  customProduct?: {
    id: string;
    title: string;
    previewUrl?: string;
  } | null;
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
  payment?: {
    id: string;
    status: string;
    method: string;
    provider?: string;
    providerOrderId?: string;
    providerPaymentId?: string;
    amount: number;
    currency: string;
    createdAt: string;
  } | null;
}

const PAGE_SIZE = 10;
const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  canceled: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200"
};

const paymentStatusColors: Record<string, string> = {
  INITIATED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PAID: "bg-green-50 text-green-700 border-green-200",
  SUCCESS: "bg-green-50 text-green-700 border-green-200",
  PAYMENT_SUCCESS: "bg-green-50 text-green-700 border-green-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-purple-50 text-purple-700 border-purple-200",
  NONE: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
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

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          (o._id || o.id || "").toLowerCase().includes(lowerTerm) ||
          (o.user?.firstName || "").toLowerCase().includes(lowerTerm) ||
          (o.user?.email || "").toLowerCase().includes(lowerTerm)
      )
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
  }, [orders, statusFilter, searchTerm, startDate, endDate]);

  const formatAmount = (order: Order) => {
    const value = order.total ?? order.totalAmount ?? order.subtotal ?? 0;
    return Number(value || 0).toFixed(2);
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
      toast.success(`Updated ${selectedOrders.length} orders`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update orders.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;

    try {
      await ordersAPI.bulkDeleteAdmin(selectedOrders);
      toast.success(`${selectedOrders.length} order(s) deleted successfully`);
      await fetchOrders();
      setSelectedOrders([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete orders.");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateStatusAdmin(orderId, { status: newStatus as any });
      await fetchOrders();
      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status.");
    }
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const csvData = filteredOrders.map((order) => {
      const names = [];
      if (order.user?.firstName) names.push(order.user.firstName);
      if (order.user?.lastName) names.push(order.user.lastName);

      return {
        "Order ID": order._id || order.id || "",
        "Customer Name": names.join(" ") || "Guest",
        "Customer Email": order.user?.email || "",
        "Total Amount": order.total || order.totalAmount || order.subtotal || 0,
        "Status": order.status || "PENDING",
        "Payment Status": order.payment?.status || "PENDING",
        "Payment ID": order.payment?.providerPaymentId || "",
        "Date": order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "",
        "Item Count": order.items?.length || 0,
      };
    });

    exportToCSV(csvData, `orders-export-${new Date().toISOString().split("T")[0]}`);
    toast.success("Orders exported successfully");
  };

  if (loading)
    return <OrdersPageLoading />;

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 space-y-4">
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={fetchOrders} variant="outline">Retry</Button>
      </div>
    );

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track your customer orders.</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      {/* Filters & Actions Bar */}
      <Card>
        <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:flex-wrap md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Order ID, Customer..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Filter Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {/* Simple date inputs for now, could be improved with DatePicker later */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-auto"
              />
              <span className="text-gray-400">-</span>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
              <span className="text-sm font-medium mr-2">{selectedOrders.length} selected</span>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Status..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleBulkUpdate} disabled={!bulkStatus}>Update</Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={handleBulkDelete}
                title="Delete Selected"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order, i) => {
                const id = order._id ?? order.id ?? `unknown-${i}`;
                const shortId = typeof id === "string" ? id.slice(0, 8).toUpperCase() : "—";
                const status = order.status?.toLowerCase() || "pending";

                return (
                  <TableRow key={id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(id)}
                        onCheckedChange={(checked) => handleSelectOrder(id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium font-mono text-xs text-gray-500">
                      <span className="text-gray-900 text-sm font-sans">{shortId}</span>
                    </TableCell>
                    <TableCell>
                      {order.user ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</span>
                          <span className="text-xs text-gray-500">{order.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Guest User</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2 overflow-hidden py-1">
                        {order.items?.slice(0, 3).map((item) => {
                          const img = item.customProduct?.previewUrl || item.product?.featuredImage?.url;
                          return img ? (
                            <div key={item.id} className="relative w-8 h-8 rounded-full border-2 border-white ring-1 ring-gray-100 overflow-hidden bg-gray-100">
                              <Image
                                src={img}
                                alt="Product"
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            </div>
                          ) : null;
                        })}
                        {(order.items?.length ?? 0) > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600">
                            +{(order.items?.length ?? 0) - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{formatAmount(order)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-normal ${statusColors[status] || "bg-gray-100"}`}>
                        {order.status || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.payment ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={`font-normal border-0 ${paymentStatusColors[order.payment.status]}`}>
                            {order.payment.status}
                          </Badge>
                          {order.payment.providerPaymentId && (
                            <code
                              className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]"
                              title={order.payment.providerPaymentId}
                            >
                              {order.payment.providerPaymentId.slice(0, 16)}...
                            </code>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${id}`} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          {STATUSES.map(s => (
                            <DropdownMenuItem key={s} onClick={() => handleStatusChange(id, s)}>
                              <span className={status === s.toLowerCase() ? "font-bold" : ""}>{s}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
