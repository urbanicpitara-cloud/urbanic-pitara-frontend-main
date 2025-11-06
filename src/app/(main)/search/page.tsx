"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔍 Always get live query param from URL
  const queryParam = searchParams.get("q")?.trim() || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState("products");
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productResults, setProductResults] = useState<any>({
    products: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [collectionResults, setCollectionResults] = useState<any>({
    collections: [],
    total: 0,
  });

  // 🧹 Reset local states when query changes
  useEffect(() => {
    setSearchQuery(queryParam);
    setPage(1);
    setProductResults({ products: [], total: 0, page: 1, totalPages: 1 });
  }, [queryParam]);

  // Sorting logic
  const getSortParams = (sortValue: string) => {
    switch (sortValue) {
      case "price_asc":
        return { sort: "minPriceAmount", order: "asc" };
      case "price_desc":
        return { sort: "maxPriceAmount", order: "desc" };
      case "title_asc":
        return { sort: "title", order: "asc" };
      case "title_desc":
        return { sort: "title", order: "desc" };
      case "newest":
        return { sort: "createdAt", order: "desc" };
      default:
        return {};
    }
  };

  // 🧠 Fetch search results on every change
  useEffect(() => {
    if (!queryParam) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const { sort: sortField, order } = getSortParams(sort);

        const [productsRes, collectionsRes] = await Promise.all([
          productsAPI.getAll({
            search: queryParam,
            page,
            limit: 20,
            sort: sortField,
            order,
          }),
          collectionsAPI.getAll(),
        ]);

        const filteredCollections = collectionsRes.data.filter(
          (col: any) =>
            col.title?.toLowerCase().includes(queryParam.toLowerCase()) ||
            col.description?.toLowerCase().includes(queryParam.toLowerCase())
        );

        setProductResults({
          products: productsRes.data.products || [],
          total: productsRes.data.pagination?.total || 0,
          page: productsRes.data.pagination?.page || 1,
          totalPages: productsRes.data.pagination?.pages || 1,
        });

        setCollectionResults({
          collections: filteredCollections,
          total: filteredCollections.length,
        });
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [queryParam, page, sort]); // ✅ dependencies correctly include queryParam

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div key={queryParam} className="container mx-auto px-4 py-8 pt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Search Results</h1>

      <form onSubmit={handleSearch} className="mb-8">
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

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>
      )}

      {queryParam ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="products">
                Products ({productResults.total || 0})
              </TabsTrigger>
              <TabsTrigger value="collections">
                Collections ({collectionResults.total || 0})
              </TabsTrigger>
            </TabsList>

            {activeTab === "products" && (
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="title_asc">Name: A to Z</SelectItem>
                  <SelectItem value="title_desc">Name: Z to A</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <TabsContent value="products">
                {productResults.products?.length > 0 ? (
                  <>
                    <motion.div
                      className="flex flex-wrap gap-2 justify-center sm:justify-start"
                      layout
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {productResults.products.map((product: Product) => (
                        <motion.div
                          key={product.id}
                          className="w-[48%] sm:w-[45%] md:w-[30%] lg:w-[22%]"
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                          }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </motion.div>

                    {productResults.totalPages > 1 && (
                      <div className="flex justify-center mt-12 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <span className="px-3">
                          Page {page} of {productResults.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page >= productResults.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No products found for &quot;{queryParam}&quot;
                  </div>
                )}
              </TabsContent>

              <TabsContent value="collections">
                {collectionResults.collections?.length > 0 ? (
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    {collectionResults.collections.map((collection: Collection) => (
                      <Link
                        key={collection.id}
                        href={`/collections/${collection.handle}`}
                        className="group block w-full sm:w-[48%] md:w-[31%] bg-gray-50 rounded-lg p-6 shadow hover:shadow-lg transition"
                      >
                        <h3 className="font-medium text-lg mb-2 group-hover:text-indigo-600">
                          {collection.title}
                        </h3>
                        {collection.description && (
                          <p className="text-gray-600 line-clamp-2">
                            {collection.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No collections found for &quot;{queryParam}&quot;
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Enter a search term to find products and collections.
        </div>
      )}
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
