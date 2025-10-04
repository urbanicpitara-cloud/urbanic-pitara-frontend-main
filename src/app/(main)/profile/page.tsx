"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { Skeleton } from "@/components/ui/skeleton";
import { useStorefrontQuery } from "@/hooks/useStorefront";
import { GET_CUSTOMER_PROFILE } from "@/graphql/profile";
import type { CustomerProfile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { EditProfileForm } from "@/components/view/Profile/EditProfileForm";
import { AddressForm } from "@/components/view/Profile/AddressForm";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cookies = parseCookies();
  const customerAccessToken = cookies.customerAccessToken;

  const { data, isLoading, error, refetch } = useStorefrontQuery<{ customer: CustomerProfile }>(
    ["customerProfile", customerAccessToken],
    {
      query: GET_CUSTOMER_PROFILE,
      variables: { customerAccessToken },
      // do not attempt fetch on server — only when token exists on client
      enabled: !!customerAccessToken && mounted,
    }
  );

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
        ) : error || !data?.customer ? (
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
                <p className="text-sm text-gray-600">{data.customer.firstName} {data.customer.lastName}</p>
                <p className="text-sm text-gray-600">{data.customer.email}</p>
                <p className="text-sm text-gray-600">{data.customer.phone || "No phone"}</p>

                <EditProfileForm
                  customerAccessToken={customerAccessToken}
                  customer={data.customer}
                  onSuccess={() => refetch()}
                  trigger={<Button variant="outline" className="mt-4">Edit Profile</Button>}
                />
              </div>

              <div>
                <h2 className="text-lg font-medium mb-2">Address</h2>
                {data.customer.defaultAddress ? (
                  <>
                    <p>{data.customer.defaultAddress.address1}</p>
                    <p>{data.customer.defaultAddress.city}, {data.customer.defaultAddress.province} {data.customer.defaultAddress.zip}</p>
                    <AddressForm
                      customerAccessToken={customerAccessToken}
                      existingAddress={data.customer.defaultAddress}
                      onSuccess={() => refetch()}
                      trigger={<Button variant="outline" className="mt-4">Edit Address</Button>}
                    />
                  </>
                ) : (
                  <AddressForm
                    customerAccessToken={customerAccessToken}
                    onSuccess={() => refetch()}
                    trigger={<Button variant="outline">Add Address</Button>}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}