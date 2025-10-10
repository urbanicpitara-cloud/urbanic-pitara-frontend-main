import { apiClient } from "@/lib/api/client";

export type MenuItem = { id: string; title: string; url: string; children?: MenuItem[] };

export const menuRepository = {
  async getMenu(handle: string): Promise<MenuItem[]> {
    const res = await apiClient.get<{ items: MenuItem[] }>(`/menu/${encodeURIComponent(handle)}`);
    return res.items;
  },
};


