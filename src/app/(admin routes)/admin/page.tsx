"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { productsAPI, ordersAPI, authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AdminDashboardLoading } from "@/components/ui/loading-states";
import {
  // LineChart,
  // Line,
  // CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { ArrowUpRight, User, Package, Tag, Wallet } from "lucide-react";

// ---------------- Types ----------------
interface User { id: string; firstName: string; lastName?: string; email: string; isAdmin: boolean }
interface Order { id: string; user?: User; totalAmount?: number | string; total?: number | string; amount?: number | string; subtotal?: number | string; status: string; createdAt: string }
interface ProductVariant { id: string; inventoryQty: number }
interface Product { id: string; title: string; variants?: ProductVariant[] }

// ---------------- Helpers ----------------
const formatCurrency = (num = 0) => `₹${Number(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const toNumber = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : 0 };

// Small stat card (self-contained so canvas preview works)
function StatCard({ title, value, icon, highlight }: { title: string; value: string | number; icon?: React.ReactNode; highlight?: string }){
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${highlight ?? 'bg-gray-100'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{title}</div>
        <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
      </div>
      <ArrowUpRight className="text-gray-300" />
    </div>
  )
}

export default function AdminDashboardPageImproved(){
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch all dashboard data
  const fetchStats = async () => {
    try{
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
    }catch(e){
      console.error(e);
      setError('Failed to load dashboard');
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ fetchStats(); }, []);

  // derived stats
  const validOrders = useMemo(()=> orders.filter(o => !["CANCELED","REFUNDED"].includes((o.status||"").toUpperCase())), [orders]);
  const canceledOrdersCount = useMemo(()=> orders.filter(o => ["CANCELED","REFUNDED"].includes((o.status||"").toUpperCase())).length, [orders]);
  const totalRevenue = useMemo(()=> validOrders.reduce((s,o) => s + toNumber(o.totalAmount ?? o.total ?? o.amount ?? o.subtotal), 0), [validOrders]);

  const lowStockProducts = useMemo(()=> products.filter(p => p.variants?.some(v => v.inventoryQty < 5)), [products]);
  const recentOrders = useMemo(()=> [...orders].sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,6), [orders]);
  const recentUsers = useMemo(()=> [...users].slice(0,6), [users]);

  // sales chart aggregated by day
  const salesData = useMemo(()=>{
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      map[d] = (map[d] || 0) + toNumber(o.totalAmount ?? o.total ?? o.amount ?? o.subtotal);
    });
    return Object.entries(map).sort((a,b)=> new Date(a[0]).getTime() - new Date(b[0]).getTime()).map(([date,total])=> ({ date, total }));
  }, [orders]);

  if(loading) return <AdminDashboardLoading />
  if(error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-500 gap-4">
      <div>{error}</div>
      <Button variant="outline" onClick={fetchStats}>Retry</Button>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* top stats */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Users" value={users.length} icon={<User size={18} />} highlight="bg-indigo-50" />
        <StatCard title="Orders" value={orders.length} icon={<Package size={18} />} highlight="bg-sky-50" />
        <StatCard title="Products" value={products.length} icon={<Tag size={18} />} highlight="bg-amber-50" />
        <StatCard title="Revenue" value={formatCurrency(totalRevenue)} icon={<Wallet size={18} />} highlight="bg-emerald-50" />
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left: chart + recent orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sales (last period)</h3>
              <div className="text-sm text-gray-500">Total {formatCurrency(totalRevenue)}</div>
            </div>
            {salesData.length ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(v:any)=> formatCurrency(v)} />
                    <Area type="monotone" dataKey="total" stroke="#2563eb" fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No sales data yet</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
            {recentOrders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead className="text-left text-gray-500 border-b">
                    <tr><th className="py-2">Order</th><th className="py-2">Customer</th><th className="py-2">Total</th><th className="py-2">Status</th><th className="py-2">Date</th></tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o=> (
                      <tr key={o.id} className="hover:bg-gray-50 border-b last:border-0">
                        <td className="py-2 font-medium">{o.id?.slice(0,8)}...</td>
                        <td className="py-2">{o.user?.firstName ?? '—'}</td>
                        <td className="py-2">{formatCurrency(toNumber(o.totalAmount ?? o.total ?? o.amount ?? o.subtotal))}</td>
                        <td className="py-2">{o.status}</td>
                        <td className="py-2">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No recent orders</div>
            )}
          </div>
        </div>

        {/* right column: low-stock and recent customers */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h4 className="text-sm text-gray-500">Low-stock alerts</h4>
            {lowStockProducts.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {lowStockProducts.slice(0,6).map(p => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.title}</span>
                    <span className="text-red-600">{p.variants?.[0]?.inventoryQty ?? 0} left</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 text-sm text-gray-500">No low-stock items</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h4 className="text-sm text-gray-500">Recent customers</h4>
            {recentUsers.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {recentUsers.map(u => (
                  <li key={u.id} className="flex flex-col">
                    <span className="font-medium">{u.firstName} {u.lastName ?? ''}</span>
                    <span className="text-xs text-gray-500">{u.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 text-sm text-gray-500">No recent customers</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm text-sm">
            <div className="flex justify-between"><span>Orders</span><strong>{orders.length}</strong></div>
            <div className="flex justify-between mt-2"><span>Canceled</span><strong className="text-red-600">{canceledOrdersCount}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  )
}
