"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/sidebar";
import Header from "@/components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  console.log("user :", user)
  const router = useRouter();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMobileNavOpen={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-6 bg-gray-50 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
