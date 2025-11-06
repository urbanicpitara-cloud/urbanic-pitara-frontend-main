"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collectionsAPI } from "@/lib/api";
import Image from "next/image";
// import Link from "next/link";
import ProductCard from "@/components/view/ProductCard";

import { Product } from '@/types/products';

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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PAGE_LIMIT = 8;

  // ---------------- Fetch collection page ----------------
  const fetchCollection = async (pageNum: number) => {
    if (!handle) return;
    setLoading(true);
    try {
      const res = await collectionsAPI.getByHandle(handle, { page: pageNum, limit: PAGE_LIMIT });
      setCollection(res.data);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
      setError("Failed to load collection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection(1);
  }, [handle]);

  // ---------------- Pagination Handlers ----------------
  const handlePrev = () => {
    if (page > 1) fetchCollection(page - 1);
  };

  const handleNext = () => {
    if (collection && page < collection.pagination.totalPages) fetchCollection(page + 1);
  };

  // ---------------- Render ----------------
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  if (!collection)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <svg
          className="w-12 h-12 animate-spin mb-4 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <p className="text-lg">Loading collection...</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Collection Header */}
      <div className="mb-8 text-center">
        {collection.imageUrl && (
          <Image
            src={collection.imageUrl}
            alt={collection.imageAlt || collection.title}
            width={800}
            height={300}
            quality={50}
            className="mx-auto rounded-lg object-cover"
          />
        )}
        <h1 className="text-3xl font-bold mt-4">{collection.title}</h1>
        {collection.description && (
          <p className="mt-2 text-gray-600">{collection.description}</p>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {collection.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 gap-4">
        <button
          onClick={handlePrev}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">{`Page ${page} of ${collection.pagination.totalPages}`}</span>
        <button
          onClick={handleNext}
          disabled={page === collection.pagination.totalPages || loading}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
