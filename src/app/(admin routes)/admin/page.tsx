"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { productsAPI, ordersAPI, authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AdminDashboardLoading } from "@/components/ui/loading-states";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import {
  ArrowUpRight,
  User,
  Package,
  Tag,
  Wallet,
  TrendingUp,
  ArrowDownRight,
  Clock,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

// ---------------- Types ----------------
interface User { id: string; firstName: string; lastName?: string; email: string; isAdmin: boolean; createdAt: string }
interface Order { id: string; user?: User; totalAmount?: number | string; total?: number | string; amount?: number | string; subtotal?: number | string; status: string; createdAt: string }
interface ProductVariant { id: string; inventoryQty: number }
interface Product { id: string; title: string; variants?: ProductVariant[] }

// ---------------- Helpers ----------------
const formatCurrency = (num = 0) => `₹${Number(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const toNumber = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : 0 };

// Improved Stat Card
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="h-4 w-4 text-gray-500">
            <Icon size={16} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${trend === "up" ? "bg-green-100 text-green-700" :
              trend === "down" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
              }`}>
              {trend === "up" ? <TrendingUp size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let className = "";

  if (["DELIVERED", "COMPLETED", "PAID"].includes(s)) {
    variant = "default";
    className = "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
  } else if (["PENDING", "PROCESSING", "UNPAID"].includes(s)) {
    variant = "secondary";
    className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
  } else if (["CANCELED", "REFUNDED", "FAILED"].includes(s)) {
    variant = "destructive";
    className = "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
  }

  return (
    <Badge variant={variant} className={`font-normal ${className}`}>
      {status}
    </Badge>
  );
}

export default function AdminDashboardPageImproved() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch all dashboard data
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        authAPI.getAllUsers(),
        ordersAPI.getAllAdmin({ all: true }),
        productsAPI.getAll({ all: true }),
      ]);

      const rawOrders: Order[] = ordersRes?.data?.orders || [];
      const rawUsers: User[] = usersRes?.data?.users || [];
      const rawProducts: Product[] = productsRes?.data?.products || [];

      setOrders(rawOrders);
      setUsers(rawUsers.filter(u => !u.isAdmin));
      setProducts(rawProducts);
    } catch (e) {
      console.error(e);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, []);

  // derived stats
  const validOrders = useMemo(() => orders.filter(o => !["CANCELED", "REFUNDED"].includes((o.status || "").toUpperCase())), [orders]);
  const canceledOrdersCount = useMemo(() => orders.filter(o => ["CANCELED", "REFUNDED"].includes((o.status || "").toUpperCase())).length, [orders]);
  const totalRevenue = useMemo(() => validOrders.reduce((s, o) => s + toNumber(o.totalAmount ?? o.total ?? o.amount ?? o.subtotal), 0), [validOrders]);

  const lowStockProducts = useMemo(() => products.filter(p => p.variants?.some(v => v.inventoryQty < 5)), [products]);
  const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6), [orders]);
  const recentUsers = useMemo(() => [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6), [users]);

  // sales chart aggregated by day
  const salesData = useMemo(() => {
    const map: Record<string, number> = {};
    // Sort orders by date first to ensure chart is chronological
    const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    sortedOrders.forEach(o => {
      const d = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      map[d] = (map[d] || 0) + toNumber(o.totalAmount ?? o.total ?? o.amount ?? o.subtotal);
    });

    // Take last 7-14 entries if too many
    return Object.entries(map).map(([date, total]) => ({ date, total }));
  }, [orders]);

  if (loading) return <AdminDashboardLoading />
  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-500 gap-4">
      <AlertCircle className="h-10 w-10" />
      <div className="text-lg font-medium">{error}</div>
      <Button variant="outline" onClick={fetchStats}>Retry</Button>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Date Range Picker Placeholder */}
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Clock className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button>Download Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={Wallet}
          trend="up"
          trendValue="12% vs last month"
        />
        <StatCard
          title="Orders"
          value={orders.length}
          icon={Package}
          trend="up"
          trendValue="+5 this week"
        />
        <StatCard
          title="Products"
          value={products.length}
          icon={Tag}
          trend="neutral"
          trendValue={`${lowStockProducts.length} low stock`}
        />
        <StatCard
          title="Active Customers"
          value={users.length}
          icon={User}
          trend="up"
          trendValue="+3 new today"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Left Column: Chart & Recent Orders */}
        <div className="col-span-4 space-y-4">

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Revenue trajectory over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#000000"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No sales data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  You made {validOrders.length} sales this month.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/orders" className="text-xs">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                            {order.id.slice(0, 8).toUpperCase()}...
                          </Link>
                        </TableCell>
                        <TableCell>
                          {order.user ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{order.user.firstName}</span>
                              <span className="text-xs text-gray-500">{order.user.email}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Guest</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(toNumber(order.totalAmount ?? order.total ?? order.amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">No recent orders found.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Other Stats */}
        <div className="col-span-3 space-y-4">
          {/* Recent Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>Latest users who joined</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentUsers.length > 0 ? recentUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {u.firstName.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-gray-500">No customers yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Items with less than 5 units</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {lowStockProducts.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                      <div className="text-sm font-medium truncate max-w-[180px]" title={p.title}>{p.title}</div>
                      <Badge variant="destructive" className="h-6">
                        {p.variants?.[0]?.inventoryQty ?? 0} left
                      </Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <Button variant="link" size="sm" className="w-full text-gray-500" asChild>
                      <Link href="/admin/products?stock=low">View All Low Stock</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-green-600 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  All inventory levels healthy
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

