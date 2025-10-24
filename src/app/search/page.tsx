"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { searchAPI } from "@/lib/api";
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
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
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

  useEffect(() => {
    if (!query) return;
    
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch products
        const productsResponse = await searchAPI.searchProducts({
          query,
          page,
          limit: 12,
          sort
        });
        
        setProductResults(productsResponse.data);
        
        // Fetch collections
        const collectionsResponse = await searchAPI.searchCollections({
          query,
          page: 1,
          limit: 10
        });
        
        setCollectionResults(collectionsResponse.data);
      } catch (err) {
        console.error("Search error:", err);
        setError("An error occurred while searching. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query, page, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    window.history.pushState({}, "", `/search?${params.toString()}`);
    
    // Reset pagination when searching
    setPage(1);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, collections..."
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {query ? (
        <>
          <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {productResults.products.map((product: any) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.handle}`}
                            className="group"
                          >
                            <div className="aspect-square relative mb-3 bg-gray-100 rounded-lg overflow-hidden">
                              {product.featuredImageUrl ? (
                                <Image
                                  src={product.featuredImageUrl}
                                  alt={product.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-900">{product.title}</h3>
                            <p className="mt-1 text-gray-700">
                              ${product.priceRange?.minPrice?.toFixed(2)}
                              {product.priceRange?.maxPrice !== product.priceRange?.minPrice && 
                                ` - $${product.priceRange?.maxPrice?.toFixed(2)}`}
                            </p>
                          </Link>
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {productResults.totalPages > 1 && (
                        <div className="flex justify-center mt-12 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                          >
                            Previous
                          </Button>
                          
                          <div className="flex items-center gap-2 px-4">
                            <span>
                              Page {page} of {productResults.totalPages}
                            </span>
                          </div>
                          
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
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        No products found for "{query}".
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="collections">
                  {collectionResults.collections?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {collectionResults.collections.map((collection: any) => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.handle}`}
                          className="group block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <h3 className="font-medium text-lg text-gray-900 mb-2">
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
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        No collections found for "{query}".
                      </p>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Enter a search term to find products and collections.
          </p>
        </div>
      )}
    </div>
  );
}