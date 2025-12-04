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
    <section className="py-10 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-xl aspect-[3/4] mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* New Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    New
                  </span>
                </div>

                {/* Overlay Button */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white text-black px-6 py-3 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                    Shop Now
                  </span>
                </div>
              </div>

              <div className="text-center px-2">
                <h3 className="text-lg font-serif text-gray-900 mb-2 line-clamp-1 group-hover:text-[var(--gold)] transition-colors">
                  {item.name}
                </h3>
                <p className="text-black font-semibold text-lg tracking-wide">
                  {item.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
