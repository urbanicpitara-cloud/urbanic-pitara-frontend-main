// src/components/view/Home/Newsletter.tsx
"use client";

import React, { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the subscription logic here
    console.log("Subscribed with email:", email);
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-gray-100">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
        <p className="text-lg md:text-xl mb-6">
          Subscribe to our newsletter for the latest collections, exclusive offers, and more.
        </p>
        <form onSubmit={handleSubmit} className="flex justify-center items-center space-x-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-4 py-2 w-72 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
