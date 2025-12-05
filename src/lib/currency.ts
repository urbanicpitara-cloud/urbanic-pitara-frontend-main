/**
 * Get the currency symbol for a given currency code
 * @param currencyCode - ISO 4217 currency code (e.g., 'INR', 'USD', 'EUR')
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode?: string): string {
    if (!currencyCode) return '₹'; // Default to INR

    const currencyMap: Record<string, string> = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CNY: '¥',
        AUD: 'A$',
        CAD: 'C$',
        CHF: 'Fr',
        SGD: 'S$',
        AED: 'د.إ',
        SAR: '﷼',
    };

    return currencyMap[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Format price with currency symbol
 * @param amount - Price amount
 * @param currencyCode - ISO 4217 currency code
 * @returns Formatted price string
 */
export function formatPrice(amount: number | string, currencyCode?: string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${numAmount.toFixed(2)}`;
}
