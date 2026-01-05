"use client";

import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// import Image from "next/image";

const testimonials = [
	{
		name: "Ayesha Verma",
		location: "Mumbai",
		text: "My wedding lehenga from Urbanic Pitara was pure perfection! Everyone complimented the intricate details.",
		image: "/avatars/ayesha.jpg", // Placeholder path
	},
	{
		name: "Ritika Singh",
		location: "Delhi",
		text: "The Indo-Western gown I bought was stunning. Premium quality and elegant design that feels truly unique.",
		image: "/avatars/ritika.jpg",
	},
	{
		name: "Sneha Kapoor",
		location: "Bangalore",
		text: "I loved the bridal collection – it fits perfectly and looks majestic! A truly seamless shopping experience.",
		image: "", // Fallback to icon
	},
	{
		name: "Mira Rajput",
		location: "Jaipur",
		text: "Authentic craftsmanship at its finest. The fabric quality blew me away. Highly recommended!",
		image: "",
	},
];

const Testimonials = () => {
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrent((prev) => (prev + 1) % testimonials.length);
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
	const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

	return (
		<div className="w-full relative">
			{/* Abstract Background Element - Reduced opacity */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)] opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

			<div className="max-w-4xl mx-auto relative z-10">
				<div className="relative bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 flex flex-col items-center text-center">

					{/* Avatar / Icon Container */}
					<div className="mb-6 relative">
						<div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-[var(--gold)]/20 p-1 flex items-center justify-center overflow-hidden shadow-inner">
							<div className="w-full h-full flex items-center justify-center bg-[var(--gold)]/10 text-[var(--gold)] font-serif text-2xl font-bold tracking-widest">
								{testimonials[current].name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.substring(0, 2)}
							</div>
						</div>
						{/* Small Quote Icon Badge */}
						<div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-gray-100">
							<Quote size={12} className="text-[var(--gold)] fill-current" />
						</div>
					</div>

					<div className="relative w-full min-h-[160px] flex items-center justify-center overflow-hidden">
						<AnimatePresence mode="wait">
							<motion.div
								key={current}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.4 }}
								className="absolute inset-0 flex flex-col items-center justify-center p-2"
							>
								{/* Stars */}
								<div className="flex gap-1 mb-4 text-[var(--gold)]">
									{[...Array(5)].map((_, i) => (
										<Star key={i} size={14} fill="currentColor" strokeWidth={0} />
									))}
								</div>

								<blockquote className="text-xl md:text-2xl font-[family-name:var(--font-cinzel)] text-gray-800 leading-relaxed mb-4">
									&ldquo;{testimonials[current].text}&rdquo;
								</blockquote>

								<cite className="not-italic">
									<span className="block text-sm font-bold text-gray-900 uppercase tracking-widest mb-1">
										{testimonials[current].name}
									</span>
									<span className="block text-xs text-gray-500 font-serif italic">
										— {testimonials[current].location}
									</span>
								</cite>
							</motion.div>
						</AnimatePresence>
					</div>

					{/* Controls */}
					<div className="flex gap-4 mt-6 z-20">
						<button onClick={prev} className="p-2 rounded-full border border-gray-200 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors" aria-label="Previous testimonial">
							<ChevronLeft size={20} />
						</button>
						<div className="flex gap-2 items-center">
							{testimonials.map((_, idx) => (
								<button
									key={idx}
									onClick={() => setCurrent(idx)}
									className={`w-2 h-2 rounded-full transition-all duration-300 ${current === idx ? "w-6 bg-[var(--gold)]" : "bg-gray-300 hover:bg-gray-400"}`}
									aria-label={`Go to testimonial ${idx + 1}`}
								/>
							))}
						</div>
						<button onClick={next} className="p-2 rounded-full border border-gray-200 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors" aria-label="Next testimonial">
							<ChevronRight size={20} />
						</button>
					</div>

				</div>
			</div>
		</div>
	);
};

export default Testimonials;
