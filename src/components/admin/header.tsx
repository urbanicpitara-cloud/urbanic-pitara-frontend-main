"use client";

import { useAuth } from "@/lib/auth";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
      <div className="text-sm text-gray-600">
        {user?.firstName} {user?.lastName} ({user?.email})
      </div>
    </header>
  );
}
