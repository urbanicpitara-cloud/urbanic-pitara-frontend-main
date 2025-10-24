"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cartAPI, ordersAPI, addressesAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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

export default function CheckoutPage() {
  const { cartId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [address, setAddress] = useState<Omit<Address, "id" | "isDefault"> | null>(null);
  const [existingAddress, setExistingAddress] = useState<Address | null>(null);

  // Map backend cart response
  const mapCartResponse = (apiData: any): Cart => {
    const items: CartItem[] = apiData.lines.map((line: any) => ({
      id: line.id,
      product: {
        id: line.product.id,
        title: line.product.title,
        featuredImageUrl: line.product.featuredImage?.url,
        featuredImageAlt: line.product.featuredImage?.altText,
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

  const fetchCartAndAddress = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch cart
      const cartRes = await cartAPI.get();
      setCart(mapCartResponse(cartRes.data));

      // Fetch user's default address
      const addrRes = await addressesAPI.getAll();
      const defaultAddr = addrRes.data.items?.find((a: Address) => a.isDefault) || null;

      if (defaultAddr) {
        setExistingAddress(defaultAddr);
      } else {
        // No address yet, initialize empty
        setAddress({
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndAddress();
  }, [cartId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!address) return;
    setAddress((prev) => ({ ...prev!, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    if (!cart || !user) return;

    try {
      let shippingAddress: Address | null = existingAddress;

      // If no existing default, create one
      if (!existingAddress && address) {
        const res = await addressesAPI.create({ ...address, isDefault: true });
        shippingAddress = res.data;
        setExistingAddress(shippingAddress);
      }

      if (!shippingAddress) throw new Error("No shipping address selected");

      const orderData = {
        cartId: cart.id,
        shippingAddress,
      };

      await ordersAPI.create(orderData);
      alert("Order placed successfully!");
      router.push(`/orders`);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };

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
        {/* Cart Summary */}
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

        {/* Shipping & Place Order */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 border rounded-lg space-y-2">
            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>

            {existingAddress ? (
              <div className="space-y-1">
                <p>
                  {existingAddress.firstName} {existingAddress.lastName}, {existingAddress.address1},{" "}
                  {existingAddress.city}, {existingAddress.country}
                </p>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {address &&
                  [
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
                      value={(address as any)[key]}
                      onChange={handleInputChange}
                      placeholder={label as string}
                      className="w-full border px-3 py-2 rounded"
                    />
                  ))}
              </div>
            )}
          </div>

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
            <Button onClick={handlePlaceOrder} className="w-full mt-4">
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
