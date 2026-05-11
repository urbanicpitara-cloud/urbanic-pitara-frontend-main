"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Tag,
  Shirt,
  BadgeIndianRupee,
  ShoppingBag,
  Users,
  Mail,
  Palette,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ordersAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/collections", label: "Collections", icon: Shirt },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/customizer", label: "Customizer", icon: Palette },
  { href: "/admin/variant-groups", label: "Variant Groups", icon: Package }, // Reusing Package or similar
  { href: "/admin/discounts", label: "Discounts", icon: BadgeIndianRupee },
  { href: "/admin/users", label: "Customers", icon: Users },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
];

interface SidebarProps {
  mobileNavOpen?: boolean;
  setMobileNavOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileNavOpen, setMobileNavOpen }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<{
    pendingOrders: number;
    lowStock: number;
    outOfStock: number;
    total: number;
    recentPending: { id: string; orderNumber: string; totalAmount: string; status: string; createdAt: string; user: { firstName: string; lastName: string } }[];
  } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  useEffect(() => {
    ordersAPI.getNotifications()
      .then(setNotifications)
      .catch(console.error);
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      ordersAPI.getNotifications()
        .then(setNotifications)
        .catch(console.error);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = notifications?.total ?? 0;

  const NavContent = useMemo(() => {
    const Component = () => (
      <div className="flex flex-col h-full bg-white text-gray-900">
        <div className={cn(
          "h-16 flex items-center border-b border-gray-100",
          collapsed ? "justify-center px-0" : "px-6"
        )}>
          {collapsed ? (
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold font-serif text-lg">U</div>
          ) : (
            <div className="font-serif font-bold text-xl tracking-wide">URBANIC</div>
          )}
        </div>

        {/* Notification Bell */}
        {!collapsed && totalAlerts > 0 && (
          <div className="px-3 py-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <Bell size={18} />
              <span className="text-sm font-medium">Alerts</span>
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {totalAlerts}
              </span>
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && notifications && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                {notifications.pendingOrders > 0 && (
                  <Link
                    href="/admin/orders?status=pending"
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
                    onClick={() => setShowNotifications(false)}
                  >
                    <ShoppingBag size={14} className="text-blue-600" />
                    <span>{notifications.pendingOrders} pending orders</span>
                  </Link>
                )}
                {notifications.lowStock > 0 && (
                  <Link
                    href="/admin/products?lowStock=true"
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
                    onClick={() => setShowNotifications(false)}
                  >
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span>{notifications.lowStock} low stock</span>
                  </Link>
                )}
                {notifications.outOfStock > 0 && (
                  <Link
                    href="/admin/products?outOfStock=true"
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
                    onClick={() => setShowNotifications(false)}
                  >
                    <Package size={14} className="text-red-600" />
                    <span>{notifications.outOfStock} out of stock</span>
                  </Link>
                )}
                {notifications.recentPending?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="px-2 text-xs text-gray-500 mb-1">Recent</p>
                    {notifications.recentPending.slice(0, 3).map((order) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders?id=${order.id}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-100 text-xs"
                        onClick={() => setShowNotifications(false)}
                      >
                        <span>#{order.orderNumber}</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-xs",
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        )}>{order.status}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Collapsed notification badge */}
        {collapsed && totalAlerts > 0 && (
          <Link
            href="/admin/orders"
            className="relative mx-auto mt-2 w-10 h-10 flex items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {totalAlerts > 9 ? '9+' : totalAlerts}
            </span>
          </Link>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-black text-white shadow-md shadow-black/10"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                )}
                onClick={() => setMobileNavOpen?.(false)}
              >
                <Icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-gray-500 group-hover:text-black")} />

                {!collapsed && (
                  <span>{label}</span>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    );
    Component.displayName = 'NavContent';
    return Component;
  }, [collapsed, pathname, logout, setMobileNavOpen]);

  return (
    <>
      {/* Mobile Drawer - Controlled by Props */}
      <div className="lg:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-gray-100 bg-white transition-all duration-300 ease-in-out z-20 h-screen sticky top-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <NavContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-black shadow-sm z-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}
