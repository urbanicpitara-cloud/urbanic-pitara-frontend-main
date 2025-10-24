"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/atoms/cart"; 
import { Product, ProductVariant } from "@/types/products";
import useEmblaCarousel, { EmblaViewportRefType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const { user } = useAuth();
  const { addItem } = useCart();

  const normalizeOptionValue = (val: string | { id: string; name?: string }): string =>
    typeof val === "string" ? val : val.name ?? val.id;

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    product.options.forEach(opt => {
      if (opt.values.length > 0) {
        defaults[opt.id] = normalizeOptionValue(opt.values[0]);
      }
    });
    return defaults;
  });

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants[0] ?? null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState<boolean>(false);

  // Read more / Read less
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionLimit = 200; // characters before truncation
  const isLongDescription = product.descriptionHtml.length > descriptionLimit;

  const validImages = [
    ...new Map(
      [{ url: product.featuredImageUrl, altText: product.featuredImageAlt }, ...product.images]
        .filter(img => img?.url)
        .map(img => [img.url, { url: img.url, altText: img.altText ?? product.featuredImageAlt }])
    ).values()
  ];

  // Embla carousel
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [mainRef, mainApi] = useEmblaCarousel({ loop: false, align: "center" });
  const [thumbRef, thumbApi] = useEmblaCarousel({ containScroll: "trimSnaps", dragFree: true });

  const scrollPrev = useCallback(() => mainApi?.scrollPrev(), [mainApi]);
  const scrollNext = useCallback(() => mainApi?.scrollNext(), [mainApi]);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
      setSelectedIndex(index);
    },
    [mainApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi) return;
    const idx = mainApi.selectedScrollSnap();
    setSelectedIndex(idx);
    setCanScrollPrev(mainApi.canScrollPrev());
    setCanScrollNext(mainApi.canScrollNext());
    thumbApi?.scrollTo(idx);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect);
      mainApi.off("reInit", onSelect);
    };
  }, [mainApi, onSelect]);

  // Update selected variant whenever options change
  useEffect(() => {
    const match = product.variants.find(variant => {
      if (!Array.isArray(variant.selectedOptions)) return false;
      return variant.selectedOptions.every(
        o => selectedOptions[o.optionId] === normalizeOptionValue(o.value)
      );
    });
    setSelectedVariant(match ?? product.variants[0] ?? null);
  }, [selectedOptions, product.variants]);

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionId]: value }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number(e.target.value));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || addingToCart) return; // prevent rapid clicks
    try {
      setAddingToCart(true);
      await addItem(product.id, quantity, selectedVariant.id);
      setAddToCartSuccess(true);
      toast.success(`${product.title} added to cart!`);
      setTimeout(() => setAddToCartSuccess(false), 3000);
    } catch (err) {
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/" className="text-gray-600 hover:text-indigo-600">Home</Link>{" / "}
        {product.collection && (
          <>
            <Link href={`/products`} className="text-gray-600 hover:text-indigo-600">
              {product.collection.title}
            </Link>{" / "}
          </>
        )}
        <span className="text-gray-900">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Carousel */}
        <div className="w-full col-span-1">
          <div className="w-full col-span-2 max-w-7xl mx-auto lg:grid lg:grid-cols-[88px_1fr] lg:gap-x-6">
            {/* Thumbnails */}
            <div
              ref={thumbRef as EmblaViewportRefType}
              className="order-2 mt-3 gap-3 overflow-x-auto px-1 hidden lg:order-1 lg:mt-0 lg:block lg:overflow-visible"
              aria-hidden={validImages.length <= 1}
            >
              {validImages.map(img => (
                <button
                  key={`thumb-${img.url}`}
                  onClick={() => onThumbClick(validImages.indexOf(img))}
                  aria-pressed={selectedIndex === validImages.indexOf(img)}
                  className={cn(
                    "relative shrink-0 h-20 w-20 rounded-lg overflow-hidden border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    selectedIndex === validImages.indexOf(img) ? "ring-2 ring-offset-2 ring-indigo-500 border-transparent shadow-md" : "border-gray-200"
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? "thumbnail"}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>

            {/* Main Images */}
            <div className="relative order-1 lg:order-2">
              <div className="relative w-full overflow-hidden rounded-lg" ref={mainRef as EmblaViewportRefType}>
                <div className="flex touch-pan-y">
                  {validImages.map(img => (
                    <div key={`main-${img.url}`} className="min-w-full flex items-center justify-center bg-white">
                      <Image
                        src={img.url}
                        alt={img.altText ?? "product-image"}
                        width={1200}
                        height={900}
                        priority={validImages.indexOf(img) === 0}
                        loading={validImages.indexOf(img) === 0 ? "eager" : "lazy"}
                        className="w-full max-h-[70vh] object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop nav */}
              {validImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Previous image"
                    onClick={scrollPrev}
                    disabled={!canScrollPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Next image"
                    onClick={scrollNext}
                    disabled={!canScrollNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Mobile thumbnails */}
                  <div className="flex gap-2 overflow-x-auto mt-2 lg:hidden">
                    {validImages.map(img => (
                      <button
                        key={`mobile-thumb-${img.url}`}
                        onClick={() => onThumbClick(validImages.indexOf(img))}
                        className={cn(
                          "flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border transition-shadow",
                          selectedIndex === validImages.indexOf(img) ? "border-indigo-600 shadow-md" : "border-gray-200"
                        )}
                      >
                        <Image src={img.url} alt={img.altText || "product-image"} width={64} height={64} className="object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="col-span-1">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

          {selectedVariant && (
            <p className="text-2xl font-semibold text-gray-900 mb-4">
              {selectedVariant.priceCurrency} {Number(selectedVariant.priceAmount).toFixed(2)}
              {selectedVariant.compareAmount != null && (
                <span className="ml-2 text-lg line-through text-gray-500">
                  {selectedVariant.priceCurrency} {Number(selectedVariant.compareAmount).toFixed(2)}
                </span>
              )}
            </p>
          )}

          {/* Read More / Read Less */}
          <div className="prose prose-sm mb-6">
            <div
              dangerouslySetInnerHTML={{
                __html: showFullDescription
                  ? product.descriptionHtml
                  : product.descriptionHtml.slice(0, descriptionLimit) + (isLongDescription ? "..." : ""),
              }}
            />
            {isLongDescription && (
              <button
                onClick={() => setShowFullDescription(prev => !prev)}
                className="text-indigo-600 text-sm mt-1 underline"
              >
                {showFullDescription ? "Read less" : "Read more"}
              </button>
            )}
          </div>

          {/* Product Options */}
          {product.options.map(opt => (
            <div key={opt.id} className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">{opt.name}</h3>
              <div className="flex flex-wrap gap-2">
                {opt.values.map(val => {
                  const displayValue = normalizeOptionValue(val);
                  return (
                    <button
                      key={`${opt.id}-${displayValue}`}
                      className={cn(
                        "px-3 py-1 border rounded-md",
                        selectedOptions[opt.id] === displayValue
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      )}
                      onClick={() => handleOptionChange(opt.id, displayValue)}
                    >
                      {displayValue}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(q => (
                <option key={`qty-${q}`} value={q}>{q}</option>
              ))}
            </select>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || quantity > (selectedVariant.inventoryQuantity ?? 0) || addingToCart}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {addingToCart ? "Adding..." : addToCartSuccess ? "Added!" : "Add to Cart"}
          </button>

          {selectedVariant && selectedVariant.inventoryQuantity! < 5 && selectedVariant.inventoryQuantity! > 0 && (
            <p className="text-orange-600 text-sm mt-2">
              Only {selectedVariant.inventoryQuantity} left in stock!
            </p>
          )}
          {selectedVariant && selectedVariant.inventoryQuantity === 0 && (
            <p className="text-red-600 text-sm mt-2">Out of stock</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(related => (
              <Link key={`related-${related.id}-${related.handle}`} href={`/product/${related.handle}`} className="group">
                <div className="relative h-64 rounded-lg overflow-hidden mb-3">
                  {related.featuredImageUrl ? (
                    <Image
                      src={related.featuredImageUrl}
                      alt={related.featuredImageAlt ?? related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition">{related.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
