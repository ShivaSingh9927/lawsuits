// GST calculation helpers shared by client checkout UI and server order API.
//
// Rules:
//   - If product name contains "leather" (case-insensitive) -> 18%
//   - Else if unit price <= 1000 -> 5%
//   - Else (unit price > 1000) -> 12%
//
// Tax base per line = post-discount net (coupon discount allocated
// proportionally across lines by gross value).

export interface TaxLineInput {
  name: string;
  unitPrice: number;
  qty: number;
}

export interface TaxLineBreakdown {
  name: string;
  unitPrice: number;
  qty: number;
  gross: number;
  net: number;
  rate: number;
  tax: number;
}

export function getGstRate(name: string, unitPrice: number): number {
  if (/leather/i.test(name || "")) return 0.18;
  if (unitPrice <= 1000) return 0.05;
  return 0.12;
}

/**
 * Compute per-line GST with proportional discount allocation.
 * Ensures sum(net) === subtotal - discountTotal (last line absorbs rounding drift).
 */
export function computeTaxBreakdown(
  lines: TaxLineInput[],
  discountTotal: number
): { breakdown: TaxLineBreakdown[]; tax: number } {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const safeDiscount = Math.min(Math.max(discountTotal || 0, 0), subtotal);

  const breakdown: TaxLineBreakdown[] = [];
  let allocatedDiscount = 0;

  lines.forEach((l, idx) => {
    const gross = l.unitPrice * l.qty;
    let lineDiscount: number;
    if (idx === lines.length - 1) {
      lineDiscount = safeDiscount - allocatedDiscount;
    } else if (subtotal > 0) {
      lineDiscount = Math.round((safeDiscount * gross) / subtotal);
      allocatedDiscount += lineDiscount;
    } else {
      lineDiscount = 0;
    }
    const net = Math.max(0, gross - lineDiscount);
    const rate = getGstRate(l.name, l.unitPrice);
    const tax = Math.round(net * rate);
    breakdown.push({
      name: l.name,
      unitPrice: l.unitPrice,
      qty: l.qty,
      gross,
      net,
      rate,
      tax,
    });
  });

  const tax = breakdown.reduce((s, b) => s + b.tax, 0);
  return { breakdown, tax };
}

export function computeOrderTax(
  lines: TaxLineInput[],
  discountTotal: number
): number {
  return computeTaxBreakdown(lines, discountTotal).tax;
}
