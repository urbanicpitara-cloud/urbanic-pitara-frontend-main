// src/components/view/Home/FeaturedProducts.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const featuredProducts = [
    { name: "Premium Branded Quality Kurtis Set", href: "/product/some-white-dress", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/20250830_160518.jpg?v=1758608402&width=493", price: "₹2,499" },
  { name: "Women Printed Flared Anarkali Kurta with Pant Dupatta Suit Set", href: "/product/blue-dress", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/7N2A1293.jpg?v=1758610231&width=823", price: "₹4,699" },
  { name: "Elegant Embroidered Sharara Set with Dupatta", href: "/product/kurti", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/20250902_173902.jpg?v=1757569940&width=823", price: "₹2,899" },
  { name: "Wedding Special Embroidery Work Top Sharara with Dupatta - Red", href: "/product/red-plazo", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/20250903_171241.jpg?v=1757485927&width=823", price: "₹2,999" }
];

const FeaturedProducts = () => {
  return (
    <section className="py-16 px-4 md:px-8">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Featured Products
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {featuredProducts.map((product) => (
          <Link key={product.name} href={product.href} className="group relative overflow-hidden rounded-lg border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Image
              src={product.image}
              alt={product.name}
              width={500}
              height={700}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white p-4">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="mt-2 text-lg">{product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
