// src/components/view/Home/Categories.tsx
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

const Categories = () => {
  return (
    <section className="py-10 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Bento Grid Layout - 5 Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px]">

          {/* Item 1: Customizer (Large Feature) - Spans 2 cols, 2 rows */}
          <Link
            href="/customizer"
            className="group relative md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden shadow-xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop"
              alt="Design Your Own"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />

            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <span className="inline-block px-4 py-1.5 bg-[var(--gold)] text-white text-xs font-bold tracking-widest uppercase rounded-full mb-4 shadow-lg">
                New Feature
              </span>
              <h3 className="text-3xl md:text-5xl font-serif text-white mb-4 leading-tight">
                Design Your Own <br /> Masterpiece
              </h3>
              <p className="text-gray-200 mb-8 max-w-lg text-lg font-light leading-relaxed">
                Unleash your creativity. Customize hoodies and t-shirts with our interactive 3D design tool.
              </p>
              <span className="inline-flex items-center px-8 py-3 bg-white text-black font-semibold rounded-full transition-transform group-hover:scale-105">
                Start Designing <span className="ml-2">→</span>
              </span>
            </div>
          </Link>

          {/* Item 2: Bridal (Tall) - Spans 1 col, 2 rows */}
          <Link
            href={categories[0].href}
            className="group relative md:col-span-1 md:row-span-2 rounded-3xl overflow-hidden shadow-lg"
          >
            <Image
              src={categories[0].image}
              alt={categories[0].name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="text-2xl font-serif text-white mb-1">{categories[0].name}</h3>
              <p className="text-gray-300 text-sm">Timeless Elegance</p>
            </div>
          </Link>

          {/* Item 3: Indo-Western - Spans 1 col */}
          <Link
            href={categories[1].href}
            className="group relative md:col-span-1 rounded-3xl overflow-hidden shadow-lg"
          >
            <Image
              src={categories[1].image}
              alt={categories[1].name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="text-xl font-serif text-white mb-1">{categories[1].name}</h3>
            </div>
          </Link>

          {/* Item 4: Traditional - Spans 1 col */}
          <Link
            href={categories[2].href}
            className="group relative md:col-span-1 rounded-3xl overflow-hidden shadow-lg"
          >
            <Image
              src={categories[2].image}
              alt={categories[2].name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="text-xl font-serif text-white mb-1">{categories[2].name}</h3>
            </div>
          </Link>

          {/* Item 5: T-Shirts - Spans 1 col */}
          <Link
            href={categories[3].href}
            className="group relative md:col-span-1 rounded-3xl overflow-hidden shadow-lg"
          >
            <Image
              src={categories[3].image}
              alt={categories[3].name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="text-xl font-serif text-white mb-1">{categories[3].name}</h3>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default Categories;
