"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { searchTerm, setSearchTerm, results, isLoading } = useSearch();

  // Keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[600px] w-[90%] h-[75vh] p-0 overflow-hidden rounded-2xl border border-gray-200 shadow-xl",
          "bg-white sm:h-[70vh]"
        )}
      >
        <DialogHeader className="px-4 pt-8 pb-2 border-b">
          <VisuallyHidden>
            <DialogTitle>Search Products</DialogTitle>
          </VisuallyHidden>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-full border-gray-300 focus:ring-1 focus:ring-black focus:border-black"
              autoFocus
            />
          </div>
        </DialogHeader>

        {/* Scrollable Results Section */}
        <div className="relative flex-1 overflow-y-auto px-4 py-3">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          )}

          {/* Product Results */}
          {results.length > 0 ? (
            <div className="grid gap-3">
              {results.map(({ node: product }) => (
                <Link
                  key={product.id}
                  href={`/product/${product.handle}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                >
                  {product.featuredImage && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {product.title}
                    </h4>
                    <p className="mt-1 text-gray-600 text-sm">
                      {formatPrice(
                        product.priceRange.minVariantPrice.amount,
                        product.priceRange.minVariantPrice.currencyCode
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchTerm && !isLoading ? (
            <div className="flex h-full items-center justify-center text-gray-500 text-sm">
              No products found.
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
              Start typing to search...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(parseFloat(amount));
}
