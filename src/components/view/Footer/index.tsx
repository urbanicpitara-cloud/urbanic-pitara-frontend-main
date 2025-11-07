"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-jet text-platinum mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-12">

        {/* Brand */}
        <div className="md:col-span-2">
          {/* <h2 className="text-3xl font-bold mb-4 text-white">
            Urbanic <span className="text-caribbean-current">Pitara</span>
          </h2> */}
          <div className="relative w-[15rem] h-[7rem]">
            <Image
              src="/white_logo.png"
              alt="Urbanic Pitara"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm leading-relaxed mb-6">
            Discover premium fashion with elegance. Handpicked collections curated to
            match your unique lifestyle and occasions.
          </p>
          {/* Newsletter */}
          <form className="flex items-center bg-white rounded-lg overflow-hidden w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 flex-grow text-black outline-none"
            />
            <button
              type="submit"
              className="bg-caribbean-current text-white px-4 py-2 hover:bg-opacity-90 transition"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/collections/bridal" className="hover:text-caribbean-current">Bridal</Link></li>
            <li><Link href="/collections/indo-western" className="hover:text-caribbean-current">Indo-Western</Link></li>
            <li><Link href="/collections/traditionals" className="hover:text-caribbean-current">Traditional</Link></li>
            <li><Link href="/collections/t-shirts" className="hover:text-caribbean-current">T-Shirts</Link></li>
          </ul>
        </div>

        {/* Info Links */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Information</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-caribbean-current">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-caribbean-current">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-caribbean-current">FAQs</Link></li>
            <li><Link href="/shipping" className="hover:text-caribbean-current">Shipping & Returns</Link></li>
          </ul>
        </div>

        {/* Social / Extras */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Connect</h3>
          <div className="flex flex-col space-y-3 text-sm">
            <a
              href="mailto:urbanicpitara@gmail.com"
              className="flex items-center gap-2 hover:text-caribbean-current"
            >
              <Mail size={16} /> support@urbanicpitara.com
            </a>

            <Link
              href="https://www.instagram.com/urbanic_pitara"
              className="flex items-center gap-2 hover:text-caribbean-current"
            >
              <Instagram size={16} /> Instagram
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=61579619826981"
              className="flex items-center gap-2 hover:text-caribbean-current"
            >
              <Facebook size={16} /> Facebook
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-platinum/20 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-platinum">
          <p>© {new Date().getFullYear()} Urbanic Pitara. All rights reserved.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <Link href="/privacy" className="hover:text-caribbean-current">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-caribbean-current">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
