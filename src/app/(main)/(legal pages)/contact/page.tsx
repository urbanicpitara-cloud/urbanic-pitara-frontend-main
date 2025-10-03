export default function ContactPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12 leading-relaxed">
      <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
        We’d love to hear from you! Whether you have a question about your order, our products,
        or just want to share feedback — the <strong>Urbanic Pitara</strong> team is here to help.
      </p>

      {/* Contact Methods */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Customer Support</h2>
          <p className="text-gray-600 mb-1">Email: support@urbanicpitara.com</p>
          <p className="text-gray-600 mb-1">Phone: +91-XXXXXXXXXX</p>
          <p className="text-gray-600 text-sm">Mon – Sat, 10:00 AM – 6:00 PM (IST)</p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Business Address</h2>
          <p className="text-gray-600">
            Urbanic Pitara <br />
            [Your Full Address Here] <br />
            India
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Legal & Policies</h2>
          <p className="text-gray-600">
            For concerns related to Terms of Service, Privacy, or Refunds, please contact us at:{" "}
            <strong>legal@urbanicpitara.com</strong>
          </p>
        </div>
      </section>

      {/* Quick Help */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Quick Help</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Check our <a href="/faq" className="text-blue-600 hover:underline">FAQ section</a> for common queries.</li>
          <li>Track your order in <a href="/orders" className="text-blue-600 hover:underline">My Account</a>.</li>
          <li>Review our <a href="/returns" className="text-blue-600 hover:underline">Returns & Refunds Policy</a>.</li>
        </ul>
      </section>

      {/* Contact Form Placeholder */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Your Name"
            className="p-3 border rounded-md"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            className="p-3 border rounded-md"
            required
          />
          <textarea
            placeholder="Your Message"
            rows={5}
            className="p-3 border rounded-md md:col-span-2"
            required
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition md:col-span-2"
          >
            Submit
          </button>
        </form>
      </section>
    </main>
  );
}
