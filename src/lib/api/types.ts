// Shared API-facing types matching our frontend needs

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText?: string | null;
};

export type ProductOptionValue = {
  id: string;
  name: string;
  swatch?: { color?: string | null } | null;
};

export type ProductOption = {
  name: string;
  optionValues?: ProductOptionValue[];
};

export type ProductVariant = {
  id: string;
  availableForSale?: boolean;
  compareAtPrice?: Money | null;
  price: Money;
  selectedOptions: { name: string; value: string }[];
};

export type ProductSummary = {
  id: string;
  title: string;
  vendor?: string | null;
  handle: string;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange?: { minVariantPrice: Money; maxVariantPrice: Money } | null;
  images?: Image[];
  featuredImage?: Image | null;
  options?: ProductOption[];
};

export type ProductDetail = ProductSummary & {
  description?: string | null;
  descriptionHtml?: string | null;
  images?: Image[];
  variants?: ProductVariant[];
};

export type PaginatedResult<T> = {
  items: T[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  descriptionHtml?: string | null;
  image?: Image | null;
};


