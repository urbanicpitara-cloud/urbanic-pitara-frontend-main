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
  quantity: number;
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage: {
      url: string;
      altText: string;
    } | null;
  };
  variant: {
    id: string;
    selectedOptions: Record<string, string>;
  } | null;
  customProduct: {
    id: string;
    color: string;
    size: string;
    previewUrl: string;
  } | null;
  price: {
    amount: string;
    currencyCode: string;
  };
  subtotal: {
    amount: string;
    currencyCode: string;
  };
}

export interface Cart {
  id: string;
  totalQuantity: number;
  subtotal: {
    amount: string;
    currencyCode: string;
  };
  lines: CartLine[];
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
