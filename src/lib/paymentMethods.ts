/**
 * Payment method utilities
 * Handles pricing calculations for different payment methods
 */

export type PaymentMethod = "PHONEPE" | "COD";

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
  if (method === "COD") return "Cash on Delivery";
  return "Pay Online with PhonePe";
};

/**
 * Get payment method description for UI
 * @param method - Payment method
 * @returns Description text
 */
export const getPaymentMethodDescription = (method: PaymentMethod): string => {
  if (method === "COD") {
    return `COD surcharge of ₹${COD_MARKUP_AMOUNT} will be added`;
  }
  return "Instant payment with PhonePe";
};
