"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GET_PRODUCT_BY_HANDLE_QUERY } from "@/graphql/products";
import { useStorefrontQuery } from "@/hooks/useStorefront";
import {
  GetProductByHandleQuery,
  ImageEdge,
  ProductOption,
  ProductPriceRange,
  ProductVariant,
} from "@/types/shopify-graphql";
import ProductCarousel from "@/components/view/ProductCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import ProductPrice from "@/components/view/ProductCard/ProductPrice";
import { Button } from "@/components/ui/button";
import ProductOptions from "@/components/view/ProductOptions";
import { useCart } from "@/lib/atoms/cart"; // Updated import
import { toast } from "sonner"; // Add this import

export default function Product() {
  const params = useParams();
  const router = useRouter();
  const { addItem, removeItem } = useCart(); // Add removeItem to destructuring

  // States
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>();
  const [quantity, setQuantity] = useState<number>(1);

  // small transient UI state after adding to cart
  const [justAdded, setJustAdded] = useState<{
    id: string;
    title?: string;
    qty: number;
  } | null>(null);

  const handleSelectOptions = (options: Record<string, string>) => {
    const variant = data?.product?.variants?.edges.find((variant) => {
      return Object.keys(options).every((key) => {
        return variant.node.selectedOptions.some(
          (option) => option.name === key && option.value === options[key]
        );
      });
    });
    setSelectedVariant(variant?.node as ProductVariant);
    setSelectedOptions(options);
  };

  const { data, isLoading } = useStorefrontQuery<GetProductByHandleQuery>(
    ["product", params.handle],
    {
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle: params.handle },
    }
  );

  // set sensible default variant when product loads
  useEffect(() => {
    if (!data?.product) return;
    const first = data.product.variants?.edges?.[0]?.node;
    if (first) {
      setSelectedVariant((prev) => prev ?? (first as ProductVariant));
      const initialOptions: Record<string, string> = {};
      first.selectedOptions.forEach((o) => (initialOptions[o.name] = o.value));
      setSelectedOptions((prev) => (Object.keys(prev).length ? prev : initialOptions));
    }
  }, [data]);

  if (isLoading)
    return (
      <div className="flex flex-col md:flex-row gap-4 my-10 px-4 pt-10">
        <div className="w-full md:w-2/3">
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );

  const handleAddtoCart = async () => {
    if (!selectedVariant) return;
    
    try {
      await addItem?.(selectedVariant.id, quantity);
      toast.success(`Added ${quantity} × ${data?.product?.title} to cart`, {
        description: "Item has been added to your cart",
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });
    } catch {
      toast.error("Failed to add item to cart");
    }

    setJustAdded({
      id: selectedVariant.id,
      title: data?.product?.title,
      qty: quantity,
    });

    window.setTimeout(() => setJustAdded(null), 4000);
  };

  const handleUndo = () => {
    if (!justAdded) return;
    try {
      removeItem(justAdded.id);
    } catch {
      /* ignore */
    }
    setJustAdded(null);
  };

  const description = data?.product?.description ?? "";

  return (
    <div className="flex flex-col md:flex-row gap-6 my-10 px-4 max-w-7xl mx-auto">
      <div className="w-full md:w-2/3">
        <ProductCarousel images={data?.product?.images?.edges as ImageEdge[]} />
      </div>

      <aside className="w-full md:w-1/3 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data?.product?.title}</h1>
          <p className="mt-2 text-sm text-gray-500 line-clamp-4">{description}</p>
        </div>

        <ProductOptions
          selectedOptions={selectedOptions}
          setSelectedOptions={handleSelectOptions}
          options={data?.product?.options as ProductOption[]}
        />

        <div className="flex items-center justify-between">
          <ProductPrice
            priceRange={data?.product?.priceRange as ProductPriceRange}
          />
        </div>

        {/* Quantity + Add to cart row (improved UI & responsive) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Qty</label>
            <div className="inline-flex items-center rounded-md border bg-white">
              <button
                aria-label="Decrease quantity"
                className="px-3 py-1 text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <input
                className="w-12 text-center bg-transparent outline-none"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value || 1)))
                }
                inputMode="numeric"
              />
              <button
                aria-label="Increase quantity"
                className="px-3 py-1 text-lg"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <Button
            disabled={!selectedVariant}
            onClick={handleAddtoCart}
            className="mt-3 sm:mt-0 sm:flex-1 flex items-center justify-center gap-2"
          >
            Add to cart
            {selectedVariant && (
              <span className="inline-flex items-center justify-center ml-2 rounded-full bg-white/10 px-2 py-0.5 text-sm">
                {quantity}
              </span>
            )}
          </Button>
        </div>

        {/* Inline feedback panel */}
        {justAdded && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-green-50 p-3">
            <div className="text-sm">
              Added <strong>{justAdded.qty}</strong> × <span>{justAdded.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/cart")}
                className="text-sm"
              >
                View cart
              </Button>
              <Button variant="link" onClick={handleUndo} className="text-sm">
                Undo
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
