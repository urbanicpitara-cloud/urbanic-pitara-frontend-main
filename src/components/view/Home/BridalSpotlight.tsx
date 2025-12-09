// src/components/view/Home/BridalSpotlight.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const BridalSpotlight = () => {
  return (
    <section className="relative w-full h-[80vh] md:h-screen">
      {/* Parallax Background */}
      <div className="absolute inset-0">
        <Image
          src="/bridal-spotlight.jpg"
          alt="Bridal Spotlight"
          fill
          className="object-cover object-center will-change-transform"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10">
        <span className="text-white text-lg font-medium tracking-[0.2em] uppercase mb-4">
          Signature Collection
        </span>

        <h2 className="text-white text-5xl md:text-7xl font-serif font-medium mb-6 max-w-4xl leading-tight">
          The Royal Bridal Edit
        </h2>

        <p className="text-white text-lg md:text-xl mb-10 max-w-2xl font-light leading-relaxed">
          Experience exquisite craftsmanship and timeless elegance with our signature lehengas and bridal ensembles.
        </p>

        <Link
          href="/collections/bridal"
          className="group relative overflow-hidden bg-white text-black px-10 py-4 font-semibold rounded-full shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">Explore Collection</span>
          <div className="absolute inset-0 bg-[var(--gold)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          <span className="absolute inset-0 z-10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Explore Collection
          </span>
        </Link>
      </div>
    </section>
  );
};

export default BridalSpotlight;
