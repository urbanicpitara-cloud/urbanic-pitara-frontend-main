// src/components/view/Home/Lifestyle.tsx
"use client";

import React from "react";
import Image from "next/image";

const lifestyleImages = [
  "/lifestyle1.jpg",
  "/lifestyle2.jpg",
  "/lifestyle3.jpg",
];

const Lifestyle = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-white">
      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">
        Lifestyle & Editorial
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lifestyleImages.map((img, idx) => (
          <div key={idx} className="relative rounded-lg overflow-hidden group">
            <Image
              src={img}
              alt={`Lifestyle ${idx + 1}`}
              width={500}
              height={600}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Lifestyle;
