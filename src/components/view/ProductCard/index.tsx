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

interface ProductCardProps {
  product: Product;
  idx? : number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  
  const quantity = 1; // Since we always use 1 and never change it
  const selectedVariant = product.variants[0] ?? null;

  const price = parseFloat(product.minPriceAmount || "0");
  const maxPrice = parseFloat(product.maxPriceAmount || "0");
  const comparePrice = parseFloat(product.compareMaxAmount || "0");
  const currency = product.minPriceCurrency || "₹";

  const displayPrice =
    price && maxPrice && price !== maxPrice
      ? `${currency} ${price.toFixed(2)} - ${currency} ${maxPrice.toFixed(2)}`
      : `${currency} ${price.toFixed(2)}`;

  const displayCompare =
    comparePrice && comparePrice > maxPrice
      ? `${currency} ${comparePrice.toFixed(2)}`
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      className="group h-full"
    >
      <div className="border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white flex flex-col h-full">
        {/* Image wrapper */}
        <div className="relative w-full h-[16rem] md:h-[19rem] lg:h-[22rem]  bg-gray-100 overflow-hidden">
          <Image
            src={firstImage}
            alt={product.featuredImageAlt || product.title}
            fill
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
            sizes="(max-width: 768px) 100vw, 25vw"
            priority
          />
          <Image
            src={secondImage}
            alt={product.featuredImageAlt || product.title}
            fill
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            <Link
              href={`/products/${product.handle}`} className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
              {product.title}
            </Link>
            <p className="text-gray-700 mt-1">
              {displayPrice}{" "}
              {displayCompare && (
                <span className="ml-2 line-through text-gray-400">{displayCompare}</span>
              )}
            </p>
          </div>

          <div className="flex justify-between items-center mt-4">

            <Button
              size="sm"
              variant="default"
              onClick={handleAddToCart}
              className="w-full"
              disabled={adding || !selectedVariant}
            >
              {adding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
