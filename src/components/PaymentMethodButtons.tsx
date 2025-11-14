/**
 * PaymentMethodButtons Component
 * Displays online payment and COD options with prices
 */

// import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PaymentMethod,
  calculatePrice,
//   getPaymentMethodLabel,
//   getPaymentMethodDescription,
  getCODSurcharge,
} from "@/lib/paymentMethods";
import { CreditCard, Truck } from "lucide-react";

interface PaymentMethodButtonsProps {
  basePrice: number;
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onAddToCart: (method: PaymentMethod) => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

export default function PaymentMethodButtons({
  basePrice,
  selectedMethod,
  onMethodChange,
  onAddToCart,
  loading,
  disabled = false,
}: PaymentMethodButtonsProps) {
  const onlinePrice = calculatePrice(basePrice, "PHONEPE");
  const codPrice = calculatePrice(basePrice, "COD");
  const codSurcharge = getCODSurcharge();

  const handleAddToCart = async (method: PaymentMethod) => {
    onMethodChange(method);
    await onAddToCart(method);
  };

  return (
    <div className="space-y-4">
      {/* Payment Method Selection */}
      <div className="grid grid-cols-2 gap-3">
        {/* Online Payment Button */}
        <button
          onClick={() => onMethodChange("PHONEPE")}
          disabled={disabled}
          className={cn(
            "relative p-4 border-2 rounded-lg transition-all duration-200",
            selectedMethod === "PHONEPE"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:border-green-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm">Pay Online</span>
          </div>
          <p className="text-lg font-bold text-green-600">
            ₹{onlinePrice.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Instant Payment</p>
        </button>

        {/* COD Button */}
        <button
          onClick={() => onMethodChange("COD")}
          disabled={disabled}
          className={cn(
            "relative p-4 border-2 rounded-lg transition-all duration-200",
            selectedMethod === "COD"
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 bg-white hover:border-orange-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-sm">Pay on Delivery</span>
          </div>
          <p className="text-lg font-bold text-orange-600">
            ₹{codPrice.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            +₹{codSurcharge.toFixed(2)} delivery fee
          </p>
        </button>
      </div>

      {/* Description */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {selectedMethod === "PHONEPE"
            ? "Secure instant payment with PhonePe"
            : "Pay when your order arrives at your doorstep"}
        </p>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => handleAddToCart(selectedMethod)}
        disabled={disabled || loading}
        className={cn(
          "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
          selectedMethod === "PHONEPE"
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-orange-600 hover:bg-orange-700 text-white",
          disabled || loading
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-lg"
        )}
      >
        {loading ? "Adding to Cart..." : "Add to Cart"}
      </button>
    </div>
  );
}
