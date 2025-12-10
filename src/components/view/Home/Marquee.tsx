"use client";

import React from "react";
import { motion } from "motion/react";

const Marquee = () => {
    return (
        <div className="relative w-full overflow-hidden bg-[var(--gold)] text-white py-4 md:py-6 border-y-4 border-double border-white/20">
            <div className="flex whitespace-nowrap">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: 0 }}
                        animate={{ x: "-100%" }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="flex items-center gap-12 px-6"
                    >
                        <span className="text-3xl md:text-5xl font-[family-name:var(--font-cinzel)] font-bold tracking-widest uppercase opacity-90">
                            Urbanic Pitara
                        </span>
                        <span className="text-3xl md:text-5xl font-mono opacity-50">✦</span>
                        <span className="text-3xl md:text-5xl font-[family-name:var(--font-cinzel)] font-bold tracking-widest uppercase opacity-90">
                            Handcrafted Luxury
                        </span>
                        <span className="text-3xl md:text-5xl font-mono opacity-50">✦</span>
                        <span className="text-3xl md:text-5xl font-[family-name:var(--font-cinzel)] font-bold tracking-widest uppercase opacity-90">
                            Worldwide Shipping
                        </span>
                        <span className="text-3xl md:text-5xl font-mono opacity-50">✦</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Marquee;
