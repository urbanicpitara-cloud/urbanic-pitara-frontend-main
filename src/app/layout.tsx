import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google"; // Added Cinzel
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/providers";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/theme-provider";
import { CartProvider } from "@/lib/atoms/cart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({ // Configured Cinzel
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const samarkan = localFont({
  src: "./fonts/samakaran-normal.ttf",
  variable: "--font-samarkan",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Urbanic Pitara | Traditional Indian Wear",
    template: "%s | Urbanic Pitara",
  },
  description: "Discover authentic Indian traditional wear at Urbanic Pitara",
  openGraph: {
    type: "website",
    siteName: "Urbanic Pitara",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="oDHM7r4eT6IyyvfUaaSxH6f23MYhdL1K0GGVSLv0y9k"
        />
      </head>
      <Providers>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${samarkan.variable} ${cinzel.variable} antialiased`}
        >
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100]" style={{ backgroundImage: 'url("/noise.png")' }}></div>
          <ThemeProvider>
            <CartProvider>
              {children}
              <Toaster position="bottom-right" />
            </CartProvider>
          </ThemeProvider>
        </body>
      </Providers>
    </html>
  );
}
