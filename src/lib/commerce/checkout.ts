/**
 * Modular checkout boundary.
 *
 * No payment provider has been chosen yet, so the active provider is
 * `unconfiguredCheckout`, which never takes payment and never collects card
 * details. When a provider is selected (e.g. Shopify Checkout, Stripe Checkout,
 * a headless platform), implement `CheckoutProvider` in a new file and export
 * it as `checkoutProvider` below. Card data must only ever be handled by the
 * provider's hosted page / SDK — never by this site's own forms.
 */
export interface CheckoutLine {
  productId: string;
  variantId: string;
  quantity: number;
  /** e.g. selected phone model, for model-specific products */
  meta?: Record<string, string>;
}

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "unavailable"; reason: string };

export interface CheckoutProvider {
  id: string;
  name: string;
  configured: boolean;
  beginCheckout(lines: CheckoutLine[]): Promise<CheckoutResult>;
}

export const unconfiguredCheckout: CheckoutProvider = {
  id: "unconfigured",
  name: "Not configured",
  configured: false,
  async beginCheckout() {
    return {
      status: "unavailable",
      reason: "Checkout is not yet available. A payment provider has not been configured.",
    };
  },
};

export const checkoutProvider: CheckoutProvider = unconfiguredCheckout;
