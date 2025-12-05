// types/product.ts

export interface ProductVariantOption {
  optionId: string; // matches ProductOption.id
  value: string; // always a string
}

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  priceAmount: number;
  compareAmount?: number | null;
  priceCurrency: string;
  inventoryQuantity: number;
  // Change: map optionId -> value for easier access
  selectedOptions: Record<string, string>;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  altText?: string;
}

export interface ProductCollection {
  id: string;
  title: string;
  handle: string;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  featuredImageUrl: string;
  featuredImageAlt?: string;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  tags: string[];
  collection?: ProductCollection | null;
  minPriceAmount?: string;
  minPriceCurrency?: string;
  maxPriceAmount?: string;
  maxPriceCurrency?: string;
  compareMinAmount?: string;
  compareMinCurrency?: string;
  compareMaxAmount?: string;
  compareMaxCurrency?: string;
  createdAt?: string; // ISO date string
}
