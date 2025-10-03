// src/components/view/Home/FeaturedCollections.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const featured = [
  { name: "Royal Bridal Lehenga", href: "/products/bridal-lehenga", image: "/products/bridal-lehenga.jpg", price: "₹1,29,999" },
  { name: "Elegant Indo-Western Gown", href: "/products/indowestern-gown", image: "/products/indowestern-gown.jpg", price: "₹49,999" },
  { name: "Traditional Saree", href: "/products/traditional-saree", image: "/products/traditional-saree.jpg", price: "₹34,999" },
  { name: "Casual Designer T-Shirt", href: "/products/tshirt", image: "/products/tshirt.jpg", price: "₹1,499" },
];

const FeaturedCollections = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-gray-50">
      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">
        Featured Collections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {featured.map((item) => (
          <Link key={item.name} href={item.href} className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <Image
              src={item.image}
              alt={item.name}
              width={400}
              height={500}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-50 text-white p-4 flex flex-col items-center">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="mt-1">{item.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;
