"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";

const BridalSpotlight = () => {
  return (
    <section className="relative w-full h-[85vh] md:h-screen overflow-hidden group">
      {/* Background Image with Slow Zoom Effect */}
      <div className="absolute inset-0">
        <Image
          src="/bridal-spotlight.jpg"
          alt="Bridal Spotlight"
          fill
          className="object-cover object-center transition-transform duration-[20s] ease-linear group-hover:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10 max-w-5xl mx-auto">

        <div className="overflow-hidden mb-6">
          <span className="inline-block text-white/90 text-sm md:text-base font-medium tracking-[0.3em] uppercase border-b border-[var(--gold)] pb-2">
            The Wedding Edit 2026
          </span>
        </div>

        <h2 className="text-white text-5xl md:text-8xl font-[family-name:var(--font-cinzel)] font-normal mb-8 leading-[0.9] drop-shadow-lg">
          Royal <span className="italic font-serif text-[var(--gold)]">Opulence</span>
        </h2>

        <p className="text-gray-200 text-lg md:text-2xl mb-12 max-w-2xl font-light leading-relaxed font-[family-name:var(--font-geist-sans)] tracking-wide">
          Handcrafted masterpieces designed to make your special day truly unforgettable.
        </p>

        <Link
          href="/collections/bridal"
          className="group/btn relative inline-flex items-center gap-4 px-12 py-4 border border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-black hover:border-white transition-all duration-500 rounded-none"
        >
          <span className="uppercase tracking-[0.2em] text-sm font-semibold">Explore The Collection</span>
          <MoveRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-2" />
        </Link>
      </div>
    </section>
  );
};

export default BridalSpotlight;
