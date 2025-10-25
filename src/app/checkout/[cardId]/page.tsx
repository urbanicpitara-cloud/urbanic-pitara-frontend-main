"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cartAPI, ordersAPI, addressesAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";

// ------------------ Types ------------------
interface CartItem {
  id: string;
  product: {
    id: string;
    title: string;
    featuredImageUrl?: string;
    featuredImageAlt?: string;
  };
  variantId: string;
  title: string;
  quantity: number;
  priceAmount: number;
  currency: string;
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotalAmount: number;
  totalAmount: number;
  currency: string;
}

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

// ------------------ Component ------------------
export default function CheckoutPage() {
  const { cartId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Omit<Address, "id" | "isDefault"> | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  // ------------------ Helpers ------------------
  const mapCartResponse = (apiData: any): Cart => {
    const items: CartItem[] = apiData.lines.map((line: any) => ({
      id: line.id,
      product: {
        id: line.product.id,
        title: line.product.title,
        featuredImageUrl: line.featuredImage?.url,
        featuredImageAlt: line.featuredImage?.altText,
      },
      variantId: line.variant?.id,
      title: line.variant?.selectedOptions?.size || "",
      quantity: line.quantity,
      priceAmount: parseFloat(line.price.amount),
      currency: line.price.currencyCode,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.priceAmount * item.quantity, 0);

    return {
      id: apiData.id,
      items,
      subtotalAmount: subtotal,
      totalAmount: subtotal,
      currency: apiData.subtotal.currencyCode,
    };
  };

  // ------------------ Fetch Data ------------------
  const fetchCartAndAddresses = async () => {
    setLoading(true);
    setError("");

    try {
      // Cart
      const cartRes = await cartAPI.get();
      setCart(mapCartResponse(cartRes.data));

      // Addresses
      const addrRes = await addressesAPI.getAll();
      const allAddrs = addrRes.data.items || [];
      setAddresses(allAddrs);

      // Default address
      const defaultAddr = allAddrs.find((a: Address) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);

      // If no addresses → show new address form
      if (!allAddrs.length) {
        setNewAddress({
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
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndAddresses();
  }, [cartId]);

  // ------------------ Handlers ------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!newAddress) return;
    setNewAddress((prev) => ({ ...prev!, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    if (!cart || !user) return;

    setPlacingOrder(true);

    try {
      let shippingAddress: Address | null = null;

      // If user selected existing address
      if (selectedAddressId) {
        shippingAddress = addresses.find((a) => a.id === selectedAddressId) || null;
      }

      // If adding a new address
      if (!shippingAddress && newAddress) {
        const duplicate = addresses.find(
          (a) =>
            a.firstName === newAddress.firstName &&
            a.lastName === newAddress.lastName &&
            a.address1 === newAddress.address1 &&
            a.address2 === newAddress.address2 &&
            a.city === newAddress.city &&
            a.province === newAddress.province &&
            a.zip === newAddress.zip &&
            a.country === newAddress.country &&
            a.phone === newAddress.phone
        );

        if (duplicate) {
          shippingAddress = duplicate;
          setSelectedAddressId(duplicate.id);
        } else {
          // Create new address
          const res = await addressesAPI.create({ ...newAddress, isDefault: false });
          shippingAddress = res.data as Address;

          // Update addresses state safely
          setAddresses((prev: Address[]) => [...prev, shippingAddress!]);
          setSelectedAddressId(shippingAddress!.id);
        }
      }

      if (!shippingAddress) throw new Error("No shipping address selected");

      // Create order
      await ordersAPI.create({
        cartId: cart.id,
        shippingAddressId: shippingAddress.id,
      });

      alert("Order placed successfully!");
      router.push(`/orders`);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ------------------ Render ------------------
  if (loading) return <p className="p-8 text-center">Loading checkout...</p>;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;
  if (!cart || !cart.items.length)
    return (
      <div className="p-16 text-center">
        <h2>Your cart is empty</h2>
        <Link href="/">
          <Button>Go Back to Shop</Button>
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* ------------------ Cart Summary ------------------ */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{item.product.title}</h3>
                {item.title && <p className="text-sm text-gray-500">{item.title}</p>}
                <p>
                  {item.priceAmount} {item.currency} × {item.quantity}
                </p>
              </div>
              <div className="text-right font-medium">
                {item.priceAmount * item.quantity} {item.currency}
              </div>
            </div>
          ))}
        </div>

        {/* ------------------ Address + Order Section ------------------ */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="text-lg font-semibold">Shipping Address</h2>

            {addresses.length > 0 && (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-2 border rounded-md p-3 cursor-pointer ${
                      selectedAddressId === addr.id
                        ? "border-black bg-gray-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressId === addr.id}
                      onChange={() => {
                        setSelectedAddressId(addr.id);
                        setNewAddress(null);
                      }}
                    />
                    <div className="text-sm">
                      <p className="font-medium">
                        {addr.firstName} {addr.lastName}
                      </p>
                      <p>{addr.address1}</p>
                      {addr.address2 && <p>{addr.address2}</p>}
                      <p>
                        {addr.city}, {addr.province} {addr.zip}
                      </p>
                      <p>{addr.country}</p>
                      {addr.phone && <p>📞 {addr.phone}</p>}
                    </div>
                  </label>
                ))}

                <div className="text-center text-sm mt-3">
                  <button
                    className="underline text-gray-600"
                    onClick={() =>
                      setNewAddress({
                        firstName: "",
                        lastName: "",
                        address1: "",
                        address2: "",
                        city: "",
                        province: "",
                        zip: "",
                        country: "",
                        phone: "",
                      })
                    }
                  >
                    + Add New Address
                  </button>
                </div>
              </div>
            )}

            {/* New address form */}
            {newAddress && (
              <div className="space-y-2 mt-3 border-t pt-3">
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
                    value={(newAddress as any)[key]}
                    onChange={handleInputChange}
                    placeholder={label}
                    className="w-full border px-3 py-2 rounded text-sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* ------------------ Order Summary ------------------ */}
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                {cart.subtotalAmount} {cart.currency}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {cart.totalAmount} {cart.currency}
              </span>
            </div>
            <Button
              onClick={handlePlaceOrder}
              className="w-full mt-4"
              disabled={placingOrder || (!selectedAddressId && !newAddress)}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
