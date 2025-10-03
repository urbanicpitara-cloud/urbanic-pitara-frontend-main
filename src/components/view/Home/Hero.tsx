// src/components/view/Home/Hero.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative w-full h-[90vh] md:h-[100vh]">
      <Image
        src="/hero-bridal.jpg" // Replace with premium bridal image
        alt="Bridal Collection"
        fill
        className=" object-center"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-white text-5xl md:text-6xl font-serif font-bold mb-4 leading-tight">
          Urbanic Pitara
        </h1>
        <p className="text-white text-lg md:text-2xl mb-6">
          Where Tradition Meets Elegance
        </p>
        <Link
          href="/collections/bridal"
          className="bg-white text-black px-8 py-3 md:px-10 md:py-4 font-semibold rounded-lg hover:bg-gray-200 transition"
        >
          Explore Bridal Collection
        </Link>
      </div>
    </section>
  );
};

export default Hero;
