"use client";

import React from "react";
import { motion } from "motion/react";
import { Truck, Sparkles, Scissors, ShieldCheck } from "lucide-react";

const features = [
    {
        icon: Sparkles,
        title: "Authentic Handwork",
        description: "Crafted by master artisans"
    },
    {
        icon: Scissors,
        title: "Custom Tailoring",
        description: "Made to your exact measurements"
    },
    {
        icon: Truck,
        title: "Worldwide Shipping",
        description: "Express delivery globally"
    },
    {
        icon: ShieldCheck,
        title: "Quality Guarantee",
        description: "Certified premium fabrics"
    }
];

const ServiceBar = () => {
    return (
        <section className="bg-white border-b border-gray-100 py-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className="flex flex-col items-center text-center gap-3 group"
                        >
                            <div className="p-3 rounded-full bg-gray-50 text-[var(--gold)] mb-1 transition-colors group-hover:bg-[var(--gold)] group-hover:text-white">
                                <feature.icon strokeWidth={1.5} size={24} />
                            </div>
                            <div>
                                <h4 className="font-[family-name:var(--font-cinzel)] text-sm md:text-base font-semibold text-gray-900 mb-1 uppercase tracking-wide">
                                    {feature.title}
                                </h4>
                                <p className="text-xs text-gray-500 font-light">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServiceBar;
