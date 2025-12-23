"use client";

import React from "react";
import { UserCircle2 } from "lucide-react"; // Lucide user icon
import Image from "next/image";

const testimonials = [
	{
		name: "Ayesha",
		text: "My wedding lehenga from Urbanic Pitara was pure perfection! Everyone complimented me.",
		image: "",
	},
	{
		name: "Ritika",
		text: "The Indo-Western gown I bought was stunning. Premium quality and elegant design.",
		image: "",
	},
	{
		name: "Sneha",
		text: "I loved the bridal collection – fits perfectly and looks majestic!",
		image: "", // No image provided
	},
];

const Testimonials = () => {
	return (
		<section className="py-24 px-4 md:px-8 bg-white relative overflow-hidden">
			{/* Decorative Background Elements */}
			<div className="absolute top-0 left-0 w-64 h-64 bg-[var(--gold)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
			<div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--gold)]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

			<div className="max-w-7xl mx-auto relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{testimonials.map((t, idx) => (
						<div
							key={idx}
							className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
						>
							<div className="flex items-center justify-center mb-6">
								{t.image ? (
									<Image
										src={t.image}
										alt={t.name}
										width={80}
										height={80}
										className="rounded-full object-cover border-4 border-gray-50"
									/>
								) : (
									<div className="w-20 h-20 flex items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
										<UserCircle2 className="w-10 h-10" />
									</div>
								)}
							</div>

							<div className="flex justify-center mb-4 text-[var(--gold)]">
								{[...Array(5)].map((_, i) => (
									<svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
							</div>

							<blockquote className="text-gray-600 text-center mb-6 italic leading-relaxed">
								&ldquo;{t.text}&rdquo;
							</blockquote>

							<div className="text-center">
								<h4 className="font-serif text-lg font-semibold text-gray-900">{t.name}</h4>
								<p className="text-sm text-gray-400 uppercase tracking-wider mt-1">Happy Customer</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Testimonials;
