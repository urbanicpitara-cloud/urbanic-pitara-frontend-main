"use client";

import { ProductPriceRange } from "@/types/shopify-graphql";
import React from "react";

const ProductPrice = ({ priceRange }: { priceRange: ProductPriceRange }) => {
  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    }).format(parseFloat(amount));
  };

  const min = priceRange.minVariantPrice.amount;
  const max = priceRange.maxVariantPrice.amount;
  const currency = priceRange.minVariantPrice.currencyCode;

  return (
    <div className="flex items-baseline gap-2">
      {/* Main Price */}
      <p
        suppressHydrationWarning
        className="text-xl font-serif font-medium text-black"
      >
        {formatPrice(min, currency)}
      </p>

      {/* Show range or strikethrough max price */}
      {max !== min && (
        <p
          suppressHydrationWarning
          className="text-md font-sans text-gold line-through"
        >
          {formatPrice(max, currency)}
        </p>
      )}
    </div>
  );
};

export default ProductPrice;
