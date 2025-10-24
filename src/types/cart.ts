export interface ProductVariant {
  id: string;
  productId: string;
  availableForSale: boolean;
  priceAmount: string;
  priceCurrency: string;
  compareAmount?: string | null;
  compareCurrency?: string | null;
  sku?: string | null;
  barcode?: string | null;
  inventoryQuantity: number;
  weightInGrams?: number | null;
  selectedOptions: Record<string, string>; // JSON field in Prisma
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  vendor?: string | null;
  description?: string | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  minPriceAmount: string;
  minPriceCurrency: string;
  maxPriceAmount: string;
  maxPriceCurrency: string;
  compareMinAmount?: string | null;
  compareMinCurrency?: string | null;
  compareMaxAmount?: string | null;
  compareMaxCurrency?: string | null;
}

export interface CartLine {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  variantId?: string | null;
  variant?: ProductVariant | null;
  quantity: number;
  priceAmount: string;
  priceCurrency: string;
}

export interface Cart {
  id: string;
  userId?: string | null;
  totalQuantity: number;
  lines: CartLine[];
  createdAt: string;
  updatedAt: string;
}

// Input when adding an item
export interface CartItemInput {
  productId: string;
  variantId?: string;
  quantity?: number;
}

// Input when updating quantity
export interface CartUpdateInput {
  quantity: number;
}

// Generic backend response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
