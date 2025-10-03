// src/components/view/Home/Hero.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative w-full h-[90vh] md:h-[100vh] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero-bridal.jpg" // Replace with your premium bridal image
        alt="Bridal Collection"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 flex flex-col items-center justify-center text-center px-6">
        {/* Accent Line */}
        <div className="w-24 h-1 bg-gold mb-6 rounded-full"></div>

        {/* Title */}
        <h1 className="text-white text-5xl md:text-7xl font-serif font-extrabold mb-4 leading-tight uppercase tracking-wide">
          Urbanic Pitara
        </h1>

        {/* Subtitle */}
        <p className="text-white text-lg md:text-2xl mb-8 max-w-xl">
          Where Tradition Meets Elegance – Curated Designer Collections for Every Occasion
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/collections/bridal"
            className="bg-white text-black px-10 py-4 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition transform hover:scale-105"
          >
            Explore Bridal Collection
          </Link>
          <Link
            href="/collections/all"
            className="border border-white text-white px-10 py-4 font-semibold rounded-lg hover:bg-white hover:text-black transition transform hover:scale-105"
          >
            View All Collections
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
