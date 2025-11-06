/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDebounce } from "./useDebounce";
import React, { useState } from "react";
import { searchRepository } from "@/lib/api/repositories/search";

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      if (!debouncedSearch) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const items = await searchRepository.searchProducts(debouncedSearch);
        if (active) setResults(items);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
  };
}