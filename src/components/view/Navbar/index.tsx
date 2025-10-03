"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/atoms/cart";
import { useShopifyMenu, MenuItem } from "@/hooks/useShopifyMenu";

const Navbar = () => {
  const { cart } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;

  const { menu: menMenu } = useShopifyMenu("men");
  const { menu: womenMenu } = useShopifyMenu("women");

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Navbar scroll hide state
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current) {
        // scrolling down
        setVisible(false);
      } else {
        // scrolling up
        setVisible(true);
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleOpen = (menu: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpenMenu(menu);
  };

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 500); // 0.5 second delay before closing
  };

  const toggleMobileMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const renderSubMenu = (items?: MenuItem[]) => {
    if (!items || items.length === 0) return null;
    return (
      <ul className="absolute left-0 top-full mt-2 min-w-[200px] flex-col rounded-md border bg-white shadow-lg">
        {items.map((item) => (
          <li key={item.id} className="relative group">
            <Link
              href={item.url || "#"}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {item.title}
            </Link>
            {item.children && item.children.length > 0 && renderSubMenu(item.children)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b bg-white shadow-md transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-gray-800">
          Urbanic Pitara
        </Link>

        {/* Main navigation */}
        <nav className="flex items-center gap-8">
          {/* Men */}
          <div
            className="relative"
            onMouseEnter={() => !isMobile && handleOpen("men")}
            onMouseLeave={() => !isMobile && handleClose()}
          >
            <button
              onClick={() => isMobile && toggleMobileMenu("men")}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-caribbean-current transition-colors"
            >
              Men <ChevronDown className="h-4 w-4" />
            </button>
            {openMenu === "men" && renderSubMenu(menMenu)}
          </div>

          {/* Women */}
          <div
            className="relative"
            onMouseEnter={() => !isMobile && handleOpen("women")}
            onMouseLeave={() => !isMobile && handleClose()}
          >
            <button
              onClick={() => isMobile && toggleMobileMenu("women")}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-caribbean-current transition-colors"
            >
              Women <ChevronDown className="h-4 w-4" />
            </button>
            {openMenu === "women" && renderSubMenu(womenMenu)}
          </div>

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
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
