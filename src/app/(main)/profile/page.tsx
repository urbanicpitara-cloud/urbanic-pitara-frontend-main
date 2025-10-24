"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { addressesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip?: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  // const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [addressForm, setAddressForm] = useState<Omit<Address, "id" | "isDefault">>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    country: "",
    phone: "",
  });

  // Fetch default address
  const fetchAddress = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await addressesAPI.getAll();
      const defaultAddr = res.data.items?.find((a: Address) => a.isDefault) || null;
      setDefaultAddress(defaultAddr);

      if (defaultAddr) {
        setAddressForm({ ...defaultAddr });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load address");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveAddress = async () => {
    try {
      if (defaultAddress) {
        // Update existing address
        const res = await addressesAPI.update(defaultAddress.id, addressForm);
        setDefaultAddress(res.data);
      } else {
        // Create new default address
        const res = await addressesAPI.create({ ...addressForm, isDefault: true });
        setDefaultAddress(res.data);
      }
      setEditMode(false);
      alert("Address saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save address");
    }
  };

  if (loading) return <p className="p-8 text-center">Loading profile...</p>;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;
  if (!user) return <p className="p-8 text-center">No user found.</p>;

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      {/* User Info */}
      <div className="p-4 border rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">User Information</h2>
        <p>
          <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
        </p>
        <p>
          <span className="font-medium">Email:</span> {user.email}
        </p>
      </div>

      {/* Address Info */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Default Shipping Address</h2>

        {defaultAddress && !editMode ? (
          <div className="space-y-1">
            <p>
              {defaultAddress.firstName} {defaultAddress.lastName}
            </p>
            <p>
              {defaultAddress.address1} {defaultAddress.address2}
            </p>
            <p>
              {defaultAddress.city}, {defaultAddress.province}, {defaultAddress.zip}
            </p>
            <p>{defaultAddress.country}</p>
            <p>Phone: {defaultAddress.phone}</p>
            <Button className="mt-3" onClick={() => setEditMode(true)}>
              Edit Address
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {[
              ["firstName", "First Name"],
              ["lastName", "Last Name"],
              ["address1", "Address 1"],
              ["address2", "Address 2"],
              ["city", "City"],
              ["province", "Province/State"],
              ["zip", "ZIP/Postal Code"],
              ["country", "Country"],
              ["phone", "Phone"],
            ].map(([key, label]) => (
              <input
                key={key}
                type="text"
                name={key}
                value={(addressForm as any)[key]}
                onChange={handleInputChange}
                placeholder={label as string}
                className="w-full border px-3 py-2 rounded"
              />
            ))}
            <div className="flex gap-2 mt-2">
              <Button onClick={handleSaveAddress}>Save</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
