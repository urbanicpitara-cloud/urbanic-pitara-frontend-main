import Navbar from "@/components/view/Navbar";
import Footer from "@/components/view/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-x-hidden overflow-y-auto scrollbar-hide flex flex-col justify-between">
      <Navbar />
      <main className="pt-20 w-full">{children}</main>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}
