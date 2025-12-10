// types/collections.ts

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  products: Product[]; // ✅ each collection has multiple products
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImageUrl?: string;
  minPriceAmount: number;
  maxPriceAmount: number;
  minPriceCurrency: string;

  // ✅ Many-to-many relationship to Collections
  collections?: {
    id: string;
    title: string;
    handle: string;
  }[];

  // Optional tags and images
  tags?: { id: string; name: string }[];
  images?: { url: string; alt?: string }[];
}
