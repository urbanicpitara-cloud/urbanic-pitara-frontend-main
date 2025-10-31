"use client";

import { useEffect, useState, useCallback } from "react";
import { productsAPI } from "@/lib/api";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  [key: string]: any;
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string;
  search: string;
  setSearch: (value: string) => void;
  filters: Record<string, any>;
  setFilters: (value: Record<string, any>) => void;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing products in admin dashboard
 */
export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchProducts = useCallback(async (overridePage?: number) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        search: search || undefined,
        page: overridePage || pagination.page,
        all:true,
        limit: pagination.limit,
        ...filters,
      };

      const res = await productsAPI.getAll(params);
      const data = res.data;

      const items = data.items || data.products || [];
      const total = data.total || items.length;

      setProducts(items);
      setPagination((prev) => ({ ...prev, total }));
    } catch (err: any) {
      console.error("❌ Failed to fetch products:", err);
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [search, filters, pagination.limit, pagination.page]);

  // 🔹 Debounce search & filter changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 })); // reset page
      fetchProducts(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, filters]);

  // 🔹 Immediate fetch when page changes (no debounce)
  useEffect(() => {
    fetchProducts(pagination.page);
  }, [pagination.page]);

  const refresh = useCallback(async () => {
    setSearch("")
    await fetchProducts(pagination.page);
  }, [fetchProducts, pagination.page]);

  return {
    products,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    pagination,
    setPagination,
    refresh,
  };
}
