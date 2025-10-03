// src/components/view/Home/BridalSpotlight.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const BridalSpotlight = () => {
  return (
    <section className="relative w-full h-[70vh] md:h-[90vh] my-16">
      <Image
        src="/bridal-spotlight.jpg" // Replace with hero bridal collection
        alt="Bridal Spotlight"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-white text-4xl md:text-5xl font-serif font-bold mb-4">
          The Royal Bridal Collection
        </h2>
        <p className="text-white text-lg md:text-xl mb-6 max-w-2xl">
          Experience exquisite craftsmanship and timeless elegance with our signature lehengas and bridal ensembles.
        </p>
        <Link
          href="/collections/bridal"
          className="bg-white text-black px-8 py-3 font-semibold rounded-lg hover:bg-gray-200 transition"
        >
          Explore Collection
        </Link>
      </div>
    </section>
  );
};

export default BridalSpotlight;
