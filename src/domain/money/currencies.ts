/**
 * Currencies the product is allowed to operate in.
 *
 * Narrow this list to what the product actually supports: an explicit union is
 * what lets the type system reject an unsupported code at the boundary instead
 * of discovering it in production data.
 */

export const SUPPORTED_CURRENCIES = ["USD", "EUR"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(code: string): code is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(code);
}
