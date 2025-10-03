"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/view/ProductCard";
import { GET_COLLECTION_BY_HANDLE_WITH_PAGINATION_QUERY } from "@/graphql/collections";
import { useStorefrontQuery } from "@/hooks/useStorefront";
import { GetCollectionByHandleQuery, Product } from "@/types/shopify-graphql";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";

const CollectionPage = () => {
  const params = useParams();
  const handle = params.handle as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, isLoading, refetch } = useStorefrontQuery<GetCollectionByHandleQuery>(
    ["collection", handle, currentCursor],
    {
      query: GET_COLLECTION_BY_HANDLE_WITH_PAGINATION_QUERY,
      variables: { handle, first: 12, after: currentCursor },
    }
  );

  // Reset when collection changes
  useEffect(() => {
    setCurrentCursor(null);
    setProducts([]);
  }, [handle]);

  // Append new products
  useEffect(() => {
    if (data?.collection?.products?.edges) {
      const newProducts = data.collection.products.edges
        .map((edge) => edge?.node)
        .filter(Boolean) as Product[];
      setProducts((prev) => [...prev, ...newProducts]);
    }
  }, [data]);

  // IntersectionObserver for infinite scroll
  const loaderRef = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        data?.collection?.products?.pageInfo.hasNextPage &&
        !loadingMore
      ) {
        setCurrentCursor(data.collection.products.pageInfo.endCursor ?? null);
      }
    },
    [data, loadingMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Fetch next batch
  useEffect(() => {
    if (currentCursor) {
      setLoadingMore(true);
      refetch().finally(() => setLoadingMore(false));
    }
  }, [currentCursor, refetch]);

  return (
    <div className="my-16">
      {/* Collection Header */}
      <div className="flex flex-col items-center gap-2 mb-12">
        <h1 className="text-4xl font-serif font-bold text-black text-center">
          {data?.collection?.title}
        </h1>
        {data?.collection?.description && (
          <p className="text-lg text-beige-600 text-center max-w-2xl">
            {data.collection.description}
          </p>
        )}
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
      {data?.collection?.products?.pageInfo.hasNextPage && (
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
      {isLoading && products.length === 0 && (
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
