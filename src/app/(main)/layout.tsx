import Navbar from "@/components/view/Navbar";
import Footer from "@/components/view/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScrollArea className="min-h-screen w-screen m-auto">
      <Navbar />
      <main className=" pt-10 overflow-x-hidden">{children}</main>
      <WhatsAppButton/>
      <Footer />
    </ScrollArea>
  );
}
