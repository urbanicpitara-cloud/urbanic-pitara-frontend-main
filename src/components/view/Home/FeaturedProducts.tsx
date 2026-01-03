// src/components/view/Home/FeaturedProducts.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Zap } from "lucide-react";

const featuredProducts = [
    {
        name: "Premium Branded Quality Kurtis Set",
        href: "/products/some-white-dress",
        image: "/premiumkurtiset.webp",
        price: 2499,
        originalPrice: 3999,
        category: "KURTI SET"
    },
    {
        name: "Women Printed Flared Anarkali Kurta with Pant Dupatta Suit Set",
        href: "/products/blue-dress",
        image: "/bluekurti.webp",
        price: 1799,
        originalPrice: 2999,
        category: "ANARKALI"
    },
    {
        name: "Elegant Embroidered Sharara Set with Dupatta",
        href: "/products/kurti",
        image: "/sharara.webp",
        price: 3399,
        originalPrice: 4999,
        category: "SHARARA"
    },
    {
        name: "Wedding Special Embroidery Work Top Sharara with Dupatta - Red",
        href: "/products/red-plazo",
        image: "/redfloraldress.webp",
        price: 4899,
        originalPrice: 6999,
        category: "WEDDING"
    }
];

const FeaturedProducts = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-8 max-w-7xl mx-auto">
            {featuredProducts.map((product) => {
                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

                return (
                    <div
                        key={product.name}
                        className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                        {/* Product Image */}
                        <Link href={product.href} className="relative block aspect-[3/4] overflow-hidden">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Category Badge */}
                            <div className="absolute top-3 left-3 bg-white shadow-sm px-3 py-1 rounded-full">
                                <span className="text-xs font-semibold text-gray-900 tracking-wide">{product.category}</span>
                            </div>

                            {/* Discount Badge */}
                            <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full">
                                <span className="text-xs font-bold">{discount}% OFF</span>
                            </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-4">
                            <Link href={product.href}>
                                <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-[var(--sage)] transition-colors">
                                    {product.name}
                                </h3>
                            </Link>

                            {/* Pricing */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                                <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FeaturedProducts;
