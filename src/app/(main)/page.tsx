"use client";

import { motion, easeOut, useTransform, useViewportScroll } from "motion/react";
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

// ✅ AnimatedText Component (fixed TypeScript + centered layout)
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
        // staggerChildren: 0.03,
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
  const { scrollY } = useViewportScroll();

  const pinkParallax = useTransform(scrollY, [0, 500], [0, -50]);
  const yellowParallax = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <div className={`overflow-x-hidden scrollbar-hide relative bg-white ${geistMono.className}`}>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={fadeUpTransition}
        viewport={{ once: true }}
      >
        <Hero />
      </motion.div>

      {/* Decorative Split Section */}
      <section className="relative py-20 bg-gradient-to-r from-pink-50 via-white to-yellow-50 flex flex-col items-center text-center overflow-hidden">
        <motion.div
          style={{ y: pinkParallax }}
          className="absolute top-0 left-0 w-40 h-40 bg-pink-100 rounded-full opacity-10 -z-10"
        />
        <motion.div
          style={{ y: yellowParallax }}
          className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-100 rounded-full opacity-10 -z-10"
        />

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

      {/* Categories Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.1 }}
        viewport={{ once: true }}
        className="relative"
      >
        <motion.div
          style={{ y: pinkParallax }}
          className="absolute top-0 left-0 w-64 h-64 bg-pink-100 rounded-full opacity-20 -z-10"
        />
        <motion.div
          style={{ y: yellowParallax }}
          className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-100 rounded-full opacity-20 -z-10"
        />
        <Categories />
      </motion.div>

      {/* Decorative Section */}
      <section className="relative py-10 bg-gradient-to-r from-yellow-50 via-white to-pink-50 flex flex-col items-center text-center overflow-hidden">
        <motion.div
          style={{ y: pinkParallax }}
          className="absolute top-0 left-0 w-48 h-48 bg-pink-100 rounded-full opacity-10 -z-10"
        />
        <motion.div
          style={{ y: yellowParallax }}
          className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-100 rounded-full opacity-10 -z-10"
        />

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
        className="relative bg-gradient-to-tr from-pink-50 via-white to-pink-50"
      >
        <FeaturedProducts />
        <motion.div
          style={{ y: pinkParallax }}
          className="absolute top-10 right-10 w-32 h-32 bg-pink-100 rounded-full opacity-20 -z-10"
        />
        <motion.div
          style={{ y: yellowParallax }}
          className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-100 rounded-full opacity-20 -z-10"
        />
      </motion.div>

      {/* Angled Editorial Section */}
      <section className="relative py-10 bg-gray-50 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-pink-50 -skew-y-3 -z-10"></div>
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

      {/* Bridal Spotlight Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <BridalSpotlight />
      </motion.div>

      {/* Quote Banner */}
      <section className="relative py-20 bg-gradient-to-r from-pink-50 via-white to-yellow-50 flex flex-col items-center text-center overflow-hidden">
        <motion.div
          style={{ y: pinkParallax }}
          className="absolute top-10 left-1/4 w-40 h-40 bg-pink-100 rounded-full opacity-10 -z-10"
        />
        <motion.div
          style={{ y: yellowParallax }}
          className="absolute bottom-0 right-1/4 w-48 h-48 bg-yellow-100 rounded-full opacity-10 -z-10"
        />
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
        <motion.div
          style={{ y: yellowParallax }}
          className="absolute top-0 right-1/4 w-32 h-32 bg-yellow-100 rounded-full opacity-20 -z-10"
        />
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.5 }}
        viewport={{ once: true }}
        className="relative py-20 bg-gradient-to-t from-white via-pink-50 to-white"
      >
        <Testimonials />
        <motion.div
          style={{ y: pinkParallax }}
          className="absolute bottom-0 left-1/4 w-40 h-40 bg-pink-100 rounded-full opacity-20 -z-10"
        />
      </motion.div>
    </div>
  );
}
