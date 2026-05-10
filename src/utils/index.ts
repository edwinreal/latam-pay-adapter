/**
 * Converts decimal amount to cents (integer)
 * @param amount - Amount in decimals (e.g. 10.50)
 * @returns Amount in cents (e.g. 1050)
 */
export const toCents = (amount: number): number => {
    return Math.round(amount * 100);
};

/**
 * Formats a number to a specific currency string
 */
export const formatCurrency = (amount: number, currency: string, locale: string = 'es-CO'): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
};
