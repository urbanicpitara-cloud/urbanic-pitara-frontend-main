// ... (imports)
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { collectionsAPI } from "@/lib/api";
import Image from "next/image";
import ProductCard from "@/components/view/ProductCard";
import FilterSidebar, { FilterState } from "@/components/view/FilterSidebar";
import { Product } from '@/types/products';
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

type Collection = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ---------------- Collection Page ----------------
export default function CollectionPage() {
  const params = useParams();
  const handle = Array.isArray(params.handle) ? params.handle[0] : params.handle;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [sort, setSort] = useState("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50000],
    sizes: [],
    colors: [],
    availability: [],
    tags: [],
  });

  // Dynamic Options
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(50000);

  // Pagination
  const [displayCount, setDisplayCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ---------------- Fetch collection ----------------
  useEffect(() => {
    if (!handle) return;
    const fetchCollection = async () => {
      setLoading(true);
      try {
        // Fetch a large limit to allow client-side filtering effectively
        const res = await collectionsAPI.getByHandle(handle, { limit: 100 });
        setCollection(res.data);
        const fetchedProducts = res.data.products || [];
        setAllProducts(fetchedProducts);

        // Calculate dynamic options
        const sizes = new Set<string>();
        const colors = new Set<string>();
        let maxP = 50000;

        fetchedProducts.forEach((p: Product) => {
          // Max Price
          const pMax = parseFloat(p.maxPriceAmount || "0");
          if (pMax > maxP) maxP = pMax;

          // Sizes & Colors
          p.options?.forEach((opt: any) => {
            const name = opt.name.toLowerCase();
            if (name === 'size' || name === 'sizes') {
              opt.values.forEach((v: any) => {
                const sizeValue = typeof v === 'string' ? v : (v && typeof v === 'object' && v.name ? String(v.name) : null);
                if (sizeValue && sizeValue.toUpperCase() !== 'DEFAULT TITLE' && sizeValue.trim()) {
                  sizes.add(sizeValue.toUpperCase());
                }
              });
            }
            if (name === 'color' || name === 'colors') {
              opt.values.forEach((v: any) => {
                if (typeof v === 'string') colors.add(v);
                else if (v && typeof v === 'object') {
                  if (v.name) colors.add(v.name);
                  else if (v.color) colors.add(v.color);
                }
              });
            }
          });

          p.variants?.forEach((v: any) => {
            // Check selectedOptions first (structured data)
            if (v.selectedOptions) {
              Object.entries(v.selectedOptions).forEach(([key, val]) => {
                const k = key.toLowerCase();
                if (k === 'size' || k === 'sizes') {
                  const sizeVal = String(val).toUpperCase();
                  if (sizeVal !== 'DEFAULT TITLE' && sizeVal.trim()) {
                    sizes.add(sizeVal);
                  }
                }
                if (k === 'color' || k === 'colors') colors.add(String(val));
              });
            }
            // Fallback to parsing title (legacy format)
            if (v.title) {
              v.title.split(' / ').forEach((part: string) => {
                const upperPart = part.toUpperCase();
                if (["XS", "S", "M", "L", "XL", "XXL"].includes(upperPart) && upperPart !== 'DEFAULT TITLE') {
                  sizes.add(upperPart);
                }
                if (["Red", "Blue", "Green", "Black", "White", "Pink"].includes(part)) colors.add(part);
              });
            }
          });
        });

        setMaxPrice(maxP);
        setAvailableSizes(Array.from(sizes).sort((a, b) => {
          const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
          return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
        }));
        setAvailableColors(Array.from(colors).sort());

        // Reset Price Filter if default
        if (filters.priceRange[1] === 50000) {
          setFilters(prev => ({ ...prev, priceRange: [0, maxP] }));
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load collection.");
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [handle]);

  // ---------------- Filtering Logic ----------------
  useEffect(() => {
    let result = [...allProducts];

    // Price
    result = result.filter(p => {
      const price = parseFloat(p.minPriceAmount || "0");
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Size
    if (filters.sizes.length > 0) {
      // Normalize filter sizes to uppercase for comparison
      const normalizedFilterSizes = filters.sizes.map(s => s.toUpperCase());

      result = result.filter(p =>
        p.variants.some(v =>
          v.selectedOptions
            ? Object.values(v.selectedOptions).some(s =>
              normalizedFilterSizes.includes(s.toUpperCase())
            )
            : v.title.split(' / ').some(s =>
              normalizedFilterSizes.includes(s.toUpperCase())
            )
        )
      );
    }

    // Color
    if (filters.colors.length > 0) {
      result = result.filter(p =>
        p.variants.some(v =>
          v.selectedOptions
            ? Object.values(v.selectedOptions).some(c => filters.colors.includes(c))
            : v.title.split(' / ').some(c => filters.colors.includes(c))
        )
      );
    }

    // Availability
    if (filters.availability.length > 0) {
      result = result.filter(p => {
        const hasStock = p.variants.some(v => v.inventoryQuantity > 0);
        if (filters.availability.includes("In Stock") && !hasStock) return false;
        if (filters.availability.includes("Out of Stock") && hasStock) return false;
        return true;
      });
    }

    // Sort Logic (Client-side since we fetched mostly all)
    switch (sort) {
      case 'price_asc': result.sort((a, b) => parseFloat(a.minPriceAmount || "0") - parseFloat(b.minPriceAmount || "0")); break;
      case 'price_desc': result.sort((a, b) => parseFloat(b.maxPriceAmount || "0") - parseFloat(a.maxPriceAmount || "0")); break;
      case 'title_asc': result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'title_desc': result.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
    }

    setFilteredProducts(result);
    setDisplayCount(12);
  }, [allProducts, filters, sort]);

  // Infinite Scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setDisplayCount(prev => Math.min(prev + 12, filteredProducts.length));
      }
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [filteredProducts.length]);

  const displayedProducts = filteredProducts.slice(0, displayCount);

  const handleClearFilters = () => {
    setFilters({
      priceRange: [0, maxPrice],
      sizes: [],
      colors: [],
      availability: [],
      tags: [],
    });
  };

  const SORT_OPTIONS = [
    { label: "Relevance", value: "relevance" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Name: A-Z", value: "title_asc" },
    { label: "Name: Z-A", value: "title_desc" },
    { label: "Newest", value: "newest" },
  ];

  // ---------------- Render ----------------
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  if (!collection && loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-gray-500" />
        <p className="text-lg">Loading collection...</p>
      </div>
    );

  if (!collection) return null;

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen mt-5">
      {/* Collection Header */}
      <div className="mb-12 text-center max-w-4xl mx-auto">
        {collection.imageUrl && (
          <div className="relative w-full h-64 md:h-80 mb-8 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={collection.imageUrl}
              alt={collection.imageAlt || collection.title}
              fill
              className="object-cover"
              quality={90}
              priority
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-md">{collection.title}</h1>
            </div>
          </div>
        )}
        {!collection.imageUrl && <h1 className="text-4xl font-serif font-bold mb-4 text-gray-900">{collection.title}</h1>}

        {collection.description && (
          <p className="mt-2 text-gray-600 text-lg leading-relaxed">{collection.description}</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
            availableSizes={availableSizes}
            availableColors={availableColors}
            maxPrice={maxPrice}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            {/* Mobile Filter */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto w-[300px]">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={setFilters}
                  onClearFilters={handleClearFilters}
                  availableSizes={availableSizes}
                  availableColors={availableColors}
                  maxPrice={maxPrice}
                />
              </SheetContent>
            </Sheet>

            <p className="text-sm text-gray-500 hidden sm:block">
              Showing {displayedProducts.length} of {filteredProducts.length} products
            </p>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(filters.sizes.length > 0 || filters.colors.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.sizes.map(s => (
                <span key={s} className="bg-gray-100 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  Size: {s} <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, sizes: prev.sizes.filter(x => x !== s) }))} />
                </span>
              ))}
              {filters.colors.map(c => (
                <span key={c} className="bg-gray-100 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  Color: {c} <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, colors: prev.colors.filter(x => x !== c) }))} />
                </span>
              ))}
            </div>
          )}

          {/* Grid */}
          {displayedProducts.length > 0 ? (
            <>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {displayedProducts.map((product, i) => (
                  <ProductCard key={`${String(product.id)}-${i}`} product={product} idx={i} />
                ))}
              </motion.div>
              {displayCount < filteredProducts.length && (
                <div ref={sentinelRef} className="h-20 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No products found in this collection matching your filters.</p>
              <Button variant="link" onClick={handleClearFilters} className="mt-2 text-indigo-600">Clear all filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
