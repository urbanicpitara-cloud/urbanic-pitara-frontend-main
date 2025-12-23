"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cartAPI, ordersAPI, addressesAPI, discountsAPI } from "@/lib/api";
import { paymentRepository } from "@/lib/api/repositories/payment";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useCart } from "@/lib/atoms/cart";
import { PaymentMethod, getCODSurcharge } from "@/lib/paymentMethods";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

interface Discount {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number | undefined;
  currency: string | undefined;
  name: string;
  description: string;
  order_id: string | undefined;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  on: (event: string, handler: (response: RazorpayError) => void) => void;
  open: () => void;
}


// ------------------ Component ------------------
export default function CheckoutPage() {
  const { cartId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { clearCart } = useCart();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Omit<Address, "id" | "isDefault"> | null>(null);
  const [useUserPhone, setUseUserPhone] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [payingWithRazorpay, setPayingWithRazorpay] = useState(false);
  const [payingWithPhonePe, setPayingWithPhonePe] = useState(false);


  // Discount states
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("RAZORPAY");

  // ------------------ Helpers ------------------
  const mapCartResponse = (apiData: any): Cart => {
    const items: CartItem[] = apiData.lines.map((line: any) => ({
      id: line.id,
      product: line.product ? {
        id: line.product.id,
        title: line.product.title,
        featuredImageUrl: line.product.featuredImage?.url,
        featuredImageAlt: line.product.featuredImage?.altText || line.product.title,
      } : {
        id: line.customProductId,
        title: line.customProduct?.title || `Custom ${line.customProduct?.color}`,
        featuredImageUrl: line.customProduct?.previewUrl,
        featuredImageAlt: line.customProduct?.title || 'Custom Product',
      },
      variantId: line.variant?.id,
      title: line.customProduct
        ? `Custom ${line.customProduct.color} - Size: ${line.customProduct.size || 'L'}`
        : (line.variant?.selectedOptions?.Size || line.variant?.selectedOptions?.size ? `Size: ${line.variant.selectedOptions.Size || line.variant.selectedOptions.size}` : ""),
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

  const getFinalTotal = (subtotal: number, discount?: Discount | null, paymentMethod: PaymentMethod = "PHONEPE"): number => {
    let total = subtotal;

    // Apply discount first
    if (discount) {
      const value = Number(discount.value);
      if (discount.type === "PERCENTAGE") total = subtotal - (subtotal * value) / 100;
      else if (discount.type === "FIXED") total = Math.max(subtotal - value, 0);
    }

    // Add COD surcharge if applicable
    if (paymentMethod === "COD") {
      total += getCODSurcharge();
    }

    return total;
  };

  const isAddressReady = () => {
    if (selectedAddressId) return true;
    if (newAddress) {
      return (
        !!newAddress.firstName?.trim() &&
        !!newAddress.lastName?.trim() &&
        !!newAddress.address1?.trim() &&
        !!newAddress.city?.trim() &&
        !!newAddress.province?.trim() &&
        !!newAddress.zip?.trim() &&
        !!newAddress.country?.trim() &&
        !!newAddress.phone?.trim()
      );
    }
    return false;
  };

  // ------------------ Fetch Data ------------------
  const fetchCartAndAddresses = async () => {
    setLoading(true);
    setError("");

    try {
      const cartRes = await cartAPI.get();
      setCart(mapCartResponse(cartRes.data));

      const addrRes = await addressesAPI.getAll();
      const allAddrs = addrRes.data.items || [];
      setAddresses(allAddrs);

      const defaultAddr = allAddrs.find((a: Address) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);

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
          phone: user?.phone || "",
        });
        // Auto-check the box if user has a phone
        if (user?.phone) {
          setUseUserPhone(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId]);

  // Update total when discount or payment method changes
  useEffect(() => {
    if (cart) {
      const updatedTotal = getFinalTotal(cart.subtotalAmount, appliedDiscount, selectedPaymentMethod);
      const discountValue = cart.subtotalAmount - updatedTotal + (selectedPaymentMethod === "COD" ? getCODSurcharge() : 0);
      setDiscountAmount(discountValue);
      setCart((prev) => (prev ? { ...prev, totalAmount: updatedTotal } : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedDiscount, cart?.subtotalAmount, selectedPaymentMethod]);

  // ------------------ Discount ------------------
  const handleApplyDiscount = async () => {
    if (!discountCode.trim() || !cart) return;
    setValidatingDiscount(true);

    try {
      const res = await discountsAPI.validate(discountCode.trim());
      const data = res.data.discount || res.data;

      if (!data || !data.code) throw new Error("Invalid discount code");

      const discount: Discount = {
        code: data.code,
        type: data.type,
        value: Number(data.value),
      };

      setAppliedDiscount(discount);
      toast.success(`Discount "${discount.code}" applied successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid or expired code");
      setAppliedDiscount(null);
      setDiscountAmount(0);
    } finally {
      setValidatingDiscount(false);
    }
  };

  // ------------------ Address + Order ------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!newAddress) return;
    const { name, value } = e.target;

    // If user manually changes phone, uncheck the "use my phone" option
    if (name === "phone" && useUserPhone) {
      setUseUserPhone(false);
    }

    setNewAddress((prev) => ({ ...prev!, [name]: value }));
  };

  const handleUseUserPhoneToggle = () => {
    if (!newAddress || !user) return;

    const newUseUserPhone = !useUserPhone;
    setUseUserPhone(newUseUserPhone);

    if (newUseUserPhone && user.phone) {
      setNewAddress((prev) => ({ ...prev!, phone: user.phone || "" }));
    } else if (!newUseUserPhone) {
      setNewAddress((prev) => ({ ...prev!, phone: "" }));
    }
  };

  // Helper to update user's phone if they don't have one
  const updateUserPhoneIfNeeded = async (phone: string) => {
    if (!user || user.phone || !phone) return;

    try {
      // Update user profile with phone number
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phone }),
      });
    } catch (error) {
      console.error('Failed to update user phone:', error);
      // Don't block the order if this fails
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || !user) return;
    setPlacingOrder(true);

    try {
      let shippingAddress: Address | null = null;

      if (selectedAddressId) {
        shippingAddress = addresses.find((a) => a.id === selectedAddressId) || null;
      }

      if (!shippingAddress && newAddress) {
        const duplicate = addresses.find(
          (a) =>
            a.firstName === newAddress.firstName &&
            a.lastName === newAddress.lastName &&
            a.address1 === newAddress.address1 &&
            a.city === newAddress.city &&
            a.country === newAddress.country
        );

        if (duplicate) {
          shippingAddress = duplicate;
          setSelectedAddressId(duplicate.id);
        } else {
          const res = await addressesAPI.create({ ...newAddress, isDefault: false });
          shippingAddress = res.data as Address;
          setAddresses((prev) => [...prev, shippingAddress!]);
          setSelectedAddressId(shippingAddress!.id);

          // Update user's phone if they don't have one
          if (newAddress.phone) {
            await updateUserPhoneIfNeeded(newAddress.phone);
          }
        }
      }

      if (!shippingAddress) throw new Error("No shipping address selected");

      await ordersAPI.create({
        cartId: cart.id,
        shippingAddressId: shippingAddress.id,
        discountCode: appliedDiscount ? appliedDiscount.code : null,
        paymentMethod: "COD",
        cartSnapshot: cart.items.map((it) => ({
          productId: it.product.id,
          variantId: it.variantId || null,
          quantity: it.quantity,
          priceAmount: it.priceAmount,
          priceCurrency: it.currency,
        })),
      });

      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/orders`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };



  // ------------------ Pay with Razorpay ------------------
  const handlePayWithRazorpay = async () => {
    if (!cart || !user) return;
    setPayingWithRazorpay(true);

    try {
      let shippingAddress = null;

      if (selectedAddressId) {
        shippingAddress = addresses.find((a) => a.id === selectedAddressId) || null;
      }

      if (!shippingAddress && newAddress) {
        const duplicate = addresses.find(
          (a) =>
            a.firstName === newAddress.firstName &&
            a.lastName === newAddress.lastName &&
            a.address1 === newAddress.address1 &&
            a.city === newAddress.city &&
            a.country === newAddress.country
        );

        if (duplicate) {
          shippingAddress = duplicate;
          setSelectedAddressId(duplicate.id);
        } else {
          const res = await addressesAPI.create({ ...newAddress, isDefault: false });
          shippingAddress = res.data as Address;
          setAddresses((prev) => [...prev, shippingAddress!]);
          setSelectedAddressId(shippingAddress!.id);
        }
      }

      if (!shippingAddress) throw new Error("No shipping address selected");

      // 1) Create order with RAZORPAY
      const orderRes = await ordersAPI.create({
        cartId: cart.id,
        shippingAddressId: shippingAddress.id,
        discountCode: appliedDiscount ? appliedDiscount.code : null,
        paymentMethod: "RAZORPAY",
        cartSnapshot: cart.items.map((it) => ({
          productId: it.product.id,
          variantId: it.variantId || null,
          quantity: it.quantity,
          priceAmount: it.priceAmount,
          priceCurrency: it.currency,
        })),
      });

      const orderData = orderRes.data;
      const orderId = orderData.id;
      const amount = parseFloat(orderData.totalAmount || orderData.total || cart.totalAmount.toString());

      // 2) Initiate Razorpay payment
      console.log('Initiating Razorpay payment...');
      const initRes = await paymentRepository.initiate({
        amount,
        orderId,
        provider: 'RAZORPAY',
      });

      console.log('Razorpay initiate response:', initRes);

      if (!initRes || !initRes.success || !initRes.data) {
        throw new Error(initRes?.error || "Failed to initiate payment with Razorpay");
      }

      // Check if we're in mock mode (mock key ID)
      const isMockMode = initRes.data.keyId === 'rzp_test_mock_key_id';

      if (isMockMode) {
        // Mock mode: Simulate successful payment without Razorpay UI
        console.log('📌 Razorpay Mock Mode: Simulating successful payment');

        // Simulate payment verification
        await paymentRepository.verifyRazorpay({
          razorpay_order_id: initRes.data.orderId || '',
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
        });

        toast.success('Payment successful! (Mock Mode)');
        clearCart();
        router.push('/orders');
        return;
      }

      // Real mode: Load Razorpay script and open checkout
      if (!(window as any).Razorpay) {
        console.log('Loading Razorpay script...');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.log('Razorpay script loaded successfully');
            resolve(true);
          };
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        });
      }

      // 4) Open Razorpay checkout
      console.log('Opening Razorpay checkout with options:', {
        key: initRes.data.keyId,
        order_id: initRes.data.orderId
      });

      const options = {
        key: initRes.data.keyId,
        amount: initRes.data.amount,
        currency: initRes.data.currency,
        name: 'Urbanic Pitara',
        description: `Order #${orderId.slice(0, 8)}`,
        order_id: initRes.data.orderId,
        prefill: {
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (shippingAddress ? `${shippingAddress.firstName} ${shippingAddress.lastName}` : ''),
          email: user?.email || '',
          contact: shippingAddress?.phone || '',
        },
        handler: async function (response: RazorpayResponse) {
          console.log('Razorpay payment success:', response);
          try {
            // Verify payment
            await paymentRepository.verifyRazorpay({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success('Payment successful!');
            clearCart();
            router.push('/orders');
          } catch (err) {
            console.error('Verification error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            toast.error('Payment verification failed: ' + errorMessage);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Razorpay modal dismissed');
            setPayingWithRazorpay(false);
          }
        },
        theme: {
          color: '#000000' // Matches the new black branding
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayError) {
        console.error('Razorpay payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Check console for details.';
      toast.error(errorMessage);
      setPayingWithRazorpay(false);
    }
  };

  // ------------------ Pay with PhonePe ------------------
  const handlePayWithPhonePe = async () => {
    if (!cart || !user) return;
    setPayingWithPhonePe(true);

    try {
      let shippingAddress = null;

      if (selectedAddressId) {
        shippingAddress = addresses.find((a) => a.id === selectedAddressId) || null;
      }

      if (!shippingAddress && newAddress) {
        const duplicate = addresses.find(
          (a) =>
            a.firstName === newAddress.firstName &&
            a.lastName === newAddress.lastName &&
            a.address1 === newAddress.address1 &&
            a.city === newAddress.city &&
            a.country === newAddress.country
        );

        if (duplicate) {
          shippingAddress = duplicate;
          setSelectedAddressId(duplicate.id);
        } else {
          const res = await addressesAPI.create({ ...newAddress, isDefault: false });
          shippingAddress = res.data as Address;
          setAddresses((prev) => [...prev, shippingAddress!]);
          setSelectedAddressId(shippingAddress!.id);
        }
      }

      if (!shippingAddress) throw new Error("No shipping address selected");

      // 1) Create order with PHONEPE
      const orderRes = await ordersAPI.create({
        cartId: cart.id,
        shippingAddressId: shippingAddress.id,
        discountCode: appliedDiscount ? appliedDiscount.code : null,
        paymentMethod: "PHONEPE",
        cartSnapshot: cart.items.map((it) => ({
          productId: it.product.id,
          variantId: it.variantId || null,
          quantity: it.quantity,
          priceAmount: it.priceAmount,
          priceCurrency: it.currency,
        })),
      });

      const orderData = orderRes.data;
      const orderId = orderData.id;
      const amount = parseFloat(orderData.totalAmount || orderData.total || cart.totalAmount.toString());

      // 2) Initiate PhonePe payment
      const initRes = await paymentRepository.initiate({
        amount,
        orderId,
        provider: 'PHONEPE',
        redirectUrl: `${window.location.origin}/checkout/phonepe-callback`,
      });

      if (!initRes || !initRes.success || !initRes.data?.redirectUrl) {
        throw new Error(initRes?.error || "Failed to initiate payment with PhonePe");
      }

      // 3) Redirect to PhonePe
      window.location.href = initRes.data.redirectUrl;

    } catch (err) {
      console.error('PhonePe Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment initiation failed';
      toast.error(errorMessage);
    } finally {
      // Don't set false if redirecting, but effectively we are navigating away
      // If error, we stop loading
      setPayingWithPhonePe(false);
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

      <div className="flex flex-col-reverse gap-8 lg:grid lg:grid-cols-12">
        {/* ------------------ Cart Summary ------------------ */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white">
              <div className="flex gap-4 flex-1">
                {item.product.featuredImageUrl && (
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <img
                      src={item.product.featuredImageUrl}
                      alt={item.product.featuredImageAlt || item.product.title}
                      className="h-full w-full object-cover rounded-md border border-gray-100"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{item.product.title}</h3>
                  {item.title && <p className="text-sm text-gray-500 truncate">{item.title}</p>}
                  <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>

                  {/* Mobile Price */}
                  <div className="sm:hidden mt-2 font-medium text-gray-900">
                    {item.priceAmount * item.quantity} {item.currency}
                  </div>
                </div>
              </div>

              {/* Desktop Price */}
              <div className="hidden sm:block text-right font-medium text-gray-900">
                {item.priceAmount * item.quantity} {item.currency}
              </div>
            </div>
          ))}
        </div>

        {/* ------------------ Address + Summary ------------------ */}
        <div className="lg:col-span-4 space-y-4">
          {/* Address selection */}
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="text-lg font-semibold">Shipping Address</h2>

            {addresses.length > 0 && (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-2 border rounded-md p-3 cursor-pointer ${selectedAddressId === addr.id
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
                    className="underline text-gray-600 hover:text-black transition-colors"
                    onClick={() => {
                      setSelectedAddressId(null);
                      setNewAddress({
                        firstName: "",
                        lastName: "",
                        address1: "",
                        address2: "",
                        city: "",
                        province: "",
                        zip: "",
                        country: "",
                        phone: user?.phone || "",
                      });
                      // Auto-check if user has phone
                      if (user?.phone) {
                        setUseUserPhone(true);
                      }
                    }}
                  >
                    + Add New Address
                  </button>
                </div>
              </div>
            )}

            {newAddress && (
              <div className="space-y-3 mt-3 border-t pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="firstName"
                    value={newAddress.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={newAddress.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <input
                  type="text"
                  name="address1"
                  value={newAddress.address1}
                  onChange={handleInputChange}
                  placeholder="Address Line 1"
                  className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                />
                <input
                  type="text"
                  name="address2"
                  value={newAddress.address2 || ""}
                  onChange={handleInputChange}
                  placeholder="Address Line 2 (Optional)"
                  className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <input
                    type="text"
                    name="province"
                    value={newAddress.province || ""}
                    onChange={handleInputChange}
                    placeholder="State/Province"
                    className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="zip"
                    value={newAddress.zip || ""}
                    onChange={handleInputChange}
                    placeholder="ZIP/Postal Code"
                    className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <input
                    type="text"
                    name="country"
                    value={newAddress.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                {/* Phone field with smart auto-fill */}
                <div className="space-y-2">
                  {user?.phone && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-black transition-colors">
                      <input
                        type="checkbox"
                        checked={useUserPhone}
                        onChange={handleUseUserPhoneToggle}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span>Use my registered phone number ({user.phone})</span>
                    </label>
                  )}
                  <input
                    type="tel"
                    name="phone"
                    value={newAddress.phone || ""}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={useUserPhone}
                  />
                  {useUserPhone && (
                    <p className="text-xs text-gray-500">✓ Using your registered phone number</p>
                  )}
                  {!user?.phone && newAddress.phone && (
                    <p className="text-xs text-blue-600">💡 This phone number will be saved to your profile</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Discount */}
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="text-lg font-semibold">Discount Code</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 border px-3 py-2 rounded text-sm"
                disabled={!!appliedDiscount}
              />
              <Button
                onClick={handleApplyDiscount}
                disabled={validatingDiscount || !!appliedDiscount}
              >
                {validatingDiscount ? "Checking..." : appliedDiscount ? "Applied" : "Apply"}
              </Button>
            </div>

            {appliedDiscount && (
              <p className="text-green-600 text-sm">
                ✅ {appliedDiscount.code} applied (
                {appliedDiscount.type === "PERCENTAGE"
                  ? `${appliedDiscount.value}%`
                  : `₹${appliedDiscount.value.toFixed(2)}`}
                )
              </p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

            <div className="space-y-3 mb-6">
              {/* PhonePe */}
              <div
                onClick={() => setSelectedPaymentMethod("PHONEPE")}
                className={cn(
                  "relative flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border rounded-xl cursor-pointer transition-all duration-200",
                  selectedPaymentMethod === "PHONEPE"
                    ? "border-black ring-1 ring-black bg-gray-50/50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
                    selectedPaymentMethod === "PHONEPE" ? "border-black" : "border-gray-300"
                  )}>
                    {selectedPaymentMethod === "PHONEPE" && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 h-6">
                      {/* Using a text label or icon if available */}
                      <span className="font-bold text-gray-900 text-lg">PhonePe</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">UPI, Credit/Debit Cards, Wallets</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    ₹{getFinalTotal(cart.subtotalAmount, appliedDiscount, "PHONEPE").toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Razorpay */}
              <div
                onClick={() => setSelectedPaymentMethod("RAZORPAY")}
                className={cn(
                  "relative flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border rounded-xl cursor-pointer transition-all duration-200",
                  selectedPaymentMethod === "RAZORPAY"
                    ? "border-black ring-1 ring-black bg-gray-50/50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
                    selectedPaymentMethod === "RAZORPAY" ? "border-black" : "border-gray-300"
                  )}>
                    {selectedPaymentMethod === "RAZORPAY" && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                  </div>
                  <div>
                    <div className="relative h-10 w-24">
                      <Image
                        src="/rzrpay.png"
                        alt="Razorpay"
                        fill
                        className="object-cover object-left"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">UPI, Cards, NetBanking, Wallets</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    ₹{getFinalTotal(cart.subtotalAmount, appliedDiscount, "RAZORPAY").toFixed(2)}
                  </span>
                </div>
              </div>



              {/* COD */}
              <div
                onClick={() => setSelectedPaymentMethod("COD")}
                className={cn(
                  "relative flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border rounded-xl cursor-pointer transition-all duration-200",
                  selectedPaymentMethod === "COD"
                    ? "border-black ring-1 ring-black bg-gray-50/50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
                    selectedPaymentMethod === "COD" ? "border-black" : "border-gray-300"
                  )}>
                    {selectedPaymentMethod === "COD" && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 h-6">
                      <Truck className="h-5 w-5 text-gray-900" />
                      <span className="font-bold text-gray-900">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Pay in cash when order arrives</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="font-medium text-gray-900">
                    ₹{getFinalTotal(cart.subtotalAmount, appliedDiscount, "COD").toFixed(2)}
                  </span>
                  {getCODSurcharge() > 0 && (
                    <span className="text-xs text-orange-600 font-medium">
                      +₹{getCODSurcharge()} COD Fee
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Buttons */}

            {selectedPaymentMethod === "PHONEPE" && (
              <Button
                onClick={handlePayWithPhonePe}
                disabled={payingWithPhonePe || !isAddressReady()}
                className="w-full bg-[#5f259f] hover:bg-[#4f1f85]" // PhonePe Brand Color
              >
                {payingWithPhonePe ? "Processing..." : "Pay with PhonePe"}
              </Button>
            )}

            {selectedPaymentMethod === "RAZORPAY" && (
              <Button
                onClick={handlePayWithRazorpay}
                disabled={payingWithRazorpay || !isAddressReady()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {payingWithRazorpay ? "Processing..." : "Pay with Razorpay"}
              </Button>
            )}



            {selectedPaymentMethod === "COD" && (
              <Button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !isAddressReady()}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {placingOrder ? "Placing Order..." : "Place Order (COD)"}
              </Button>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                ₹{cart.subtotalAmount.toFixed(2)} {cart.currency}
              </span>
            </div>
            {selectedPaymentMethod === "COD" && (
              <div className="flex justify-between text-orange-600">
                <span>COD Surcharge</span>
                <span>+₹{getCODSurcharge().toFixed(2)} {cart.currency}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>
                  -₹{discountAmount.toFixed(2)} {cart.currency}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>
                ₹{cart.totalAmount.toFixed(2)} {cart.currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
