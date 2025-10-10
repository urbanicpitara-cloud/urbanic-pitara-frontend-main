import { apiClient } from "@/lib/api/client";

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  descriptionHtml?: string | null;
  image?: { url: string; altText?: string | null } | null;
};

export const collectionsRepository = {
  async list(): Promise<Collection[]> {
    return await apiClient.get<Collection[]>("/collections");
  },
};

import { apiClient } from "@/lib/api/client";
import { Collection } from "@/lib/api/types";

export const collectionsRepository = {
  async list(): Promise<Collection[]> {
    return await apiClient.get<Collection[]>("/collections");
  },

  async getByHandle(handle: string): Promise<Collection> {
    return await apiClient.get<Collection>(`/collections/${encodeURIComponent(handle)}`);
  },
};


