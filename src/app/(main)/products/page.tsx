"use client";

import { useEffect, useState, useRef } from "react";
import { productsAPI } from "@/lib/api";
import ProductCard from "@/components/view/ProductCard";
import FilterSidebar, { FilterState } from "@/components/view/FilterSidebar";
import { Product } from "@/types/products";
import { motion } from "framer-motion";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type SortOption = { label: string; value: string; order: "asc" | "desc" };

const SORT_OPTIONS: SortOption[] = [
  { label: "Newest", value: "createdAt", order: "desc" },
  { label: "Oldest", value: "createdAt", order: "asc" },
  { label: "Price: Low → High", value: "minPriceAmount", order: "asc" },
  { label: "Price: High → Low", value: "maxPriceAmount", order: "desc" },
  { label: "Title A → Z", value: "title", order: "asc" },
  { label: "Title Z → A", value: "title", order: "desc" },
];

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination / Infinite Scroll
  const [displayCount, setDisplayCount] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  // Filter & Sort State
  const [sort, setSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Initial Fetch - Get a large batch to enable client-side filtering if possible
  // In a real large-scale app, we'd use server-side filtering params for everything.
  // Here, we'll fetch a reasonable amount (e.g. 100) or paginate on scroll, 
  // but to support "filtering by color", we likely need the server to support it OR fetch all.
  // Given the API limitations seen earlier, fetching a larger batch (e.g. 100) for "All Products" 
  // and filtering client-side is a compromise to give the "Amazon" feel immediately.
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await productsAPI.getAll({
          limit: 100, // Fetch up to 100 for better client-side filter experience
          sort: sort.value,
          order: sort.order,
        });

        const fetched: Product[] = res.data.products || [];
        setAllProducts(fetched);

        // Calculate max price from products
        const maxP = Math.max(...fetched.map(p => parseFloat(p.maxPriceAmount || "0")), 50000);
        setMaxPrice(maxP);

        // Initialize price range filter if it's default
        if (filters.priceRange[1] === 50000) {
          setFilters(prev => ({ ...prev, priceRange: [0, maxP] }));
        }

        // Extract Options
        const sizes = new Set<string>();
        const colors = new Set<string>();

        fetched.forEach(p => {
          // Check options
          p.options?.forEach(opt => {
            const name = opt.name.toLowerCase();
            if (name === 'size' || name === 'sizes') {
              opt.values.forEach((v: any) => {
                const sizeValue = typeof v === 'string' ? v : (v && typeof v === 'object' && v.name ? String(v.name) : null);
                if (sizeValue && sizeValue.toUpperCase() !== 'DEFAULT TITLE' && sizeValue.trim()) {
                  sizes.add(sizeValue.toUpperCase());
                }
              });
            }
            if (name === 'color' || name === 'colors' || name === 'colour') {
              opt.values.forEach((v: any) => {
                if (typeof v === 'string') colors.add(v);
                else if (v && typeof v === 'object') {
                  if (v.name) colors.add(v.name);
                  else if (v.color) colors.add(v.color);
                }
              });
            }
          });

          // Check variants if options missing
          p.variants?.forEach(v => {
            v.selectedOptions && Object.entries(v.selectedOptions).forEach(([key, val]) => {
              const k = key.toLowerCase();
              if (k === 'size' || k === 'sizes') {
                if (val.toUpperCase() !== 'DEFAULT TITLE' && val.trim()) {
                  sizes.add(val.toUpperCase());
                }
              }
              if (k === 'color' || k === 'colors') colors.add(val);
            });
            if (v.title) {
              // Fallback parsing "Red / L"
              v.title.split(' / ').forEach(part => {
                const upperPart = part.toUpperCase();
                if (["XS", "S", "M", "L", "XL", "XXL"].includes(upperPart) && upperPart !== 'DEFAULT TITLE') {
                  sizes.add(upperPart);
                }
                // Simple color check
                if (["Red", "Blue", "Green", "Black", "White", "Pink", "Yellow", "Gold", "Silver", "Beige", "Brown", "Purple", "Orange"].includes(part)) colors.add(part);
              });
            }
          });
        });

        setAvailableSizes(Array.from(sizes).sort((a, b) => {
          const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
          return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
        }));
        setAvailableColors(Array.from(colors).sort());

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sort]); // Re-fetch on sort change (server sorting)

  // Filter Logic
  useEffect(() => {
    let result = [...allProducts];

    // Price
    result = result.filter(p => {
      const pMin = parseFloat(p.minPriceAmount || "0");
      return pMin >= filters.priceRange[0] && pMin <= filters.priceRange[1];
    });

    // Size
    if (filters.sizes.length > 0) {
      result = result.filter(p => {
        // Check if any variant matches ANY selected size
        return p.variants.some(v => {
          if (v.selectedOptions) {
            return Object.values(v.selectedOptions).some(s => filters.sizes.includes(s));
          }
          return v.title.split(' / ').some(part => filters.sizes.includes(part));
        });
      });
    }

    // Color
    if (filters.colors.length > 0) {
      result = result.filter(p => {
        return p.variants.some(v => {
          if (v.selectedOptions) {
            return Object.values(v.selectedOptions).some(c => filters.colors.includes(c));
          }
          return v.title.split(' / ').some(part => filters.colors.includes(part));
        });
      });
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

    setFilteredProducts(result);
  }, [allProducts, filters]);

  // Infinite Scroll Handler (Frontend pagination of filtered results)
  const sentinelRef = useRef<HTMLDivElement>(null);
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

  const activeCount = filters.sizes.length + filters.colors.length + filters.availability.length + (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div className="bg-gray-50 min-h-screen mt-5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 mt-2">Explore our complete collection.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Sidebar */}
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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

              {/* Mobile Filter Trigger */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeCount > 0 && <span className="ml-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeCount}</span>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      filters={filters}
                      onFilterChange={setFilters}
                      onClearFilters={handleClearFilters}
                      availableSizes={availableSizes}
                      availableColors={availableColors}
                      maxPrice={maxPrice}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-gray-600 hidden sm:block">
                Showing <span className="font-semibold text-gray-900">{displayedProducts.length}</span> of {filteredProducts.length} products
              </p>

              <div className="flex items-center gap-4 ml-auto">
                <Select value={sort.label} onValueChange={(val) => {
                  const opt = SORT_OPTIONS.find(s => s.label === val);
                  if (opt) setSort(opt);
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(opt => (
                      <SelectItem key={opt.label} value={opt.label}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.sizes.map(s => (
                  <span key={s} className="inline-flex items-center text-sm bg-white border border-gray-200 rounded-full px-3 py-1">
                    Size: {s} <button onClick={() => setFilters(prev => ({ ...prev, sizes: prev.sizes.filter(x => x !== s) }))} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {filters.colors.map(c => (
                  <span key={c} className="inline-flex items-center text-sm bg-white border border-gray-200 rounded-full px-3 py-1">
                    <span className="w-2 h-2 rounded-full mr-2 bg-gray-200" style={{ backgroundColor: c.startsWith('#') ? c : undefined }} />
                    {c} <button onClick={() => setFilters(prev => ({ ...prev, colors: prev.colors.filter(x => x !== c) }))} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <Button variant="link" size="sm" onClick={handleClearFilters} className="text-red-500 h-auto p-0">Clear All</Button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map((product, i) => (
                    <ProductCard key={`${String(product.id)}-${i}`} product={product} idx={i} />
                  ))}
                </div>
                {displayCount < filteredProducts.length && (
                  <div ref={sentinelRef} className="h-20 flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="text-gray-500 mt-2 mb-6">Try adjusting your filters or search criteria.</p>
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
