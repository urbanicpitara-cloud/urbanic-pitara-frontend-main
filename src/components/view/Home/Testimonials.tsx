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
		<section className="py-16 px-4 md:px-8 bg-white text-gray-700">
			<h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">
				What Our Customers Say
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{testimonials.map((t, idx) => (
					<div
						key={idx}
						className="p-6 rounded-lg shadow-lg text-center"
					>
						{t.image ? (
							<Image
								src={t.image}
								alt={t.name}
								width={64}
								height={64}
								className="rounded-full mx-auto mb-4 object-cover"
							/>
						) : (
							<div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
								<UserCircle2 className="w-16 h-16 text-gray-400" />
							</div>
						)}
						<p className="text-gray-600">&ldquo;{t.text}&rdquo;</p>
						<h4 className="font-semibold">{t.name}</h4>
					</div>
				))}
			</div>
		</section>
	);
};

export default Testimonials;
