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
    <section className="py-10 px-4 md:px-8">
      {/* <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">
        Shop By Category
      </h2> */}
      <div className="flex flex-wrap -mx-4 justify-center">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group relative m-4 flex-shrink-0 w-full sm:w-[45%] lg:w-[22%] rounded-lg overflow-hidden"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              width={600}
              height={800}
              className="object-cover w-full h-full transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center text-white text-2xl font-semibold">
              {cat.name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
