// ... (imports remain similar but ensuring FilterSidebar is used)
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { productsAPI, collectionsAPI } from "@/lib/api";
import { Product } from "@/types/products";
import { Collection } from "@/types/collections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/view/ProductCard";
import FilterSidebar, { FilterState } from "@/components/view/FilterSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SearchContent() {
  const capitalizeFirst = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔍 Always get live query param from URL
  const queryParam = searchParams.get("q")?.trim() || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState("products");
  const [sort, setSort] = useState("relevance");
  const [loading, setLoading] = useState(false);

  // Full datasets
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Filter State
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

  // Pagination
  const [displayCount, setDisplayCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 🧠 Fetch search results
  useEffect(() => {
    if (!queryParam) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [productsRes, collectionsRes] = await Promise.all([
          productsAPI.getAll({
            search: queryParam,
            limit: 100, // Fetch ample results for client-side filtering
            sort: sort === 'relevance' ? undefined : (sort.includes('price') ? (sort.includes('asc') ? 'minPriceAmount' : 'maxPriceAmount') : 'createdAt'),
            order: sort.includes('asc') ? 'asc' : 'desc'
          }),
          collectionsAPI.getAll(),
        ]);

        const fetchedProducts = productsRes.data.products || [];
        setAllProducts(fetchedProducts);

        // Filter collections client-side
        const filteredCols = collectionsRes.data.filter(
          (col: any) =>
            col.title?.toLowerCase().includes(queryParam.toLowerCase()) ||
            col.description?.toLowerCase().includes(queryParam.toLowerCase())
        );
        setCollections(filteredCols);

        // Calculate dynamic options
        const sizes = new Set<string>();
        const colors = new Set<string>();
        let maxP = 50000;

        fetchedProducts.forEach((p: Product) => {
          // Max Price
          const pMax = parseFloat(p.maxPriceAmount || "0");
          if (pMax > maxP) maxP = pMax;

          // Sizes & Colors
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

          p.variants?.forEach(v => {
            if (v.title) {
              v.title.split(' / ').forEach(part => {
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
        setAvailableSizes(Array.from(sizes).sort());
        setAvailableColors(Array.from(colors).sort());

        // Reset Price Filter if default
        if (filters.priceRange[1] === 50000) {
          setFilters(prev => ({ ...prev, priceRange: [0, maxP] }));
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam, sort]);

  // Apply Filters
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

    setFilteredProducts(result);
    setDisplayCount(12);
  }, [allProducts, filters]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: [0, maxPrice],
      sizes: [],
      colors: [],
      availability: [],
      tags: [],
    });
  };

  // Sort Options Map
  const SORT_OPTIONS = [
    { label: "Relevance", value: "relevance" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Newest", value: "newest" },
  ];

  return (
    <div key={queryParam} className="container mx-auto px-4 py-8 pt-10 min-h-screen">
      <h1 className="text-2xl font-serif font-bold mb-6 text-center">
        {queryParam ? `Search Results for "${queryParam}"` : "Search"}
      </h1>

      <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or collections..."
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {queryParam ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="products">Products ({filteredProducts.length})</TabsTrigger>
              <TabsTrigger value="collections">Collections ({collections.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="products">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
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
                    Showing {displayedProducts.length} results
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

                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : displayedProducts.length > 0 ? (
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
                  <div className="text-center py-20 text-gray-500">No products found matching your filters.</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collections">
            {collections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.handle}`}
                    className="group w-80"
                  >
                    <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      {/* Image */}
                      <div className="relative aspect-[3/2] w-full bg-gray-100">
                        {collection.imageUrl ? (
                          <Image
                            src={collection.imageUrl}
                            alt={collection.imageAlt || collection.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        {/* Product count badge */}
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="text-xs">
                            {collection.productCount} Products
                          </Badge>
                        </div>
                      </div>

                      <CardHeader className="space-y-1 p-4">
                        <CardTitle className="text-base font-serif font-medium tracking-tight group-hover:text-indigo-600">
                          {capitalizeFirst(collection.title)}
                        </CardTitle>

                        <p className="text-xs text-gray-500">
                          {collection.productCount} items available
                        </p>
                      </CardHeader>

                      {collection.description && (
                        <CardContent className="p-4 pt-0">
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {collection.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">No collections found.</div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-20 text-gray-500">
          Enter a search term to find products and collections.
        </div>
      )}
    </div>
  );
}


function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
       <Skeleton className="aspect-[3/4] w-full rounded-lg bg-muted/70" />
      <Skeleton className="h-4 w-3/4 bg-muted/70" />
      <Skeleton className="h-4 w-1/2 bg-muted/70" />
    </div>
  );
}




export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 pt-10">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
