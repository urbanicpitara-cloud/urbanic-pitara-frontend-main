"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { searchAPI } from "@/lib/api";

interface AutocompleteResult {
  products: {
    id: string;
    title: string;
    handle: string;
    featuredImageUrl: string | null;
  }[];
  collections: {
    id: string;
    title: string;
    handle: string;
  }[];
  tags: string[];
}

interface SearchAutocompleteProps {
  onClose?: () => void;
}

export default function SearchAutocomplete({ onClose }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AutocompleteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAutocomplete = async () => {
      if (!query.trim() || query.length < 2) {
        setResults(null);
        return;
      }

      try {
        setLoading(true);
        const response = await searchAPI.getAutocomplete(query);
        // Handle the response data structure correctly
        setResults({
          products: response.data.products || [],
          collections: response.data.collections || [],
          tags: response.data.tags || []
        });
      } catch (error) {
        console.error("Error fetching autocomplete results:", error);
        // Set empty results on error
        setResults({
          products: [],
          collections: [],
          tags: []
        });
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchAutocomplete, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
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
      if (onClose) onClose();
    }
  };

  const handleResultClick = () => {
    setQuery("");
    setResults(null);
    if (onClose) onClose();
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search products, collections..."
          className="w-full p-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Search"
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
            ></path>
          </svg>
        </div>
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        )}
      </form>

      {focused && query.length >= 2 && results && (
        <div
          ref={resultsRef}
          className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Products */}
          {results.products.length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Products
              </h3>
              <ul>
                {results.products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.handle}`}
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
            </div>
          )}

          {/* Collections */}
          {results.collections.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Collections
              </h3>
              <ul>
                {results.collections.map((collection) => (
                  <li key={collection.id}>
                    <Link
                      href={`/collections/${collection.handle}`}
                      className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                      onClick={handleResultClick}
                    >
                      <span className="text-sm text-gray-700">{collection.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {results.tags.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2 px-2 pb-2">
                {results.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                    onClick={handleResultClick}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {results.products.length === 0 && results.collections.length === 0 && results.tags.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {/* View all results link */}
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
    </div>
  );
}