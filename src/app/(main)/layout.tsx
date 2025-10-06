import Navbar from "@/components/view/Navbar";
import Footer from "@/components/view/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-10">{children}</main>
      <Footer />
    </div>
  );
}
