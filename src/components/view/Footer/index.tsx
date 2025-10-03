import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-jet text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Urbanic <span className="text-caribbean-current">Pitara</span>
          </h2>
          <p className="text-sm text-platinum">
            Discover premium fashion with elegance. Handpicked collections to match your lifestyle.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="font-semibold mb-4">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/collections/bridal" className="hover:text-caribbean-current transition-colors">
                Bridal
              </Link>
            </li>
            <li>
              <Link href="/collections/indo-western" className="hover:text-caribbean-current transition-colors">
                Indo-Western
              </Link>
            </li>
            <li>
              <Link href="/collections/traditional" className="hover:text-caribbean-current transition-colors">
                Traditional
              </Link>
            </li>
            <li>
              <Link href="/collections/t-shirts" className="hover:text-caribbean-current transition-colors">
                T-Shirts
              </Link>
            </li>
          </ul>
        </div>

        {/* Info Links */}
        <div>
          <h3 className="font-semibold mb-4">Information</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-caribbean-current transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-caribbean-current transition-colors">
                Email Us
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-caribbean-current transition-colors">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-caribbean-current transition-colors">
                Shipping & Returns
              </Link>
            </li>
          </ul>
        </div>

        {/* Social / Extras */}
        <div>
          <h3 className="font-semibold mb-4">Follow Us</h3>
          <div className="flex flex-col space-y-2 text-sm">
            <Link href="#" className="hover:text-caribbean-current transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-caribbean-current transition-colors">Facebook</Link>
            <Link href="#" className="hover:text-caribbean-current transition-colors">Pinterest</Link>
            <Link href="#" className="hover:text-caribbean-current transition-colors">Twitter</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-platinum/20 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-platinum">
          <p>© {new Date().getFullYear()} Urbanic Pitara. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:text-caribbean-current">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-caribbean-current">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
