"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/atoms/cart";
import { Product, ProductVariant } from "@/types/products";
import useEmblaCarousel, { EmblaViewportRefType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PaymentMethodButtons from "@/components/PaymentMethodButtons";
import { PaymentMethod } from "@/lib/paymentMethods";

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  // const { user } = useAuth();
  const { addItem } = useCart();
  // const router = useRouter();

  const normalizeOptionValue = (val: string | { id: string; name?: string }): string =>
    typeof val === "string" ? val : val.name ?? val.id;

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};

    // Check if product has variants
    if (!product.variants || product.variants.length === 0) {
      // No variants - just use first value of each option if options exist
      product.options?.forEach(opt => {
        if (opt.values && opt.values.length > 0) {
          defaults[opt.id] = normalizeOptionValue(opt.values[0]);
        }
      });
      return defaults;
    }

    // Initialize with the first available variant's options
    const defaultVariant = product.variants[0];
    if (defaultVariant) {
      const variantOptions = defaultVariant.selectedOptions;
      product.options.forEach(opt => {
        const optionName = opt.name.toLowerCase();
        if (variantOptions[optionName]) {
          defaults[opt.id] = variantOptions[optionName];
        } else if (opt.values.length > 0) {
          // Fallback to first available value if no variant option found
          defaults[opt.id] = normalizeOptionValue(opt.values[0]);
        }
      });
    }

    return defaults;
  });

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants[0] ?? null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("PHONEPE");

  // Read more / Read less
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionLimit = 200; // characters before truncation
  const isLongDescription = product.descriptionHtml.length > descriptionLimit;

  const validImages = [
    ...new Map(
      [
        product.featuredImageUrl ? { url: product.featuredImageUrl, altText: product.featuredImageAlt } : null,
        ...(product.images || [])
      ]
        .filter(img => img?.url) // Filter out null/undefined
        .map(img => [img!.url, { url: img!.url, altText: img!.altText ?? product.featuredImageAlt }])
    ).values()
  ];

  // Fallback if no images at all
  const displayImages = validImages.length > 0 ? validImages : [
    { url: '/placeholder-product.png', altText: product.title }
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
    // If no variants exist, set to null
    if (!product.variants || product.variants.length === 0) {
      setSelectedVariant(null);
      return;
    }

    const match = product.variants.find(variant => {
      const variantOptions = variant.selectedOptions;

      // Match all selected options with variant options
      return product.options.every(opt => {
        const optionName = opt.name.toLowerCase();
        const selectedValue = selectedOptions[opt.id]?.toLowerCase();
        const variantValue = variantOptions[optionName]?.toLowerCase();
        return selectedValue === variantValue;
      });
    });

    setSelectedVariant(match ?? product.variants[0] ?? null);
  }, [selectedOptions, product.variants, product.options]);

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionId]: value }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number(e.target.value));
  };

  const handleAddToCart = async (method: PaymentMethod) => {
    if (addingToCart) return; // prevent rapid clicks

    // For products without variants, we can't add to cart
    if (!selectedVariant) {
      toast.error("This product has no available variants. Please contact support.");
      return;
    }

    try {
      setAddingToCart(true);
      await addItem(product.id, quantity, selectedVariant.id);

      // Store payment method preference and redirect to checkout
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('selectedPaymentMethod', method);
        }
      } catch (e) {
        console.error('Failed to store payment method:', e);
      }

      // setAddToCartSuccess(true);
      toast.success(`${product.title} added to cart!`);

      // // Redirect to checkout after brief delay
      // setTimeout(() => {
      //   router.push("/cart");
      // }, 500);
    } catch (err) {
      console.error(err);
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      // Extract error message from response
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to add item to cart";
      toast.error(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 "
    >
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/" className="text-gray-600 hover:text-black">Home</Link>{" / "}
        {product.collections && product.collections.length > 0 && (
          <>
            <Link href={`/products`} className="text-gray-600 hover:text-black">
              {product.collections[0].title}
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
              aria-hidden={displayImages.length <= 1}
            >
              {displayImages.map(img => (
                <button
                  key={`thumb-${img.url}`}
                  onClick={() => onThumbClick(displayImages.indexOf(img))}
                  aria-pressed={selectedIndex === displayImages.indexOf(img)}
                  className={cn(
                    "relative shrink-0 h-20 w-20 rounded-lg overflow-hidden border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    selectedIndex === displayImages.indexOf(img) ? "ring-2 ring-offset-2 ring-black border-transparent shadow-md" : "border-gray-200"
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
                  {displayImages.map(img => (
                    <div key={`main-${img.url}`} className="min-w-full flex items-center justify-center bg-white">
                      <Image
                        src={img.url}
                        alt={img.altText ?? "product-image"}
                        width={1200}
                        height={900}
                        priority={displayImages.indexOf(img) === 0}
                        loading={displayImages.indexOf(img) === 0 ? "eager" : "lazy"}
                        className="w-full max-h-[70vh] object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop nav */}
              {displayImages.length > 1 && (
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
                    {displayImages.map(img => (
                      <button
                        key={`mobile-thumb-${img.url}`}
                        onClick={() => onThumbClick(displayImages.indexOf(img))}
                        className={cn(
                          "flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border transition-shadow",
                          selectedIndex === displayImages.indexOf(img) ? "border-black shadow-md" : "border-gray-200"
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
                className="text-black text-sm mt-1 underline hover:text-gray-700"
              >
                {showFullDescription ? "Read less" : "Read more"}
              </button>
            )}
          </div>

          {/* 🆕 Color Variants from Group */}
          {product.variantGroup?.products && product.variantGroup.products.length > 1 && (() => {
            // Check if at least one product has color information
            const hasColorInfo = product.variantGroup.products.some(p =>
              p.metafields?.color || p.metafields?.colorValue
            );

            // Only show variant group if there are multiple products
            if (!hasColorInfo && product.variantGroup.products.length <= 1) return null;

            return (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {hasColorInfo ? `Color: ${(product.metafields?.color as string) || 'Selected'}` : 'Available Variants'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variantGroup.products.map((p: Product) => {
                    const isSelected = p.handle === product.handle;
                    const color = (p.metafields?.color as string) || p.title;
                    const colorValue = p.metafields?.colorValue as string;
                    const hasImage = p.images && p.images.length > 0;

                    return (
                      <Link
                        key={p.id}
                        href={`/products/${p.handle}`}
                        className={cn(
                          "relative h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden",
                          isSelected ? "border-black ring-1 ring-black ring-offset-1" : "border-gray-300 hover:border-gray-400"
                        )}
                        title={color}
                      >
                        {colorValue ? (
                          // Show color swatch if colorValue exists
                          <span
                            className="h-8 w-8 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: colorValue }}
                          />
                        ) : hasImage ? (
                          // Show product thumbnail if no color but has image
                          <div className="relative h-full w-full">
                            <Image
                              src={p.images[0].url}
                              alt={color}
                              fill
                              className="object-cover rounded-full"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          // Show first letter of title as fallback
                          <span className="text-xs font-medium text-gray-600">
                            {p.title.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Product Options */}
          {product.options.map(opt => (
            <div key={opt.id} className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">{opt.name}</h3>
              <div className="flex flex-wrap gap-2">
                {opt.values.map(val => {
                  const displayValue = normalizeOptionValue(val);
                  const isSelected = selectedOptions[opt.id]?.toLowerCase() === displayValue.toLowerCase();

                  // Find if there's a variant available with this option
                  const hasVariantWithOption = product.variants.some(variant => {
                    const variantOptions = variant.selectedOptions;
                    return variantOptions[opt.name.toLowerCase()]?.toLowerCase() === displayValue.toLowerCase();
                  });

                  return (
                    <button
                      key={`${opt.id}-${displayValue}`}
                      className={cn(
                        "px-4 py-2 border text-sm font-medium transition-all duration-200",
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-700 hover:border-black hover:text-black",
                        !hasVariantWithOption && "opacity-50 cursor-not-allowed decoration-slice line-through"
                      )}
                      onClick={() => handleOptionChange(opt.id, displayValue)}
                      disabled={!hasVariantWithOption}
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
              className="w-24 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(q => (
                <option key={`qty-${q}`} value={q}>{q}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Buttons */}
          {selectedVariant && (
            <PaymentMethodButtons
              basePrice={Number(selectedVariant.priceAmount)}
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
              onAddToCart={handleAddToCart}
              loading={addingToCart}
              disabled={
                !selectedVariant ||
                quantity > (selectedVariant.inventoryQuantity ?? 0)
              }
            />
          )}

          {/* No variants warning */}
          {(!product.variants || product.variants.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ This product has no size/variant options available. Please add variants in the admin panel to enable purchasing.
              </p>
            </div>
          )}

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
              <Link key={`related-${related.id}-${related.handle}`} href={`/products/${related.handle}`} className="group">
                <div className="relative h-64 rounded-lg overflow-hidden mb-3">
                  {related.featuredImageUrl ? (
                    <Image
                      src={related.featuredImageUrl}
                      alt={related.featuredImageAlt ?? related.title}
                      fill
                      className="object-cover transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:underline transition">{related.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
