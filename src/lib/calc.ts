import type { Estimate, LineItem } from "./types";

export function lineTotal(item: LineItem) {
  return item.quantity * item.unitPrice;
}

export function subtotal(items: LineItem[]) {
  return items.reduce((sum, i) => sum + lineTotal(i), 0);
}

export function documentTotals(
  items: LineItem[],
  discount: number,
  taxPercent: number,
  otherCharges: number = 0
) {
  const sub = subtotal(items);
  const afterDiscount = Math.max(sub - discount, 0);
  const tax = afterDiscount * (taxPercent / 100);
  const grandTotal = afterDiscount + tax + otherCharges;
  return { subtotal: sub, discount, tax, otherCharges, grandTotal };
}

export function estimateTotals(estimate: Pick<Estimate, "materials" | "labour" | "otherCosts" | "markupPercent">) {
  const materialCost = estimate.materials.reduce((s, m) => s + m.quantity * m.unitPrice, 0);
  const labourCost = estimate.labour.reduce((s, l) => s + l.workers * l.ratePerDay * l.days, 0);
  const otherCost = estimate.otherCosts.reduce((s, o) => s + o.amount, 0);
  const totalCost = materialCost + labourCost + otherCost;
  const markup = totalCost * (estimate.markupPercent / 100);
  const finalPrice = totalCost + markup;
  return { materialCost, labourCost, otherCost, totalCost, markup, finalPrice };
}

export function formatMoney(amount: number, currency: string = "UGX") {
  const rounded = Math.round(amount);
  return `${currency} ${rounded.toLocaleString("en-US")}`;
}
