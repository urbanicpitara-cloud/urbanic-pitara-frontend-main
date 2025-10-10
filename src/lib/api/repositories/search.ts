import { apiClient } from "@/lib/api/client";
import { ProductSummary } from "@/lib/api/types";

export const searchRepository = {
  async searchProducts(query: string): Promise<ProductSummary[]> {
    const params = new URLSearchParams({ query });
    const res = await apiClient.get<{ items: ProductSummary[] }>(`/search?${params.toString()}`);
    return res.items;
  },
};


