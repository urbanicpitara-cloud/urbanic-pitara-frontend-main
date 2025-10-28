// src/components/view/Home/NewArrivals.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const newArrivals = [
  { name: "Exquisite Crimson Charm Lehenga with hand-embroidery in Raw Silk", href: "/products/lehenga-1", image: "/lehenga-new-arrival.webp", price: "₹23,000" },
  { name: "Midnight Black Bel Buti Embroidered Indo Western", href: "/products/black-plazzo", image: "/midnightbloom.webp", price: "₹2,999" },
  { name: "Women’s Red Georgette Embroidered Sharara Set with Dupatta,3-Piece Ethnic Wear", href: "/products/red-plazo-1", image: "/redgeorget.webp", price: "₹2,399" },
  { name: "Trendy Latest Solid Stylish Casual Cotton Trendy green T-Shirt", href: "/products/sea-blue-t-shirt", image: "/greentshirt.webp", price: "₹499" },
];

const NewArrivals = () => {
  return (
    <section className="py-10 px-4 md:px-8 bg-gray-50">
      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">
        New Arrivals
      </h2>
      <div className="flex flex-wrap -mx-4 justify-center">
        {newArrivals.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group relative m-4 flex-shrink-0 w-full sm:w-[45%] lg:w-[22%] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="relative w-full aspect-[4/5]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-50 text-white p-4 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-center">{item.name}</h3>
              <p className="mt-1">{item.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
