// app/about/page.tsx
import { url } from "inspector";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="bg-white text-jet">

      {/* Hero Section */}
      <section className="relative h-[80vh] w-full">
        <Image
          src="/images/about-hero.jpg" // replace with your hero image
          alt="Urbanic Pitara Story"
          fill
          className="object-cover"
        />
        <div style={{
          backgroundImage: 'url("/shoot2.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center px-6">
          <div className="relative px-10 pt-2 pb-5">
      {/* Dark and Blurred Overlay */}
{/* <div className="absolute inset-0 bg-black/20 backdrop-blur-sm 
               shadow-[0_0_30px_10px_rgba(0,0,0,0.3)] 
               z-10"></div> */}

      {/* Foreground Text Layer */}
      <h1 className="relative text-5xl md:text-8xl font-extrabold text-white text-center leading-tight z-20 top-60 md:top-[6rem]">
        Where Style Meets Story
      </h1>
    </div>

        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Story</h2>
        <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
          Urbanic Pitara was born from a vision to celebrate curated fashion
          that marries contemporary elegance with timeless style. We handpick
          the finest designer pieces and artisan creations to bring them
          directly to your wardrobe. Every item tells a story and we ensure
          that each story is worth wearing.
        </p>
      </section>

      {/* Our Vision */}
      <section className="bg-beige py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Vision</h2>
          <p className="text-xl md:text-2xl text-jet leading-relaxed">
            Our vision is to empower individuals to express themselves through
            fashion while honoring craftsmanship, heritage, and sustainability.
            We believe fashion is not just clothing it is a statement of identity.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16">Why Choose Us</h2>

        <div className="max-w-3xl mx-auto space-y-12">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Curated Designer Collections</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Every piece is carefully selected to ensure uniqueness, style, and quality.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4">Quality & Craftsmanship</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              We prioritize exceptional craftsmanship and attention to detail in every item.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4">Sustainable Practices</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our commitment to sustainability guides every choice we make.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4">Seamless Shopping Experience</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              From browsing to checkout, our platform ensures an effortless and luxurious experience.
            </p>
          </div>
        </div>
      </section>

      {/* Our Team / Craftsmanship */}
      <section className="bg-white py-24 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16">Meet the Artisans</h2>
        <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-700 leading-relaxed mb-12">
          Behind every collection are skilled artisans and designers who pour creativity, precision, and love into their work. We celebrate the hands and hearts that make our pieces extraordinary.
        </p>
        <Image
          src="/images/artisans.jpg" // replace with your image of artisans/team
          alt="Our Team"
          width={1200}
          height={600}
          className="mx-auto rounded-lg shadow-lg object-cover"
        />
      </section>

      {/* Call to Action */}
      <section className="bg-gold py-24 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Explore Our Exclusive Collections
        </h2>
        <p className="text-xl md:text-2xl mb-10">
          Experience fashion that tells a story — yours.
        </p>
        <Link
          href="/collections/all"
          className="inline-block bg-jet text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-jet transition"
        >
          Shop Now
        </Link>
      </section>

    </main>
  );
}
