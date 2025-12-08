"use client";

import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";
import { ChevronRight, Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMobileNavOpen?: () => void;
}

export default function Header({ onMobileNavOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Button variant="ghost" size="icon" className="lg:hidden -ml-2 mr-2" onClick={onMobileNavOpen}>
          <Menu className="w-5 h-5" />
        </Button>
        <span className="font-medium text-gray-900">Urbanic</span>
        {breadcrumbs.map((crumb, index) => (
          <div key={`breadcrumb-${index}`} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className={index === breadcrumbs.length - 1 ? "font-medium text-gray-900" : ""}>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Search (Placeholder) */}
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-64 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-300 transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-gray-400"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-full transition-colors outline-none focus:ring-2 focus:ring-black/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-semibold text-sm border border-indigo-200">
                {user?.firstName?.charAt(0) || "A"}
              </div>
              <div className="hidden md:block text-left mr-2">
                <div className="text-sm font-medium text-gray-900 leading-none">{user?.firstName}</div>
                <div className="text-xs text-gray-500 mt-0.5">Administrator</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={logout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
