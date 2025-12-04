// src/components/view/Home/FeaturedProducts.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const featuredProducts = [
  { name: "Premium Branded Quality Kurtis Set", href: "/products/some-white-dress", image: "/premiumkurtiset.webp", price: "₹2,499" },
  { name: "Women Printed Flared Anarkali Kurta with Pant Dupatta Suit Set", href: "/products/blue-dress", image: "/bluekurti.webp", price: "₹1,799" },
  { name: "Elegant Embroidered Sharara Set with Dupatta", href: "/products/kurti", image: "/sharara.webp", price: "₹3,399" },
  { name: "Wedding Special Embroidery Work Top Sharara with Dupatta - Red", href: "/products/red-plazo", image: "/redfloraldress.webp", price: "₹4,899" }
];

const FeaturedProducts = () => {
  return (
    <section className="py-10 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <Link
              key={product.name}
              href={product.href}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-xl aspect-[3/4] mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay Button */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white text-black px-8 py-3 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:bg-[var(--gold)] hover:text-white">
                    View Details
                  </span>
                </div>
              </div>

              <div className="text-center px-2">
                <h3 className="text-lg font-serif text-gray-900 mb-2 line-clamp-1 group-hover:text-[var(--gold)] transition-colors">
                  {product.name}
                </h3>
                <p className="text-black font-semibold text-lg tracking-wide">
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
