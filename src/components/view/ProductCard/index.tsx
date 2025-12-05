"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/atoms/cart";
import { toast } from "sonner";
import { Product } from "@/types/products";
import { getCurrencySymbol } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
  idx?: number;
}

export default function ProductCard({ product, idx }: ProductCardProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const quantity = 1; // Since we always use 1 and never change it
  const selectedVariant = product.variants[0] ?? null;

  const price = parseFloat(product.minPriceAmount || "0");
  const currencySymbol = getCurrencySymbol(product.minPriceCurrency);

  const displayPrice =
    selectedVariant?.priceAmount
      ? `${currencySymbol}${parseFloat(selectedVariant.priceAmount.toString()).toFixed(2)}`
      : `${currencySymbol}${price.toFixed(2)}`;

  const displayCompare =
    selectedVariant?.compareAmount && parseFloat(selectedVariant.compareAmount.toString()) > parseFloat(selectedVariant.priceAmount.toString())
      ? `${currencySymbol}${parseFloat(selectedVariant.compareAmount.toString()).toFixed(2)}`
      : null;

  const firstImage =
    product.images && product.images[0]?.url
      ? product.images[0].url
      : product.featuredImageUrl;
  const secondImage =
    product.images && product.images[1]?.url
      ? product.images[1].url
      : firstImage;

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, quantity, selectedVariant.id);
      toast.success(`${product.title} added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }, [addItem, product.id, selectedVariant, quantity, adding, product.title]);

  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group h-full"
    >
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white flex flex-col h-full transition-shadow duration-300 hover:shadow-lg relative">
        {/* Wishlist Button - Always visible on desktop hover, visible on mobile */}
        {/* <button
          onClick={(e) => {
            e.preventDefault();
            // Handle wishlist logic here if needed
            toast.success("Added to wishlist");
          }}
          className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white hover:text-red-500 text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button> */}

        {/* Discount Badge - Top Left */}
        {displayCompare && selectedVariant?.compareAmount && selectedVariant?.priceAmount && (
          <div className="absolute top-3 left-3 z-20 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
            {Math.round(((parseFloat(selectedVariant.compareAmount.toString()) - parseFloat(selectedVariant.priceAmount.toString())) / parseFloat(selectedVariant.compareAmount.toString())) * 100)}% OFF
          </div>
        )}


        {/* Image wrapper */}
        <Link href={`/products/${product.handle}`} className="block relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
          <Image
            src={firstImage}
            alt={product.featuredImageAlt || product.title}
            fill
            className="object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={idx !== undefined && idx < 4}
          />
          <Image
            src={secondImage}
            alt={product.featuredImageAlt || product.title}
            fill
            className="object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Quick Add Overlay - Appears at bottom of image on hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              className="w-full shadow-md bg-white text-black hover:bg-black hover:text-white border border-transparent hover:border-black transition-colors"
              disabled={adding || !selectedVariant}
            >
              {adding ? "Adding..." : "Quick Add"}
            </Button>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            <Link
              href={`/products/${product.handle}`}
              className="block text-base font-medium text-gray-900 mb-1 hover:text-gray-600 transition-colors line-clamp-1"
            >
              {product.title}
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{displayPrice}</span>
              {displayCompare && (
                <span className="text-xs text-gray-500 line-through">{displayCompare}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
