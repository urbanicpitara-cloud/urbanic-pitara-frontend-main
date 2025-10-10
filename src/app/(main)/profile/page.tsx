"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { Skeleton } from "@/components/ui/skeleton";
import { authRepository } from "@/lib/api/repositories/auth";
import { profileRepository } from "@/lib/api/repositories/profile";
import { Button } from "@/components/ui/button";
import { EditProfileForm } from "@/components/view/Profile/EditProfileForm";
import { AddressForm } from "@/components/view/Profile/AddressForm";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cookies = parseCookies();
  const customerAccessToken = cookies.customerAccessToken;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; firstName?: string; lastName?: string } | null>(null);

  const refetch = async () => {
    if (!customerAccessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await profileRepository.me(customerAccessToken);
      setUser(res.user);
    } catch (e: any) {
      setError(e?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && customerAccessToken) {
      refetch();
    }
  }, [mounted, customerAccessToken]);

  useEffect(() => {
    // redirect only after client mount
    if (mounted && !customerAccessToken) {
      router.push("/auth");
    }
  }, [mounted, customerAccessToken, router]);

  // Always render same container shape to avoid hydration mismatch
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        {!mounted || isLoading ? (
          <>
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[200px] w-full md:col-span-2" />
            </div>
          </>
        ) : error || !user ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading profile</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">My Account</h1>
              <Button
                variant="destructive"
                onClick={() => {
                  document.cookie = "customerAccessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </div>

            {/* your profile cards / forms */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-medium mb-2">Personal</h2>
                <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-2">Address</h2>
                <p className="text-sm text-gray-600">Addresses will appear here.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}