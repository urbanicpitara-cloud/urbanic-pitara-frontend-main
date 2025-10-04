import React from "react";

const faqs = [
  {
    q: "How do I register?",
    a: `Click on the “Log In / Sign Up” option and register using your mobile number or email. You can also sign in with your Google account for faster access.`,
  },
  {
    q: "What are the benefits of registering?",
    a: `Registered members can track orders, save shipping details for faster checkout, and receive early updates on new collections and offers.`,
  },
  {
    q: "Do I need to register to shop, or can I checkout as a guest?",
    a: `Yes you need to register to checkout. But you can still add items to the cart. Registering makes future purchases faster and lets you view order history.`,
  },
  {
    q: "Can I edit my personal information?",
    a: `Yes — after logging in, visit the ‘Profile’ page to update your details.`,
  },
  {
    q: "I forgot my password, how do I reset it?",
    a: `Click ‘Forgot Password’ on the login page and follow the secure link we send to your email to reset your password.`,
  },
  {
    q: "How can I contact your support team?",
    a: `Email us at support@urbanicpitara.com or whatsApp/call: +91-9639798848 between 10:00 AM–7:00 PM (Mon–Sat). We usually respond within 24 hours on business days.`,
  },
  {
    q: "What are the shipping charges?",
    a: `Shipping charges vary by location and order value. Final shipping costs are shown at checkout.`,
  },
  {
    q: "How long will my order take to arrive?",
    a: `Orders are typically delivered within 3–7 business days depending on your location.`,
  },
  {
    q: "Can I change my shipping address after placing the order?",
    a: `You can update the shipping address before the order is shipped. Contact our support team as soon as possible to request a change.`,
  },
  {
    q: "Is there a limit to how many items I can order?",
    a: `No — there is no limit on the number of items you can order.`,
  },
  {
    q: "What should I do if I receive a damaged or wrong product?",
    a: `Contact support within 48 hours of delivery. We’ll arrange a return or replacement and guide you through the process.`,
  },
  {
    q: "Can I cancel my order?",
    a: `You can cancel an order before it is shipped by contacting our support team. Orders that have already shipped cannot be cancelled.`,
  },
  {
    q: "What is your return policy?",
    a: `Returns are accepted within 7 days of delivery for items that are unused, unwashed and with original tags and packaging. Some exclusions apply (e.g., accessories, jewelry, discounted items).`,
  },
  {
    q: "How do I request a return or exchange?",
    a: `Go to ‘My Orders’, select the order and choose ‘Return/Exchange’, or contact support and we’ll assist you with the process.`,
  },
  {
    q: "Do you provide reverse pick-up?",
    a: `Yes — we provide free reverse pick-up for most pin codes in India for eligible returns.`,
  },
  {
    q: "How long will it take to get my refund?",
    a: `Refunds are processed within 5–7 working days after we receive and inspect the returned item.`,
  },
  {
    q: "What payment methods do you accept?",
    a: `We accept major debit/credit cards, UPI, net banking and popular wallets.`,
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: `COD is available for select pin codes in India. Enter your PIN at checkout to confirm eligibility.`,
  },
  {
    q: "Is shopping on your website safe?",
    a: `Yes — payments are processed securely with encrypted gateways and we do not store card details on our servers.`,
  },
  {
    q: "My transaction failed but money was deducted, what should I do?",
    a: `Transaction reversals typically happen automatically within a few days. If the amount is not reversed, contact support with payment details and we’ll help resolve it.`,
  },
];

export default function FAQ() {
  return (
    <section className="max-w-4xl mx-auto p-6 md:p-10">
      <h2 className="text-3xl font-semibold mb-4">Frequently Asked Questions</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Got a question? We’ve probably answered it below. If not, contact our support team.
      </p>

      <div className="space-y-3">
        {faqs.map((item, idx) => (
          <details
            key={idx}
            className="group border border-gray-200 rounded-lg p-4 open:shadow-sm"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-base font-medium">{item.q}</span>
              <svg
                className="w-5 h-5 ml-3 text-gray-500 transition-transform duration-200 group-open:rotate-45"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 5v10M5 10h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>

            <div className="mt-3 text-sm text-gray-700 leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
