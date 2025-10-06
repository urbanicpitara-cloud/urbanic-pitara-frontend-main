import { useStorefrontQuery } from "./useStorefront";
import { useDebounce } from "./useDebounce";
import { SEARCH_PRODUCTS_QUERY } from "@/graphql/search";
import type { SearchProductsResponse } from "@/graphql/search";
import { useState } from "react";

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading } = useStorefrontQuery<SearchProductsResponse>(
    ["search", debouncedSearch],
    {
      query: SEARCH_PRODUCTS_QUERY,
      variables: { 
        query: debouncedSearch,
        first: 12
      }
    },
    // {
    //   enabled: debouncedSearch.length > 0,
    // }
  );

  return {
    searchTerm,
    setSearchTerm,
    results: data?.products?.edges || [],
    isLoading,
  };
}