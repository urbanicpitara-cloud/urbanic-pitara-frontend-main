"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/view/ProductCard";
import { GET_COLLECTION_BY_HANDLE_WITH_PAGINATION_QUERY } from "@/graphql/collections";
import { useStorefrontClient } from "@/hooks/useStorefront"; // ✅ use client to manually query
import { GetCollectionByHandleQuery, Product } from "@/types/shopify-graphql";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";

const CollectionPage = () => {
  const params = useParams();
  const handle = params.handle as string;

  const storefront = useStorefrontClient(); // ✅ we’ll use client.query() instead of refetch
  const [products, setProducts] = useState<Product[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageInfo, setPageInfo] = useState<{ hasNextPage: boolean; endCursor: string | null }>({
    hasNextPage: false,
    endCursor: null,
  });

  // Initial fetch
const fetchProducts = useCallback(
  async (cursor: string | null = null) => {
    try {
      const data = await storefront.request<GetCollectionByHandleQuery>(
        GET_COLLECTION_BY_HANDLE_WITH_PAGINATION_QUERY,
        { handle, first: 12, after: cursor }
      );

      const newProducts =
        data?.collection?.products?.edges
          ?.map((e) => e?.node)
          .filter(Boolean) as Product[];

      setProducts((prev) => (cursor ? [...prev, ...newProducts] : newProducts));
      setPageInfo({
        hasNextPage: data?.collection?.products?.pageInfo?.hasNextPage || false,
        endCursor: data?.collection?.products?.pageInfo?.endCursor || null,
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  },
  [storefront, handle]
);


  // Reset when collection changes
  useEffect(() => {
    setProducts([]);
    setCurrentCursor(null);
    setLoading(true);
    fetchProducts(null);
  }, [handle, fetchProducts]);

  // Infinite scroll observer
  const loaderRef = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && pageInfo.hasNextPage && !loadingMore) {
        setLoadingMore(true);
        fetchProducts(pageInfo.endCursor);
      }
    },
    [pageInfo, loadingMore, fetchProducts]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px", // ✅ triggers early
      threshold: 0,
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="my-16">
      {/* Collection Header */}
      <div className="flex flex-col items-center gap-2 mb-12">
        <h1 className="text-4xl font-serif font-bold text-black text-center">
          {products.length > 0 ? products[0]?.productType || handle : "Loading..."}
        </h1>
        <div className="mt-3 w-24 h-[2px] bg-gold rounded-full"></div>
      </div>

      {/* Products */}
      <motion.div
        className="flex flex-wrap justify-center gap-8 w-[80%] mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="w-[350px]"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {/* Infinite Scroll Loader */}
      {pageInfo.hasNextPage && (
        <motion.div
          ref={loaderRef}
          className="flex justify-center my-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Skeleton className="h-[400px] w-[350px] animate-pulse" />
        </motion.div>
      )}

      {/* Initial loading */}
      {loading && products.length === 0 && (
        <div className="flex flex-wrap justify-center gap-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-[350px] animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
