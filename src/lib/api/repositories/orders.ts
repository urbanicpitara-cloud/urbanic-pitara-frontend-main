import { apiClient } from "@/lib/api/client";

export type OrderItem = {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  priceAmount: string;
  priceCurrency: string;
};

export type Order = {
  id: string;
  status: string;
  totalAmount: string;
  totalCurrency: string;
  placedAt: string;
  items: OrderItem[];
};

export const ordersRepository = {
  async list(token: string): Promise<{ items: Order[] }> {
    return await apiClient.get<{ items: Order[] }>("/orders", { headers: { Authorization: `Bearer ${token}` } });
  },
  async get(token: string, id: string): Promise<Order> {
    return await apiClient.get<Order>(`/orders/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  async checkout(token: string, payload: { cartId: string; shippingAddressId?: string }): Promise<Order> {
    return await apiClient.post<Order>("/orders/checkout", payload, { headers: { Authorization: `Bearer ${token}` } });
  },
};


