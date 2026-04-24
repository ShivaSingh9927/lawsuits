// Single source of truth for order pricing.
// Used by the checkout UI (to display) and by the /api/orders route
// (to authoritatively recompute and validate against what the client sent).
//
// If you need to change shipping cost, coupon rules, or tax rules, change
// them here only - never duplicate the formula elsewhere.

import { computeTaxBreakdown, TaxLineInput, TaxLineBreakdown } from "./tax";

// Shipping policy (canonical values shown to the customer).
export const FREE_SHIPPING_THRESHOLD = 3500;
export const SHIPPING_COST = 100;

export type PricingLine = TaxLineInput;

export type CouponType = "percentage" | "fixed" | "free_shipping";

export interface AppliedCoupon {
  type: CouponType;
  value: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  breakdown: TaxLineBreakdown[];
  freeShipping: boolean;
}

/**
 * Compute all order totals deterministically from line items and an optional
 * coupon. Both the browser and the server must call this with the same inputs
 * to arrive at the same total.
 */
export function computeOrderTotals(
  lines: PricingLine[],
  coupon: AppliedCoupon | null
): OrderTotals {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);

  let discount = 0;
  let freeShipping = false;

  if (coupon) {
    if (coupon.type === "percentage") {
      discount = Math.round(subtotal * (coupon.value / 100));
    } else if (coupon.type === "fixed") {
      discount = coupon.value;
    } else if (coupon.type === "free_shipping") {
      freeShipping = true;
    }
  }
  discount = Math.min(Math.max(discount, 0), subtotal);

  const baseShipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const shipping = freeShipping ? 0 : baseShipping;

  const { breakdown, tax } = computeTaxBreakdown(lines, discount);

  const total = subtotal - discount + shipping + tax;

  return { subtotal, discount, shipping, tax, total, breakdown, freeShipping };
}

/**
 * Compare two totals (in rupees). A tolerance of 1 absorbs rounding drift
 * that can happen when the UI and server evaluate the tax breakdown in
 * slightly different orders.
 */
export function totalsMatch(
  a: Pick<OrderTotals, "subtotal" | "discount" | "shipping" | "tax" | "total">,
  b: Pick<OrderTotals, "subtotal" | "discount" | "shipping" | "tax" | "total">,
  tolerance = 1
): boolean {
  return (
    Math.abs(a.subtotal - b.subtotal) <= tolerance &&
    Math.abs(a.discount - b.discount) <= tolerance &&
    Math.abs(a.shipping - b.shipping) <= tolerance &&
    Math.abs(a.tax - b.tax) <= tolerance &&
    Math.abs(a.total - b.total) <= tolerance
  );
}
