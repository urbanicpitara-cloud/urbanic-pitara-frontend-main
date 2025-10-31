// src/types/tags.ts
import { Product } from "./collections";

export interface Tag {
  id: string;
  handle: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}
