// src/app/(main)/page.tsx
import Hero from '@/components/view/Home/Hero';
import Categories from '@/components/view/Home/Categories';
import BridalSpotlight from '@/components/view/Home/BridalSpotlight';
import NewArrivals from '@/components/view/Home/NewArrivals';
import Testimonials from '@/components/view/Home/Testimonials';
import FeaturedProducts from '@/components/view/Home/FeaturedProducts';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <BridalSpotlight />
      <NewArrivals />
      <Testimonials />
    </>
  );
}
