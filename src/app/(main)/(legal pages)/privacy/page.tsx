// Full static generation - no revalidation needed
export const dynamic = 'force-static';

export default function PrivacyPolicy() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 leading-relaxed">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        At <strong>Urbanic Pitara</strong>, we value your privacy. This policy explains how we
        collect, use, and safeguard your personal data when you interact with our website and
        services.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>Personal details such as name, phone number, email, and shipping address.</li>
        <li>Payment information for order processing (not stored on our servers).</li>
        <li>Browsing data like IP address and device information for analytics and security.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
      <p>
        We use your data to process orders, provide customer support, send order updates, and
        share promotional content if you have opted in.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">3. Data Protection</h2>
      <p>
        Your personal information is protected with secure servers and encryption practices.
        Sensitive information such as payment details are handled only through trusted third-party
        providers.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">4. Sharing with Third Parties</h2>
      <p>
        We do not sell your personal data. Information is only shared with trusted partners like
        delivery providers and payment processors for the purpose of fulfilling your orders.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">5. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by contacting
        our support team.
      </p>
    </main>
  );
}
