"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { apiClient } from "@/lib/api/client";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "idle" | "loading" | "success" | "error">(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await apiClient.post("/subscriptions", { email, source: "footer" });
      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error("Subscription error:", err);
      setStatus("error");
    }
  };

  return (
    <footer className="bg-[#1a1a1a] text-gray-300 mt-0 border-t-2 border-[var(--gold)]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">

        {/* Brand Column (Width: 4/12) */}
        <div className="md:col-span-4 flex flex-col items-start">
          <div className="relative w-48 h-16 mb-6 -ml-2">
            <Image
              src="/white_logo.png"
              alt="Urbanic Pitara"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm font-light leading-relaxed mb-8 max-w-sm text-gray-400">
            Curating timeless Indian elegance for the modern soul.
            Experience the finest craftsmanship and authentic designs.
          </p>

          {/* Minimalist Newsletter */}
          <div className="w-full max-w-sm">
            <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-3 font-semibold">Join our Newsletter</p>
            <form onSubmit={handleSubmit} className="relative border-b border-gray-600 focus-within:border-[var(--gold)] transition-colors duration-300">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent py-2 text-white placeholder-gray-500 focus:outline-none text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-xs uppercase tracking-widest hover:text-[var(--gold)] transition-colors"
              >
                Subscribe
              </button>
            </form>
            {status === "success" && <p className="text-xs text-[var(--gold)] mt-2">Welcome to the family.</p>}
            {status === "error" && <p className="text-xs text-red-400 mt-2">Something went wrong.</p>}
          </div>
        </div>

        {/* Links Spacer (Width: 1/12) */}
        <div className="hidden md:block md:col-span-1" />

        {/* Shop Links (Width: 2/12) */}
        <div className="md:col-span-2">
          <h3 className="text-white font-[family-name:var(--font-cinzel)] text-lg mb-6">Collections</h3>
          <ul className="space-y-4 text-sm font-light">
            <li><Link href="/collections/bridal" className="hover:text-[var(--gold)] transition-colors">Bridal Weaves</Link></li>
            <li><Link href="/collections/indo-western" className="hover:text-[var(--gold)] transition-colors">Indo-Western</Link></li>
            <li><Link href="/collections/traditionals" className="hover:text-[var(--gold)] transition-colors">Traditional</Link></li>
            <li><Link href="/customizer" className="hover:text-[var(--gold)] transition-colors">Custom Studio</Link></li>
          </ul>
        </div>

        {/* Info Links (Width: 2/12) */}
        <div className="md:col-span-2">
          <h3 className="text-white font-[family-name:var(--font-cinzel)] text-lg mb-6">Support</h3>
          <ul className="space-y-4 text-sm font-light">
            <li><Link href="/about" className="hover:text-[var(--gold)] transition-colors">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--gold)] transition-colors">Contact Us</Link></li>
            <li><Link href="/shipping" className="hover:text-[var(--gold)] transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/faq" className="hover:text-[var(--gold)] transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Social (Width: 3/12) */}
        <div className="md:col-span-3">
          <h3 className="text-white font-[family-name:var(--font-cinzel)] text-lg mb-6">Connect</h3>
          <div className="flex flex-col space-y-4 text-sm font-light">
            <a href="mailto:support@urbanicpitara.com" className="flex items-center gap-3 hover:text-[var(--gold)] transition-colors">
              <Mail size={16} className="text-[var(--gold)]" /> support@urbanicpitara.com
            </a>
            <div className="flex gap-4 mt-2">
              <Link href="https://www.instagram.com/urbanic_pitara" className="p-2 border border-gray-700 rounded-full hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all">
                <Instagram size={18} />
              </Link>
              <Link href="https://www.facebook.com/profile.php?id=61579619826981" className="p-2 border border-gray-700 rounded-full hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all">
                <Facebook size={18} />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Urbanic Pitara.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
