"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

interface HeroProps {
  images?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    fallback: string;
  };
}

const Hero: React.FC<HeroProps> = ({
  images = {
    fallback: "/34.jpg", // default image if no props are passed
    mobile: "/12.jpg",
    desktop: "/34.jpg",
    // tablet: "/34.jpg",
  },
}) => {
  // Ensure fallback image exists
  const fallback = images.fallback;

  const sources = {
    mobile: images.mobile || fallback,
    tablet: images.tablet || images.mobile || fallback,
    desktop: images.desktop || images.tablet || images.mobile || fallback,
  };

  return (
    <section className="relative w-full h-[90vh] md:h-[100dvh] overflow-hidden">
      {/* Responsive background image */}
      <div className="absolute inset-0">
        <picture>
          <source media="(min-width: 1024px)" srcSet={sources.desktop} />
          <source media="(min-width: 640px)" srcSet={sources.tablet} />
          <Image
            src={sources.mobile}
            alt="Bridal Collection"
            fill
            priority
            className="object-cover transition-transform duration-[20s] ease-linear scale-100 hover:scale-110 will-change-transform"
          />
        </picture>
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 flex flex-col items-center justify-center text-center px-4 md:px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center max-w-5xl"
        >
          {/* Decorative Top Element */}


          <h1 className={`text-white text-6xl md:text-8xl lg:text-9xl font-medium mb-8 leading-tight uppercase tracking-wider drop-shadow-2xl font-samarkan`}>
            Urbanic Pitara
          </h1>

          <p className="text-white text-xl md:text-3xl mb-12 max-w-3xl font-light tracking-wide drop-shadow-lg leading-relaxed">
            Where Tradition Meets Elegance <br />
            <span className="text-[var(--gold)] italic font-serif mt-2 block text-2xl md:text-4xl">Curated Designer Collections</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link
              href="/search?q=bridal"
              className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-5 font-semibold rounded-none shadow-2xl transition-all hover:bg-white hover:text-black hover:border-white"
            >
              <span className="relative z-10 uppercase tracking-widest text-sm">Explore Bridal</span>
            </Link>

            <Link
              href="/customizer"
              className="group relative overflow-hidden bg-[var(--gold)] text-white px-10 py-5 font-semibold rounded-none shadow-2xl transition-all hover:bg-[#b8860b]"
            >
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-widest text-sm">
                Design Your Own
              </span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
};

export default Hero;
