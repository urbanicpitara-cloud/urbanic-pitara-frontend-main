"use client";

import { motion, easeOut } from "motion/react";
import Hero from '@/components/view/Home/Hero';
import Categories from '@/components/view/Home/Categories';
import BridalSpotlight from '@/components/view/Home/BridalSpotlight';
import NewArrivals from '@/components/view/Home/NewArrivals';
import Testimonials from '@/components/view/Home/Testimonials';
import FeaturedProducts from '@/components/view/Home/FeaturedProducts';

const fadeUpTransition = { duration: 0.6, ease: easeOut };

export default function HomePage() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={fadeUpTransition}
        viewport={{ once: true }}
      >
        <Hero />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <Categories />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <FeaturedProducts />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <BridalSpotlight />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <NewArrivals />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ...fadeUpTransition, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <Testimonials />
      </motion.div>
    </>
  );
}
