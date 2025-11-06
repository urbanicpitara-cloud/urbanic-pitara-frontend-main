/* eslint-disable @typescript-eslint/no-explicit-any */
export type Cart = {
  id: string;
  totalQuantity: number;
  lines: Array<{
    id: string;
    productId: string;
    variantId?: string | null;
    quantity: number;
    priceAmount: string;
    priceCurrency: string;
  }>;
};

import { apiClient } from "@/lib/api/client";

export const cartRepository = {
  async create(): Promise<Cart> {
    return await apiClient.post<Cart>("/cart", {});
  },
  async get(cartId: string): Promise<Cart> {
    return await apiClient.get<Cart>(`/cart/${encodeURIComponent(cartId)}`);
  },
  async addLine(cartId: string, data: { productId: string; variantId?: string; quantity: number }): Promise<any> {
    return await apiClient.post<any>(`/cart/${encodeURIComponent(cartId)}/lines`, data);
  },
  async updateLine(cartId: string, lineId: string, quantity: number): Promise<any> {
    return await apiClient.patch<any>(`/cart/${encodeURIComponent(cartId)}/lines`, { lineId, quantity });
  },
  async removeLine(cartId: string, lineId: string): Promise<any> {
    return await apiClient.delete<any>(`/cart/${encodeURIComponent(cartId)}/lines/${encodeURIComponent(lineId)}`);
  },
};
