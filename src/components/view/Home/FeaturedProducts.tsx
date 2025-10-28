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
    <section className="py-16 px-4 md:px-8">
      {/* <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-serif">
        Featured Products
      </h2> */}
      <div className="flex flex-wrap -mx-4 justify-center">
        {featuredProducts.map((product) => (
          <Link
            key={product.name}
            href={product.href}
            className="group relative overflow-hidden rounded-lg border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 m-4 flex-shrink-0 w-full sm:w-[45%] lg:w-[22%]"
          >
            <div className="relative w-full aspect-[3/4]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white p-4">
              <h3 className="text-lg md:text-xl font-semibold text-center">{product.name}</h3>
              <p className="mt-1 md:mt-2 text-md md:text-lg">{product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
