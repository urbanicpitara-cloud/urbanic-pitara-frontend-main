"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";

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
    fallback: "/34.jpg",
    mobile: "/12.jpg",
    desktop: "/34.jpg",
  },
}) => {
  const fallback = images.fallback;
  const sources = {
    mobile: images.mobile || fallback,
    tablet: images.tablet || images.mobile || fallback,
    desktop: images.desktop || images.tablet || images.mobile || fallback,
  };

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Cinematic Background with Slow Zoom and Parallax */}
      <motion.div
        style={{ y, scale: 1.1 }}
        animate={{ scale: 1.15 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
        className="absolute inset-0 z-0"
      >
        <picture>
          <source media="(min-width: 1024px)" srcSet={sources.desktop} />
          <source media="(min-width: 640px)" srcSet={sources.tablet} />
          <Image
            src={sources.mobile}
            alt="Royal Collection"
            fill
            priority
            className="object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </motion.div>

      {/* Content Overlay */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-6"
      >
        <div className="flex flex-col items-center max-w-6xl">

          {/* Brand Signature */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-white text-6xl md:text-8xl lg:text-[10rem] font-medium mb-2 leading-none tracking-tight font-samarkan drop-shadow-2xl">
              Urbanic Pitara
            </h1>
          </motion.div>

          {/* Elegant Divider */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
            className="h-px bg-[var(--gold)] mb-8 opacity-80"
          />

          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <p className="text-gray-100 text-lg md:text-2xl lg:text-3xl mb-12 max-w-2xl font-light tracking-widest uppercase font-[family-name:var(--font-cinzel)]">
              Where Tradition Meets <span className="text-[var(--gold)] font-semibold">Elegance</span>
            </p>
          </motion.div>

          {/* Dual CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link
              href="/products"
              className="px-8 py-3.5 bg-[var(--sage)] text-white font-medium text-sm tracking-widest uppercase transition-all duration-300 hover:bg-black hover:scale-105"
            >
              Shop Collection
            </Link>

            <Link
              href="/collections/bridal"
              className="px-8 py-3.5 bg-transparent border border-white/80 text-white hover:bg-white hover:text-black font-medium text-sm tracking-widest uppercase transition-all duration-300"
            >
              View Lookbook
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Elegant Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0 overflow-hidden">
          <div className="w-full h-1/2 bg-white/80 animate-scrolldown" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
