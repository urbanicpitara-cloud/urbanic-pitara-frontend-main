// src/components/view/Home/Editorial.tsx
"use client";

import React from "react";
import Image from "next/image";

const Editorial = () => {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh]">
      <Image
        src="/editorial-image.jpg" // replace with your lifestyle image
        alt="Brand Story"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-center text-white px-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
          <p className="text-lg md:text-xl">
            Discover the essence of our brand, where tradition meets modern elegance. Our collections are crafted with passion and precision, offering timeless pieces that resonate with the discerning individual.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Editorial;
