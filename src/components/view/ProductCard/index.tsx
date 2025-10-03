"use client";

import { Button } from "@/components/ui/button";
import { Product } from "@/types/shopify-graphql";
import React, { useState } from "react";
import Image from "next/image";
import ProductPrice from "./ProductPrice";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/atoms/cart";
import { toast } from "sonner";

const CARD_HEIGHT = 600; // Adjust as needed

const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get primary and hover images
  const primaryImage = product.featuredImage?.url ?? "";
  const hoverImage = product.images?.edges?.[1]?.node?.url ?? primaryImage;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);

    try {
      const defaultVariant =
        product.variants.edges.find(
          ({ node }) =>
            node.selectedOptions.some(
              (opt) => opt.name === "Size" && opt.value === "M"
            )
        )?.node || product.variants.edges[0]?.node;

      if (!defaultVariant) throw new Error("No variant available");

      await addItem(defaultVariant.id, 1);
      toast.success(`Added ${product.title} to cart`);
    } catch {
      toast.error("Failed to add item to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      role="button"
      className="group flex flex-col cursor-pointer bg-ivory rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-500"
      onClick={() => router.push(`/product/${product.handle}`)}
      style={{ height: CARD_HEIGHT }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Image Container */}
        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-beige-200">
          {/* Image wrapper for smooth scaling */}
          <div className="absolute inset-0 w-full h-full transform group-hover:scale-105 transition-transform duration-[1.2s] ease-out">
            {/* Primary Image */}
            <Image
              src={primaryImage}
              alt={product.featuredImage?.altText ?? product.title}
              fill
              className={`object-cover transition-opacity duration-700 ease-in will-change-transform ${
                isHovered ? "opacity-0" : "opacity-100"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />

            {/* Hover Image - Preloaded but hidden */}
            <Image
              src={hoverImage}
              alt={`${product.title} alternate view`}
              fill
              className={`object-cover absolute inset-0 transition-opacity duration-700 ease-out will-change-transform ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </div>
        </div>

        {/* Title + Price */}
        <div className="mt-3">
          <h2 className="text-lg font-serif tracking-wide text-black line-clamp-2">
            {product.title}
          </h2>
          <ProductPrice priceRange={product.priceRange} />
        </div>

        {/* Add to Cart Button */}
        <div className="mt-4">
          <Button
            className={`w-full rounded-xl transition-colors ${
              isAdding
                ? "bg-gold text-black"
                : "bg-black text-white hover:bg-gold"
            }`}
            onClick={handleAddToCart}
          >
            {isAdding ? "Added!" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
