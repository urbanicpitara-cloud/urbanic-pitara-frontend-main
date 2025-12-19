// app/terms/page.tsx
export default function TermsOfService() {
  return (
    <main className="max-w-6xl mx-auto px-8 py-32 text-jet leading-relaxed space-y-20">

      {/* Page Title */}
      <h1 className="text-6xl md:text-7xl font-serif font-extrabold text-center mb-12">
        Terms & Conditions
      </h1>

      {/* Business Identity */}
      <div className="text-center mb-16 text-lg md:text-xl text-gray-600 space-y-2">
        <p><strong>Urbanic Pitara</strong></p>
        <p>Registered Enterprise under Udyam Registration</p>
        <p>Udhyam-Uk: 05-0004488</p>
        <p>Registered Office: 84, Dehradun Neshvilla Road, Dehradun, Uttarakhand, India. Pincode - 248001</p>
      </div>

      {/* Intro */}
      <p className="text-2xl md:text-1xl text-gray-800">
        Welcome to <strong>Urbanic Pitara</strong>. By using our website and services, you agree
        to the following terms and conditions. Please read them carefully before proceeding with
        any purchase or interaction with our platform.
      </p>

      {/* Sections */}
      <section className="space-y-16">

        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 border-b-2 border-gold pb-3">
            1. Use of Website
          </h2>
          <p className="text-xl md:text-xl text-gray-700">
            You agree to access and use this website only for lawful purposes. Any fraudulent,
            harmful, or disruptive activities such as hacking, misrepresentation, or misuse of our
            services are strictly prohibited.
          </p>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 border-b-2 border-gold pb-3">
            2. Intellectual Property
          </h2>
          <p className="text-xl md:text-2xl text-gray-700">
            All content including images, text, logos, and designs are the property of Urbanic Pitara
            and are protected under copyright laws. Reproduction, redistribution, or misuse without
            prior written consent is prohibited.
          </p>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 border-b-2 border-gold pb-3">
            3. Orders & Pricing
          </h2>
          <p className="text-xl md:text-2xl text-gray-700">
            We strive to ensure that all product details, descriptions, and prices are accurate.
            However, errors may occur. In such cases, we reserve the right to correct errors, update
            prices, and cancel any order prior to shipment.
          </p>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 border-b-2 border-gold pb-3">
            4. Limitation of Liability
          </h2>
          <p className="text-xl md:text-2xl text-gray-700">
            Urbanic Pitara shall not be held liable for any indirect, incidental, or consequential
            damages resulting from the use or inability to use our services.
          </p>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 border-b-2 border-gold pb-3">
            5. Governing Law
          </h2>
          <p className="text-xl md:text-2xl text-gray-700">
            These terms are governed by the laws of India. Any disputes will be subject to the
            jurisdiction of courts in Dehradun, Uttarakhand.
          </p>
        </div>

      </section>

    </main>
  );
}
