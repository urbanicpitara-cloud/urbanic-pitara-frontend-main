import { apiClient } from "@/lib/api/client";
import {
  PaginatedResult,
  ProductDetail,
  ProductSummary,
} from "@/lib/api/types";

export const productsRepository = {
  async getByHandle(handle: string): Promise<ProductDetail> {
    return await apiClient.get<ProductDetail>(`/products/${encodeURIComponent(handle)}`);
  },

  async listByCollectionHandle(
    handle: string,
    options: { first?: number; after?: string | null } = {}
  ): Promise<PaginatedResult<ProductSummary>> {
    const params = new URLSearchParams();
    if (options.first) params.set("first", String(options.first));
    if (options.after) params.set("after", options.after);
    const qs = params.toString();
    return await apiClient.get<PaginatedResult<ProductSummary>>(
      `/collections/${encodeURIComponent(handle)}/products${qs ? `?${qs}` : ""}`
    );
  },
};


