// import type { User } from './auth';
import type { Address } from './profile';

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
}

export interface ProductOptionValue {
  id: string;
  name: string;
  color?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  availableForSale: boolean;
  priceAmount: string;
  priceCurrency: string;
  compareAmount?: string;
  compareCurrency?: string;
  sku?: string;
  barcode?: string;
  inventoryQuantity: number;
  weightInGrams?: number;
  selectedOptions: Record<string, string>;
}

export interface Tag {
  id: string;
  handle: string;
  name: string;
}

export interface VariantGroup {
  id: string;
  name: string;
  description?: string;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  vendor?: string;
  collection?: {
    id: string;
    handle: string;
    title: string;
  };
  collections?: Array<{
    id: string;
    handle: string;
    title: string;
  }>;
  tags: Tag[];
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  published: boolean;
  publishedAt?: string;
  metafields?: Record<string, any>;
  variantGroup?: VariantGroup | null;
  variantGroupId?: string | null;
  minPriceAmount: string;
  minPriceCurrency: string;
  maxPriceAmount: string;
  maxPriceCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  imageUrl?: string;
  imageAlt?: string;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface CartLine {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  priceAmount: string;
  priceCurrency: string;
  product: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  userId?: string;
  totalQuantity: number;
  lines: CartLine[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  priceAmount: string;
  priceCurrency: string;
  product: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: string;
  totalCurrency: string;
  placedAt: string;
  items: OrderItem[];
  shippingAddressId?: string;
  shippingAddress?: Address;
}

export interface MenuItem {
  id: string;
  title: string;
  url: string;
  parentId?: string;
  children: MenuItem[];
}

export interface Menu {
  id: string;
  handle: string;
  items: MenuItem[];
}
