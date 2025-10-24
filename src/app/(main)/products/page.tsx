"use client";

import { useEffect, useState, useRef } from "react";
import { productsAPI } from "@/lib/api";
import ProductCard from "@/components/view/ProductCard";
import { Product } from "@/types/products";
import { motion } from "framer-motion";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [sort, setSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await productsAPI.getAll({
          page,
          limit: 12,
          sort: sort.value,
          order: sort.order,
          collection: selectedCollection || undefined,
          minPrice: minPrice !== "" ? minPrice : undefined,
          maxPrice: maxPrice !== "" ? maxPrice : undefined,
          search: search.trim() || undefined,
        });

        const fetched: Product[] = res.data.products || [];

        setProducts((prev) => {
          if (page === 1) return fetched;
          const existingIds = new Set(prev.map((p) => p.id));
          return [...prev, ...fetched.filter((p) => !existingIds.has(p.id))];
        });
        setHasMore(fetched.length === 12);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, sort, search, selectedCollection, minPrice, maxPrice]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [sort, search, selectedCollection, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCollection("");
    setMinPrice("");
    setMaxPrice("");
    setSort(SORT_OPTIONS[0]);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">All Products</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow-md mb-8 flex flex-wrap gap-4 sticky top-20 z-10">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded flex-1 min-w-[150px] focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) =>
            setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="border p-2 rounded w-24 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="border p-2 rounded w-24 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <select
          value={sort.label}
          onChange={(e) => {
            const selected = SORT_OPTIONS.find((s) => s.label === e.target.value);
            if (selected) setSort(selected);
          }}
          className="border p-2 rounded focus:ring-2 focus:ring-indigo-400 outline-none"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value + s.order} value={s.label}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleResetFilters}
          className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 transition"
        >
          Reset
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="rounded overflow-hidden bg-white"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
            layout
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {/* Sentinel */}
      <div ref={sentinelRef} className="mt-6" />

      {/* Loader */}
      {loading && (
        <div className="flex justify-center mt-6">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
