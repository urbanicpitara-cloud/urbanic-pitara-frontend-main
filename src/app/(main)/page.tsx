"use client";

import { motion, easeOut } from "motion/react";
import Hero from "@/components/view/Home/Hero";
import ServiceBar from "@/components/view/Home/ServiceBar";
import Categories from "@/components/view/Home/Categories";
import Marquee from "@/components/view/Home/Marquee";
import BridalSpotlight from "@/components/view/Home/BridalSpotlight";
import NewArrivals from "@/components/view/Home/NewArrivals";
import Testimonials from "@/components/view/Home/Testimonials";
import FeaturedProducts from "@/components/view/Home/FeaturedProducts";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"], weight: ["400", "600", "700"] });

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,  // Reduced from 0.8
      ease: easeOut,
    },
  },
};

// Update AnimatedText viewport settings
const AnimatedText = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.05,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut },
    },
  };

  return (
    <motion.h2
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}  // Changed from 0.5
      className={`inline-block text-center leading-snug ${geist.className} ${className}`}
    >
      {letters.map((char, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block align-middle"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h2>
  );
};

export default function HomePage() {
  return (
    <div className="theme-gold">
      {/* Hero Section */}
      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Hero />
      </motion.section>

      {/* Service Assurance Bar */}
      <ServiceBar />

      {/* Scrolling Marquee */}
      <Marquee />

      {/* Categories Section (includes Customizer CTA) */}
      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative py-12 md:py-20"
      >
        <div className="py-8 text-center relative z-10">
          <AnimatedText
            text="Discover Our Signature Collections"
            className="text-4xl md:text-6xl font-[family-name:var(--font-cinzel)] text-gray-900 mb-4 font-medium"
          />
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light italic font-[family-name:var(--font-geist-sans)]">
            Curated with passion and precision. Every piece tells a story of timeless elegance.
          </p>
        </div>
        <Categories />
      </motion.section>

      {/* Featured Products */}
      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-white py-8 md:py-4"
      >
        <div className="text-center mb-10">
          <AnimatedText
            text="Experience Luxury Like Never Before"
            className="text-3xl md:text-5xl font-[family-name:var(--font-cinzel)] text-gray-900 mb-4"
          />
          <div className="w-24 h-1 bg-[var(--gold)] mx-auto mt-4" />
        </div>
        <FeaturedProducts />
      </motion.section>

      {/* Bridal Spotlight with Parallax Watermark */}
      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative overflow-hidden"
      >
        {/* Parallax Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.03] w-full text-center">
          <h2 className="text-[12vw] md:text-[15vw] font-[family-name:var(--font-cinzel)] font-bold text-black uppercase leading-none tracking-widest whitespace-nowrap">
            Royal Edition
          </h2>
        </div>

        <div className="relative z-10 pb-12 md:pb-20">
          <div className="py-12 md:py-20 text-center bg-transparent">
            <AnimatedText
              text="Bridal Spotlight"
              className="text-4xl md:text-6xl font-[family-name:var(--font-cinzel)] text-gray-900 mb-4"
            />
            <p className="text-gray-500 max-w-2xl mx-auto mb-8 text-lg font-[family-name:var(--font-geist-sans)]">
              Highlighting the most exquisite bridal designs for the modern bride.
            </p>
          </div>
          <BridalSpotlight />
        </div>
      </motion.section>

      {/* Quote Section */}
      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative py-12 md:py-20 flex flex-col items-center text-center bg-white px-4"
      >
        <div className="w-12 h-12 text-[var(--gold)] mb-8 opacity-60">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21L14.017 18C14.017 16.0547 15.4375 15.125 16.7109 14.125C17.9844 13.125 19 12.0703 19 10C19 8.07031 17.4297 6.5 15.5 6.5C13.5703 6.5 12 8.07031 12 10V11H8V10C8 5.85938 11.3594 2.5 15.5 2.5C19.6406 2.5 23 5.85938 23 10C23 13.1016 21.1484 14.7344 19.5469 15.9844C18.2656 16.9844 17.0156 17.9609 17.0156 19V21H14.017ZM5 21L5 18C5 16.0547 6.42188 15.125 7.69531 14.125C8.96875 13.125 10 12.0703 10 10C10 8.07031 8.42969 6.5 6.5 6.5C4.57031 6.5 3 8.07031 3 10V11H-1V10C-1 5.85938 2.35938 2.5 6.5 2.5C10.6406 2.5 14 5.85938 14 10C14 13.1016 12.1484 14.7344 10.5469 15.9844C9.26562 16.9844 8.01562 17.9609 8.01562 19V21H5Z" />
          </svg>
        </div>
        <h3 className="text-3xl md:text-5xl italic text-gray-800 max-w-4xl mx-auto font-[family-name:var(--font-cinzel)] leading-normal">
          &ldquo;Elegance is not about being noticed, it&apos;s about being remembered.&rdquo;
        </h3>
        <p className="mt-8 text-[var(--gold)] uppercase tracking-[0.2em] text-xs font-bold">— Giorgio Armani</p>
      </motion.section>

      {/* New Arrivals */}
      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <NewArrivals />
      </motion.section>

      {/* Testimonials */}
      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Testimonials />
      </motion.section>
    </div>
  );
}
