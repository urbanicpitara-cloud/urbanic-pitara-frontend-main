"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { productsAPI } from "@/lib/api";

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImageUrl?: string;
}
interface closeSearchBox {
   onOpenChange: (open: boolean) => void;
}
export default function SearchProducts({onOpenChange}:closeSearchBox ) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch products from API
useEffect(() => {
  const fetchProducts = async () => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await productsAPI.getAll({ search: query, limit: 5 });
      setResults(res.data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debounce = setTimeout(fetchProducts, 300);
  return () => clearTimeout(debounce);
}, [query]);


  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleResultClick = () => {
  
    setQuery("");
    setResults([]);
    setFocused(false);
    onOpenChange(false);
  };

  return (
    <div className="relative p-2 w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search products..."
          className="w-full p-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        )}
      </form>

      {focused && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-96 overflow-y-auto"
        >
          <ul>
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.handle}`}
                  className="flex items-center px-2 py-2 hover:bg-gray-100 rounded-md"
                  onClick={handleResultClick}
                >
                  <div className="flex-shrink-0 w-10 h-10 relative">
                    {product.featuredImageUrl ? (
                      <Image
                        src={product.featuredImageUrl}
                        alt={product.title}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-400">No img</span>
                      </div>
                    )}
                  </div>
                  <span className="ml-3 text-sm text-gray-700">{product.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="p-2 border-t border-gray-100">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="block w-full text-center py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              onClick={handleResultClick}
            >
              View all results
            </Link>
          </div>
        </div>
      )}

      {focused && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg p-4 text-sm text-gray-500 text-center">
          No products found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
