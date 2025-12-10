"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

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
    className={`group relative block rounded-none overflow-hidden h-[500px] ${className}`}
  >
    {image && (
      <Image
        src={image}
        alt="Category"
        fill
        className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
      />
    )}
    {children}
  </Link>
);

const Categories = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-6">

        {/* Row 1: Customizer (2/3) + Bridal (1/3) */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Item 1: Customizer */}
          <CategoryCard
            href="/customizer"
            className="w-full md:w-2/3"
          >
            <Image
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop"
              alt="Design Your Own"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />

            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full transform transition-transform duration-500 group-hover:-translate-y-2">
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-[0.2em] uppercase mb-6">
                New Feature
              </span>
              <h3 className="text-3xl md:text-5xl font-[family-name:var(--font-cinzel)] text-white mb-4 leading-tight">
                Design Your Own <br /> Masterpiece
              </h3>
              <p className="text-gray-200 mb-8 max-w-lg text-lg font-light leading-relaxed font-[family-name:var(--font-geist-sans)]">
                Unleash your creativity. Customize hoodies and t-shirts.
              </p>
              <div className="inline-flex items-center text-white border-b border-white pb-1 group/btn">
                <span className="tracking-widest uppercase text-sm">Start Designing</span>
                <span className="ml-4 transition-transform group-hover/btn:translate-x-2">→</span>
              </div>
            </div>
          </CategoryCard>

          {/* Item 2: Bridal */}
          <CategoryCard
            href={categories[0].href}
            image={categories[0].image}
            className="w-full md:w-1/3"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 group-hover:-translate-y-2">
              <h3 className="text-2xl font-[family-name:var(--font-cinzel)] text-white mb-2">{categories[0].name}</h3>
              <p className="text-white/80 text-sm tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                Timeless Elegance
              </p>
            </div>
          </CategoryCard>
        </div>

        {/* Row 2: Remaining Items (Equal Width) */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {categories.slice(1).map((category, idx) => (
            <CategoryCard
              key={idx}
              href={category.href}
              image={category.image}
              className="w-full md:w-1/3"
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-2xl font-[family-name:var(--font-cinzel)] text-white mb-2 drop-shadow-lg">{category.name}</h3>
                  <div className="h-[1px] w-0 bg-white mx-auto group-hover:w-12 transition-all duration-500" />
                  <p className="text-white/80 text-xs tracking-widest uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    View Collection
                  </p>
                </div>
              </div>
            </CategoryCard>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Categories;
