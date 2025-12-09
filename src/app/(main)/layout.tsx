import Navbar from "@/components/view/Navbar";
import Footer from "@/components/view/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-10 w-full">{children}</main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
