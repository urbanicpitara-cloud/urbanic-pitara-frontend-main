"use client";

import { motion, easeOut } from "motion/react";
import Hero from "@/components/view/Home/Hero";
import Categories from "@/components/view/Home/Categories";
import BridalSpotlight from "@/components/view/Home/BridalSpotlight";
import NewArrivals from "@/components/view/Home/NewArrivals";
import Testimonials from "@/components/view/Home/Testimonials";
import FeaturedProducts from "@/components/view/Home/FeaturedProducts";
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], weight: ["400", "600", "700"] });
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500", "700"] });

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
    <main
      className={`relative bg-white overflow-x-hidden ${geistMono.className}`}
    >
      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Hero />
      </motion.section>

      {/* Keep motion.section for main sections only */}
      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative py-20 flex flex-col items-center text-center bg-white"
      >
        <AnimatedText
          text="Discover Our Signature Collections"
          className="text-4xl md:text-5xl font-bold text-gray-700 mb-4"
        />
        {/* Regular p tag instead of motion.p */}
        <p className="text-gray-500 max-w-xl mx-auto">
          Curated with passion and precision. Every piece tells a story of timeless elegance.
        </p>
      </motion.section>

      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-white"
      >
        <Categories />
      </motion.section>

      {/* Regular section instead of motion.section */}
      <section className="relative py-10 flex flex-col items-center text-center bg-white">
        <AnimatedText
          text="Experience Luxury Like Never Before"
          className="text-3xl md:text-5xl font-semibold text-gray-700 mb-4"
        />
        <p className="text-gray-500 max-w-2xl mx-auto">
          Every collection, every product, curated to perfection for those who desire elegance.
        </p>
      </section>

      <motion.section
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative bg-white"
      >
        <FeaturedProducts />
      </motion.section>

      {/* Regular sections for the rest */}
      <section className="relative py-10 flex flex-col items-center text-center">
        <AnimatedText
          text="Bridal Spotlight"
          className="text-4xl md:text-5xl font-semibold text-gray-700 mb-4"
        />
        <p className="text-gray-500 max-w-2xl mx-auto mb-8">
          Highlighting the most exquisite bridal designs for the modern bride.
        </p>
      </section>

      <div className="relative">
        <BridalSpotlight />
      </div>

      <motion.section variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} className="relative py-20 flex flex-col items-center text-center bg-white">
        <h3 className="text-3xl md:text-6xl italic text-gray-700 max-w-6xl mx-auto font-sans">
          Elegance is not about being noticed, it&apos;s about being remembered.
        </h3>
      </motion.section>

      <motion.section variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} className="relative">
        <NewArrivals />
      </motion.section>

      <div className="relative py-20 bg-white">
        <Testimonials />
      </div>
    </main>
  );
}
