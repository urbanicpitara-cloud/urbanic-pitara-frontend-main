"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, {EmblaViewportRefType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ImageEdge } from "@/types/shopify-graphql";

type Props = {
  images?: ImageEdge[] | null;
};

export default function ProductCarousel({ images = [] }: Props) {
  const validImages = (images ?? []).filter((i) => !!i?.node?.url);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Update ref types
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

  // Placeholder when no images present
  if (!validImages.length) {
    return (
      <div className="w-full max-w-xl mx-auto col-span-2">
        <div className="relative aspect-[4/3] w-full bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 11l2 2 4-4 5 6M7 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sr-only">No product images</span>
          <div className="absolute bottom-3 text-sm text-gray-500">No images available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full col-span-2 max-w-7xl mx-auto lg:grid lg:grid-cols-[88px_1fr] lg:gap-x-6">
      {/* Thumbnails: mobile horizontal below main; desktop vertical left */}
      <div
        ref={thumbRef as EmblaViewportRefType}
        className="order-2 mt-3 flex gap-3 overflow-x-auto px-1 lg:order-1 lg:mt-0 lg:block lg:overflow-visible"
        aria-hidden={validImages.length <= 1}
      >
        {validImages.map((edge, i) => {
          const node = edge.node!;
          if (!node?.url) return null;
          return (
            <button
              key={node.id ?? i}
              onClick={() => onThumbClick(i)}
              aria-pressed={selectedIndex === i}
              className={cn(
                "relative shrink-0 h-20 w-20 rounded-lg overflow-hidden border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                selectedIndex === i ? "ring-2 ring-offset-2 ring-indigo-500 border-transparent shadow-md" : "border-gray-200"
              )}
            >
              <Image
                src={node.url}
                alt={node.altText ?? `Thumbnail ${i + 1}`}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                sizes="80px"
              />
            </button>
          );
        })}
      </div>

      {/* Main image + controls */}
      <div className="relative order-1 lg:order-2">
        <div className="relative w-full overflow-hidden rounded-lg" ref={mainRef as EmblaViewportRefType}>
          <div className="flex touch-pan-y">
            {validImages.map((edge, i) => {
              const node = edge.node!;
              if (!node?.url) return null;
              return (
                <div key={node.id ?? i} className="min-w-full flex items-center justify-center bg-white">
                  <Image
                    src={node.url}
                    alt={node.altText ?? `Product image ${i + 1}`}
                    width={1200}
                    height={900}
                    priority={i === 0}
                    className="w-full max-h-[70vh] object-contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop nav buttons */}
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

            {/* Mobile indicators */}
            <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex gap-2 sm:hidden">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onThumbClick(idx)}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors",
                    selectedIndex === idx ? "bg-indigo-600" : "bg-gray-300"
                  )}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
