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
import SectionHeader from "@/components/shared/SectionHeader";
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

      {/* Categories Section */}
      <section className="pt-12 md:pt-16 pb-4 bg-white">
        <SectionHeader
          title="Signature Collections"
          subtitle="Curated styles for every occasion"
          className="mb-8"
        />
        <Categories />
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-[#FDFBF7]">
        <SectionHeader
          title="Featured Collection"
          subtitle="Handpicked bestsellers just for you"
          className="mb-8"
        />
        <FeaturedProducts />
      </section>

      {/* Bridal Spotlight */}
      <section className="p-0 bg-white relative overflow-hidden">
        <BridalSpotlight />
      </section>

      {/* Quote Section */}
      <section className="py-16 flex flex-col items-center text-center bg-[#111] text-white px-4">
        <div className="w-10 h-10 text-[var(--gold)] mb-4 opacity-70">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21L14.017 18C14.017 16.0547 15.4375 15.125 16.7109 14.125C17.9844 13.125 19 12.0703 19 10C19 8.07031 17.4297 6.5 15.5 6.5C13.5703 6.5 12 8.07031 12 10V11H8V10C8 5.85938 11.3594 2.5 15.5 2.5C19.6406 2.5 23 5.85938 23 10C23 13.1016 21.1484 14.7344 19.5469 15.9844C18.2656 16.9844 17.0156 17.9609 17.0156 19V21H14.017ZM5 21L5 18C5 16.0547 6.42188 15.125 7.69531 14.125C8.96875 13.125 10 12.0703 10 10C10 8.07031 8.42969 6.5 6.5 6.5C4.57031 6.5 3 8.07031 3 10V11H-1V10C-1 5.85938 2.35938 2.5 6.5 2.5C10.6406 2.5 14 5.85938 14 10C14 13.1016 12.1484 14.7344 10.5469 15.9844C9.26562 16.9844 8.01562 17.9609 8.01562 19V21H5Z" />
          </svg>
        </div>
        <h3 className="text-xl md:text-3xl italic font-[family-name:var(--font-cinzel)] font-light max-w-4xl mx-auto leading-relaxed">
          &ldquo;Elegance is not about being noticed, it&apos;s about being remembered.&rdquo;
        </h3>
        <p className="mt-6 text-[var(--gold)] uppercase tracking-[0.2em] text-[10px] font-bold">— Giorgio Armani</p>
      </section>

      {/* New Arrivals */}
      <section className="py-12 md:py-16 bg-white">
        <SectionHeader title="New Arrivals" subtitle="Fresh from the ateliers" className="mb-8" />
        <NewArrivals />
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 bg-[#fafafa]">
        <SectionHeader
          title="Voices of Elegance"
          subtitle=" Stories from our cherished community"
          className="mb-8"
        />
        <Testimonials />
      </section>
    </div>
  );
}

