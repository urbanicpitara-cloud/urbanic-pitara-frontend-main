import Link from "next/link";

// app/contact/page.tsx

// Full static generation - no revalidation needed
export const dynamic = 'force-static';

export default function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-8 py-32 space-y-32 text-jet">

      {/* Page Title */}
      <h1 className="text-6xl md:text-7xl font-serif font-extrabold text-center mb-6">
        Contact Us
      </h1>

      {/* Intro */}
      <p className="text-center text-gray-600 text-2xl md:text-3xl max-w-4xl mx-auto">
        We’d love to hear from you! Whether you have a question about your order, our products,
        or just want to share feedback — the <strong>Urbanic Pitara</strong> team is here to help.
      </p>

      {/* Contact Methods */}
      <section className="space-y-16 md:space-y-0 md:flex md:justify-between md:gap-10">
        {/* Customer Support */}
        <div className="flex-1 p-10 bg-white border rounded-2xl shadow-2xl hover:shadow-3xl transition">
          <h2 className="text-3xl font-semibold mb-5">Customer Support</h2>
          <p className="text-gray-700 mb-2">
            Email: <strong>support@urbanicpitara.com</strong>
          </p>
          <p className="text-gray-700 mb-2">
            WhatsApp / Call: <strong>+91-9927775655</strong>
          </p>
          <p className="text-gray-600 text-sm">
            Mon – Sat, 10:00 AM – 7:00 PM (IST). We usually respond within 24 hours on business days.
          </p>
        </div>

        {/* Registered Office */}
        <div className="flex-1 p-10 bg-white border rounded-2xl shadow-2xl hover:shadow-3xl transition">
          <h2 className="text-3xl font-semibold mb-5">Registered Office</h2>
          <p className="text-gray-700">
            Urbanic Pitara <br />
            84, Dehradun Neshvilla Road <br />
            Dehradun, Uttarakhand, India. Pincode - 248001
          </p>
        </div>
      </section>

      {/* Quick Help */}
      <section className="relative py-20 px-12 bg-gradient-to-r from-beige/80 to-beige/60 rounded-3xl shadow-xl">
        <h2 className="text-4xl font-semibold mb-8 text-center">Quick Help</h2>
        <ul className="list-disc list-inside space-y-4 text-gray-700 text-xl max-w-3xl mx-auto">
          <li>
            Check our <Link href="/faq" className="text-blue-600 hover:underline">FAQ section</Link> for common queries.
          </li>
          <li>
            Track your order in <Link href="/orders" className="text-blue-600 hover:underline">My Account</Link>.
          </li>
          <li>
            Review our <Link href="/returns" className="text-blue-600 hover:underline">Returns & Refunds Policy</Link>.
          </li>
        </ul>
      </section>

      {/* Contact Form */}
      <section className="space-y-12">
        <h2 className="text-4xl md:text-5xl font-semibold text-center mb-8">Send Us a Message</h2>
        <form className="space-y-6 max-w-3xl mx-auto bg-white p-12 rounded-3xl shadow-2xl">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-5 border rounded-xl focus:ring-2 focus:ring-gold focus:outline-none text-lg"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-5 border rounded-xl focus:ring-2 focus:ring-gold focus:outline-none text-lg"
            required
          />
          <textarea
            placeholder="Your Message"
            rows={6}
            className="w-full p-5 border rounded-xl focus:ring-2 focus:ring-gold focus:outline-none text-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-black text-white text-xl font-semibold px-6 py-5 rounded-xl hover:bg-gray-800 transition-transform transform hover:scale-105"
          >
            Submit
          </button>
        </form>
      </section>

    </main>
  );
}
