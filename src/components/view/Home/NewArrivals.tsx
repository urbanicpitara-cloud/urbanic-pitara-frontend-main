// src/components/view/Home/NewArrivals.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const newArrivals = [
  { name: "Exquisite Crimson Charm Lehenga with hand-embroidery in Raw Silk", href: "/product/lehenga-1", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/7N2A1745.jpg?v=1758605958&width=713", price: "₹6,999" },
  { name: "Indo-Western Dress", href: "/product/black-plazzo", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/20250905_170706.jpg?v=1757574913&width=823", price: "₹49,999" },
  { name: "Women’s Red Georgette Embroidered Sharara Set with Dupatta,3-Piece Ethnic Wear", href: "/product/red-plazo-1", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/20250905_155257.png?v=1757567353&width=713", price: "₹5,999" },
  { name: "Trendy Latest Solid Stylish Casual Cotton Trendy green T-Shirt", href: "/product/sea-blue-t-shirt", image: "https://0dpp0x-v0.myshopify.com/cdn/shop/files/20250903_174242.jpg?v=1757575993&width=823", price: "₹499" },
];

const NewArrivals = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-gray-50">
      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">
        New Arrivals
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {newArrivals.map((item) => (
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

export default NewArrivals;
