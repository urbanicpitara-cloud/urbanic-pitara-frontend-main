/**
 * Payment method utilities
 * Handles pricing calculations for different payment methods
 */

export type PaymentMethod = "PHONEPE" | "RAZORPAY" | "COD";

// COD markup configuration (can be adjusted)
const COD_MARKUP_AMOUNT = 100; // Fixed ₹100 surcharge for COD

/**
 * Calculate the final price based on payment method
 * @param basePrice - Original product price
 * @param paymentMethod - Selected payment method
 * @returns Final price for the customer
 */
export const calculatePrice = (
  basePrice: number,
  paymentMethod: PaymentMethod
): number => {
  if (paymentMethod === "COD") {
    return basePrice + COD_MARKUP_AMOUNT;
  }
  return basePrice;
};

/**
 * Get the surcharge amount for COD
 * @returns COD markup amount
 */
export const getCODSurcharge = (): number => {
  return COD_MARKUP_AMOUNT;
};

/**
 * Format payment method display text
 * @param method - Payment method
 * @returns Formatted display text
 */
export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  switch (method) {
    case "PHONEPE":
      return "PhonePe";
    case "RAZORPAY":
      return "Razorpay";
    case "COD":
      return "Cash on Delivery";
  }
};

/**
 * Get payment method description for UI
 * @param method - Payment method
 * @returns Description text
 */
export const getPaymentMethodDescription = (method: PaymentMethod): string => {
  switch (method) {
    case "PHONEPE":
      return "UPI, Cards, Wallets";
    case "RAZORPAY":
      return "UPI, Cards, NetBanking, Wallets";
    case "COD":
      return `COD surcharge of ₹${COD_MARKUP_AMOUNT} will be added`;
  }
};

/**
 * Get payment method icon name
 * @param method - Payment method
 * @returns Icon identifier
 */
export const getPaymentMethodIcon = (method: PaymentMethod): string => {
  switch (method) {
    case "PHONEPE":
      return "phonepe";
    case "RAZORPAY":
      return "razorpay";
    case "COD":
      return "truck";
  }
};
