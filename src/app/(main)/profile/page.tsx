"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { addressesAPI, authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageLoadingSkeleton } from "@/components/ui/loading-states";

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
  const { user, setUser } = useAuth() as any;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Address form used for create/edit
  const emptyAddress = {
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    country: "",
    phone: "",
  };

  const [addressForm, setAddressForm] = useState<any>(emptyAddress);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [addrRes, profileRes] = await Promise.all([addressesAPI.getAll(), authAPI.getProfile()]);
      const items = addrRes.data?.items || [];
      setAddresses(items);

      const profile = profileRes.data;
      if (profile) {
        setProfileForm({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phone: profile.phone || "",
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEditAddress = (addr?: Address) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({ ...addr });
      setCreating(false);
    } else {
      setEditingAddressId(null);
      setAddressForm({ ...emptyAddress });
      setCreating(true);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setAddressForm((p: any) => ({ ...p, [name]: value }));
  };

  const saveAddress = async () => {
    try {
      setSaving(true);
      if (creating) {
        await addressesAPI.create({ ...addressForm, isDefault: false });
      } else if (editingAddressId) {
        await addressesAPI.update(editingAddressId, addressForm);
      }
      await fetchAll();
      setCreating(false);
      setEditingAddressId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await addressesAPI.remove(id);
      await fetchAll();
    } catch (err) {
      console.error(err);
      setError("Failed to delete address");
    }
  };

  const setDefault = async (id: string) => {
    try {
      await addressesAPI.update(id, { isDefault: true });
      await fetchAll();
    } catch (err) {
      console.error(err);
      setError("Failed to set default address");
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setProfileForm((p) => ({ ...p, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const res = await authAPI.updateProfile(profileForm);
      // update local auth context if available
      if (setUser) setUser(res.data);
      await fetchAll();
    } catch (err) {
      console.error(err);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoadingSkeleton />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!user) return <div className="p-6">Please login to view your profile.</div>;

  return (
    <div className="container mx-auto py-10 max-w-4xl pt-12">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Edit */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">First name</label>
              <input name="firstName" value={profileForm.firstName} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <input name="lastName" value={profileForm.lastName} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full border px-3 py-2 rounded mt-1" />
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
            </div>
          </div>
        </div>

        {/* Right: Addresses list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold mb-2">Addresses</h2>
              <div>
                <Button onClick={() => startEditAddress()}>Add Address</Button>
              </div>
            </div>

            {addresses.length === 0 && (
              <div className="p-4 text-sm text-gray-600">No saved addresses yet. Add one to speed up checkout.</div>
            )}

            <div className="space-y-3 mt-3">
              {addresses.map((a) => (
                <div key={a.id} className={`p-3 border rounded-md ${a.isDefault ? 'ring-2 ring-indigo-200' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{a.firstName} {a.lastName} {a.isDefault && <span className="text-xs ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded">Default</span>}</div>
                      <div className="text-sm text-gray-700">{a.address1}{a.address2 ? `, ${a.address2}` : ''}</div>
                      <div className="text-sm text-gray-700">{a.city}{a.province ? `, ${a.province}` : ''} {a.zip}</div>
                      <div className="text-sm text-gray-700">{a.country}</div>
                      {a.phone && <div className="text-sm text-gray-700">Phone: {a.phone}</div>}
                    </div>
                    <div className="flex gap-2">
                      {!a.isDefault && <Button variant="outline" onClick={() => setDefault(a.id)}>Set Default</Button>}
                      <Button variant="ghost" onClick={() => startEditAddress(a)}>Edit</Button>
                      <Button variant="destructive" onClick={() => removeAddress(a.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address Form Panel */}
          {(creating || editingAddressId) && (
            <div className="p-4 border rounded-lg">
              <h3 className="text-md font-semibold mb-3">{creating ? 'Add new address' : 'Edit address'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="firstName" value={addressForm.firstName} onChange={handleAddressChange} placeholder="First name" className="w-full border px-3 py-2 rounded" />
                <input name="lastName" value={addressForm.lastName} onChange={handleAddressChange} placeholder="Last name" className="w-full border px-3 py-2 rounded" />
                <input name="address1" value={addressForm.address1} onChange={handleAddressChange} placeholder="Address line 1" className="w-full border px-3 py-2 rounded md:col-span-2" />
                <input name="address2" value={addressForm.address2} onChange={handleAddressChange} placeholder="Address line 2" className="w-full border px-3 py-2 rounded md:col-span-2" />
                <input name="city" value={addressForm.city} onChange={handleAddressChange} placeholder="City" className="w-full border px-3 py-2 rounded" />
                <input name="province" value={addressForm.province} onChange={handleAddressChange} placeholder="Province/State" className="w-full border px-3 py-2 rounded" />
                <input name="zip" value={addressForm.zip} onChange={handleAddressChange} placeholder="ZIP / Postal" className="w-full border px-3 py-2 rounded" />
                <input name="country" value={addressForm.country} onChange={handleAddressChange} placeholder="Country" className="w-full border px-3 py-2 rounded" />
                <input name="phone" value={addressForm.phone} onChange={handleAddressChange} placeholder="Phone" className="w-full border px-3 py-2 rounded md:col-span-2" />
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={saveAddress} disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</Button>
                <Button variant="outline" onClick={() => { setCreating(false); setEditingAddressId(null); }}>{'Cancel'}</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
