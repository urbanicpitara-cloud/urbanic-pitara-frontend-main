import Navbar from "@/components/view/Navbar";
import Footer from "@/components/view/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden m-auto">
      <Navbar />
      <main className=" pt-10 overflow-x-hidden">{children}</main>
      <WhatsAppButton/>
      <Footer />
    </div>
  );
}
