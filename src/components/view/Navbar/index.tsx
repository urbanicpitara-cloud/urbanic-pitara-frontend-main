"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/atoms/cart";
import { useShopifyMenu, MenuItem } from "@/hooks/useShopifyMenu";
import { isAuthenticated } from "@/hooks/useStorefront";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Navbar = () => {
  const { cart } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const { menu: menMenu } = useShopifyMenu("men");
  const { menu: womenMenu } = useShopifyMenu("women");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current) setVisible(false);
      else setVisible(true);
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    document.cookie =
      "customerAccessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/");
  };

  // Recursive function to render nested menus inside dropdown
  const renderDropdownItems = (items?: MenuItem[]) => {
    if (!items || items.length === 0) return null;
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <DropdownMenuItem key={item.id} className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex justify-between w-full">
                  {item.title} <ChevronDown className="ml-2 h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[180px] left-full top-0 absolute z-50">
                {renderDropdownItems(item.children)}
              </DropdownMenuContent>
            </DropdownMenu>
          </DropdownMenuItem>
        );
      }
      return (
        <DropdownMenuItem key={item.id} asChild>
          <Link href={item.url || "#"} className="w-full text-left">
            {item.title}
          </Link>
        </DropdownMenuItem>
      );
    });
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b bg-white shadow-md transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="relative w-[130px] md:w-[220px] h-[50px] md:h-[60px]">
            <Image
              src="/new_logo.png"
              alt="Urbanic Pitara"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {/* Men Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-caribbean-current transition-colors">
                Men <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[200px]">
              {renderDropdownItems(menMenu)}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Women Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-caribbean-current transition-colors">
                Women <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[200px]">
              {renderDropdownItems(womenMenu)}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-caribbean-current"
          >
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -right-2 -top-2 h-5 min-w-[20px] rounded-full px-1"
              >
                {itemCount}
              </Badge>
            )}
          </Link>

          {/* Auth Dropdown */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" /> Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Login
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-800"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white shadow-inner border-t">
          <div className="px-4 py-4 flex flex-col gap-4">
            {/* Mobile dropdown for Men */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex justify-between w-full text-gray-700 font-medium">
                  Men <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[200px]">
                {renderDropdownItems(menMenu)}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile dropdown for Women */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex justify-between w-full text-gray-700 font-medium">
                  Women <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[200px]">
                {renderDropdownItems(womenMenu)}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/cart"
              className="flex items-center gap-2 text-gray-700 font-medium"
            >
              <ShoppingCart className="h-5 w-5" /> Cart ({itemCount})
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/profile" className="block text-gray-700">
                  Profile
                </Link>
                <Link href="/profile/orders" className="block text-gray-700">
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
