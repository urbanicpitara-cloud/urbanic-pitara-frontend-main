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

const fadeUpTransition = { duration: 0.6, ease: easeOut };

// ✅ AnimatedText Component (simple text animation only)
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
      viewport={{ once: true, amount: 0.5 }}
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
    <div
      className={`overflow-x-hidden scrollbar-hide relative bg-white ${geistMono.className}`}
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={fadeUpTransition}
        viewport={{ once: true }}
      >
        <Hero />
      </motion.div>

      {/* Section 1 */}
      <section className="relative py-20 flex flex-col items-center text-center bg-white">
        <AnimatedText
          text="Discover Our Signature Collections"
          className="text-4xl md:text-5xl font-bold text-gray-700 mb-4"
        />
        <motion.p
          className="text-gray-500 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Curated with passion and precision. Every piece tells a story of timeless elegance.
        </motion.p>
      </section>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <Categories />
      </motion.div>

      {/* Section 2 */}
      <section className="relative py-10 flex flex-col items-center text-center bg-white">
        <AnimatedText
          text="Experience Luxury Like Never Before"
          className="text-3xl md:text-5xl font-semibold text-gray-700 mb-4"
        />
        <motion.p
          className="text-gray-500 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Every collection, every product, curated to perfection for those who desire elegance.
        </motion.p>
      </section>

      {/* Featured Products */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.2 }}
        viewport={{ once: true }}
        className="relative bg-white"
      >
        <FeaturedProducts />
      </motion.div>

      {/* Bridal Spotlight Intro */}
      <section className="relative py-10 flex flex-col items-center text-center">
        <AnimatedText
          text="Bridal Spotlight"
          className="text-4xl md:text-5xl font-semibold text-gray-700 mb-4"
        />
        <motion.p
          className="text-gray-500 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Highlighting the most exquisite bridal designs for the modern bride.
        </motion.p>
      </section>

      {/* Bridal Spotlight */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <BridalSpotlight />
      </motion.div>

      {/* Quote Banner */}
      <section className="relative py-20 flex flex-col items-center text-center bg-white">
        <motion.h3
          className="text-3xl md:text-6xl italic text-gray-700 max-w-6xl mx-auto font-sans"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Elegance is not about being noticed, it&apos;s about being remembered.
        </motion.h3>
      </section>

      {/* New Arrivals */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.4 }}
        viewport={{ once: true }}
        className="relative"
      >
        <NewArrivals />
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.5 }}
        viewport={{ once: true }}
        className="relative py-20 bg-white"
      >
        <Testimonials />
      </motion.div>
    </div>
  );
}
