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
import { PaymentMethod, calculatePrice, getCODSurcharge } from "@/lib/paymentMethods";
import { CreditCard, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [placingOrder, setPlacingOrder] = useState(false);
  const [payingWithPhonePe, setPayingWithPhonePe] = useState(false);

  // Discount states
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("PHONEPE");

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
        : (line.variant?.selectedOptions?.size ? `Size: ${line.variant.selectedOptions.size}` : ""),
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

  // Update total when discount or payment method changes
  useEffect(() => {
    if (cart) {
      const updatedTotal = getFinalTotal(cart.subtotalAmount, appliedDiscount, selectedPaymentMethod);
      const discountValue = cart.subtotalAmount - updatedTotal + (selectedPaymentMethod === "COD" ? getCODSurcharge() : 0);
      setDiscountAmount(discountValue);
      setCart((prev) => (prev ? { ...prev, totalAmount: updatedTotal } : prev));
    }
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
    setNewAddress((prev) => ({ ...prev!, [e.target.name]: e.target.value }));
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

      // 1) Create order with paymentMethod PHONEPE — backend will create order and mark payment as INITIATED
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

      // 2) Initiate PhonePe payment -> backend returns redirect URL + transactionId
      const initRes = await paymentRepository.initiate({
        amount,
        orderId,
        redirectUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/payment/status`,
      });

      if (!initRes || !initRes.success || !initRes.data) {
        throw new Error(initRes?.error || "Failed to initiate payment");
      }

      // Store last transaction id so the status page can pick it up
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastTransactionId', initRes.data.transactionId);
        }
      } catch (e) {
        console.error(e);
        // ignore localStorage errors
      }

      // Redirect user to PhonePe payment page
      window.location.href = initRes.data.redirectUrl;
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || err.message || 'Payment failed');
    } finally {
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

      <div className="grid gap-8 lg:grid-cols-12">
        {/* ------------------ Cart Summary ------------------ */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
              {item.product.featuredImageUrl && (
                <div className="relative h-24 w-24 flex-shrink-0">
                  <img
                    src={item.product.featuredImageUrl}
                    alt={item.product.featuredImageAlt || item.product.title}
                    className="h-full w-full object-cover rounded"
                  />
                </div>
              )}
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
          <div className="p-4 border rounded-lg space-y-3">
            <h2 className="text-lg font-semibold">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Online Payment Option */}
              <button
                onClick={() => setSelectedPaymentMethod("PHONEPE")}
                className={cn(
                  "relative p-4 border-2 rounded-lg transition-all duration-200",
                  selectedPaymentMethod === "PHONEPE"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Pay Online</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  ₹{calculatePrice(cart.subtotalAmount, "PHONEPE").toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">PhonePe</p>
              </button>

              {/* COD Option */}
              <button
                onClick={() => setSelectedPaymentMethod("COD")}
                className={cn(
                  "relative p-4 border-2 rounded-lg transition-all duration-200",
                  selectedPaymentMethod === "COD"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-orange-300"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-sm">Pay on Delivery</span>
                </div>
                <p className="text-lg font-bold text-orange-600">
                  ₹{calculatePrice(cart.subtotalAmount, "COD").toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  +₹{getCODSurcharge().toFixed(2)} fee
                </p>
              </button>
            </div>
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

            {selectedPaymentMethod === "PHONEPE" ? (
              <Button
                onClick={handlePayWithPhonePe}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                disabled={payingWithPhonePe || placingOrder || (!selectedAddressId && !newAddress)}
              >
                {payingWithPhonePe ? "Redirecting to PhonePe..." : "Pay with PhonePe"}
              </Button>
            ) : (
              <Button
                onClick={handlePlaceOrder}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                disabled={placingOrder || (!selectedAddressId && !newAddress)}
              >
                {placingOrder ? "Placing Order..." : "Place Order (COD)"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
