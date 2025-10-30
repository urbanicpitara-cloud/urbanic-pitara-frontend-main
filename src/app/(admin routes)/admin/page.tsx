"use client";

import { useEffect, useState, useMemo } from "react";
import StatCard from "@/components/admin/StateCard";
import { productsAPI, ordersAPI, authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Types ---
interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  isAdmin: boolean;
}

interface Order {
  id: string;
  user?: User;
  totalAmount?: number;
  total?: number;
  amount?: number;
  subtotal?: number;
  status: string;
  createdAt: string;
}

interface ProductVariant {
  id: string;
  inventoryQty: number;
}

interface Product {
  id: string;
  title: string;
  variants?: ProductVariant[];
}

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  canceledOrders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    canceledOrders: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🧮 Revenue Calculation
const calculateRevenue = (orders: Order[]): number =>
  orders.reduce((sum, o) => {
    const raw =
      o.totalAmount || o.total || o.amount || o.subtotal || 0;
    const num = Number(raw) || 0;
    return sum + num;
  }, 0);


  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        authAPI.getAllUsers(),
        ordersAPI.getAllAdmin({ all: true }),
        productsAPI.getAll({ all: true }),
      ]);

      const rawOrders: Order[] = ordersRes.data?.orders || [];
      const rawUsers: User[] = usersRes.data?.users || [];
      const productsData: Product[] = productsRes.data?.products || [];

      // ✅ Exclude canceled/refunded
      const validOrders = rawOrders.filter(
        (o) => !["CANCELED", "REFUNDED"].includes(o.status)
      );

      // ✅ Count canceled orders
      const canceledOrders = rawOrders.filter((o) =>
        ["CANCELED", "REFUNDED"].includes(o.status)
      ).length;

      // ✅ Exclude admin users
      const validUsers = rawUsers.filter((u) => !u.isAdmin);

      setOrders(validOrders);
      setProducts(productsData);
      setUsers(validUsers);

      setStats({
        totalUsers: validUsers.length,
        totalOrders: validOrders.length,
        totalProducts: productsData.length,
        totalRevenue: calculateRevenue(validOrders),
        canceledOrders,
      });
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 📈 Sales chart data
  const salesData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      map[d] = (map[d] || 0) + (o.totalAmount || 0);
    });
    return Object.entries(map).map(([date, total]) => ({ date, total }));
  }, [orders]);

  // 🧾 Helpers
  const lowStockProducts = products.filter((p) =>
    p.variants?.some((v) => v.inventoryQty < 5)
  );
  const recentOrders = orders.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  const formatCurrency = (num: number) =>
    `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 space-y-4">
        <p>{error}</p>
        <Button variant="outline" onClick={fetchStats}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* --- Top Stats --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Users" value={stats.totalUsers} icon="user" accent="beige" />
        <StatCard title="Orders" value={stats.totalOrders} icon="package" accent="gold" />
        <StatCard title="Products" value={stats.totalProducts} icon="shopping-bag" accent="brown" />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="wallet"
          accent="green"
        />
        <StatCard
          title="Canceled Orders"
          value={stats.canceledOrders}
          icon="xcircle"
          accent="red"
        />
      </div>

      {/* --- Sales Trend --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Sales Trend</h3>
        {salesData.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <Line type="monotone" dataKey="total" stroke="#D4AF37" strokeWidth={2} />
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(val) => formatCurrency(Number(val))} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500">No order data available.</p>
        )}
      </div>

      {/* --- Recent Orders --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Orders</h3>
        {recentOrders.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-gray-500">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 font-medium">{o.id.slice(0, 8)}...</td>
                  <td>{o.user?.firstName || "—"}</td>
                  <td>{formatCurrency(o.totalAmount || 0)}</td>
                  <td
                    className={`capitalize ${
                      o.status === "delivered"
                        ? "text-green-600"
                        : o.status === "pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {o.status}
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No recent orders.</p>
        )}
      </div>

      {/* --- Low Stock --- */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Low-Stock Alerts</h3>
          <ul className="space-y-2">
            {lowStockProducts.slice(0, 5).map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <span>{p.title}</span>
                <span className="text-red-500">
                  {p.variants?.[0]?.inventoryQty ?? 0} left
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Recent Customers --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Customers</h3>
        {recentUsers.length ? (
          <ul className="space-y-2">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex justify-between text-sm">
                <span>
                  {u.firstName} {u.lastName}
                </span>
                <span className="text-gray-500">{u.email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No recent customers.</p>
        )}
      </div>
    </div>
  );
}
