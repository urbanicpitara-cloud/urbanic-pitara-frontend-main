"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const categories = [
  { name: "Bridal", href: "/collections/bridal", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/7N2A1580.jpg?v=1758620242&width=823" },
  { name: "Indo-Western", href: "/collections/indo-western", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/20250829_154730_5f246d23-2040-4c2b-bf66-546229a90472.png?v=1758344651&width=400" },
  { name: "Traditional", href: "/collections/traditionals", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/20250902_171959.jpg?v=1757570040&width=823" },
  { name: "T-Shirts", href: "/collections/t-shirts", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/7N2A1321_-_frame_at_0m1s.jpg?v=1758610675&width=823" },
];

const CategoryCard = ({
  children,
  href,
  className = "",
  image
}: {
  children?: React.ReactNode;
  href: string;
  className?: string;
  image?: string
}) => (
  <Link
    href={href}
    className={`group relative block overflow-hidden h-full min-h-[300px] ${className}`}
  >
    {image && (
      <Image
        src={image}
        alt="Category"
        fill
        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
      />
    )}
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
    {children}
  </Link>
);

const Categories = () => {
  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto h-auto md:h-[800px] grid grid-cols-1 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-2">

        {/* Large Feature: Customizer */}
        <CategoryCard
          href="/customizer"
          className="col-span-1 md:col-span-2 row-span-2 relative"
        >
          <Image
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop"
            alt="Design Your Own"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
            <div className="overflow-hidden mb-4">
              <span className="inline-block px-3 py-1 border border-white/30 text-white text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
                New Experience
              </span>
            </div>
            <h3 className="text-4xl md:text-6xl font-[family-name:var(--font-cinzel)] text-white mb-6 leading-none">
              Design Your <br /> <span className="italic font-serif">Masterpiece</span>
            </h3>

            <div className="flex items-center gap-4 group/btn">
              <span className="h-[1px] w-12 bg-white transition-all duration-300 group-hover/btn:w-20" />
              <span className="text-white text-sm tracking-widest uppercase font-medium">Start Creating</span>
            </div>
          </div>
        </CategoryCard>

        {/* Dynamic Category Grid */}
        {categories.map((category, idx) => (
          <CategoryCard
            key={idx}
            href={category.href}
            image={category.image}
            className="col-span-1 md:col-span-1 row-span-1"
          >
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent">
              <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <h3 className="text-2xl font-[family-name:var(--font-cinzel)] text-white mb-2">{category.name}</h3>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <span className="text-white/80 text-[10px] tracking-widest uppercase">Explore</span>
                  <ArrowUpRight className="w-4 h-4 text-white/80" />
                </div>
              </div>
            </div>
          </CategoryCard>
        ))}

      </div>
    </section>
  );
};

export default Categories;
