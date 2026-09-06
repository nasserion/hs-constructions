"use client";

// Lightweight localStorage-backed data layer.
// Every function here is written so a real backend/API can be dropped in
// later by swapping the implementation without changing call sites
// (each function is already async-shaped where it matters).

import type {
  Customer,
  Estimate,
  Invoice,
  Material,
  PortfolioProject,
  ProjectRecord,
  QuoteRequest,
  Quotation,
  Receipt,
  Service,
  SiteSettings,
  WorkforceMember,
} from "./types";

const KEYS = {
  customers: "hsc_customers",
  projects: "hsc_projects",
  portfolio: "hsc_portfolio",
  services: "hsc_services",
  quoteRequests: "hsc_quote_requests",
  quotations: "hsc_quotations",
  invoices: "hsc_invoices",
  receipts: "hsc_receipts",
  estimates: "hsc_estimates",
  workforce: "hsc_workforce",
  materials: "hsc_materials",
  settings: "hsc_settings",
  seeded: "hsc_seeded_v1",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function nextDocNumber(prefix: string, existing: { number: string }[]) {
  const count = existing.length + 1;
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(count).padStart(4, "0")}`;
}

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "H S Constructions",
  companyDescription:
    "Professional construction, building, engineering consultation and site survey services.",
  documentPrefix: { quotation: "QUO", invoice: "INV", receipt: "RCT" },
  defaultValidityDays: 30,
  defaultTaxPercent: 0,
  paymentTerms: "Payment due within 14 days of invoice date, unless otherwise agreed in writing.",
};

const DEFAULT_SERVICES: Omit<Service, "id">[] = [
  { title: "Building Construction", category: "Building Construction", order: 1, description: "Residential, commercial, office, shop, apartment and institutional building construction." },
  { title: "Structural & Civil Construction", category: "Structural & Civil", order: 2, description: "Structural works, concrete, foundations, masonry, reinforcement, roofing and general civil construction." },
  { title: "Engineering Consultation", category: "Consultation", order: 3, description: "Professional consultation for construction and engineering requirements at any project stage." },
  { title: "Site Survey", category: "Survey", order: 4, description: "Site survey services carried out before construction and during project planning." },
  { title: "Renovation & Remodeling", category: "Renovation", order: 5, description: "Renovations, repairs, remodeling, extensions and upgrades to existing structures." },
  { title: "Construction Finishing", category: "Finishing", order: 6, description: "Plastering, flooring, painting, ceiling works, tiling and other finishing works." },
  { title: "General Construction Works", category: "General", order: 7, description: "Construction requirements handled according to each client's specific project." },
];

// Material names/units are generic industry facts, not company-specific claims.
// Prices are left at 0 and clearly need to be set by the admin.
const DEFAULT_MATERIALS: Omit<Material, "id">[] = [
  { name: "Cement", category: "Structural", unit: "bag (50kg)", currentPrice: 0 },
  { name: "River Sand", category: "Structural", unit: "tonne", currentPrice: 0 },
  { name: "Aggregate (Hardcore)", category: "Structural", unit: "tonne", currentPrice: 0 },
  { name: "Bricks / Blocks", category: "Structural", unit: "piece", currentPrice: 0 },
  { name: "Steel / Rebar", category: "Structural", unit: "kg", currentPrice: 0 },
  { name: "Timber", category: "Structural", unit: "piece", currentPrice: 0 },
  { name: "Roofing Sheets", category: "Roofing", unit: "sheet", currentPrice: 0 },
  { name: "Floor Tiles", category: "Finishing", unit: "sq. metre", currentPrice: 0 },
  { name: "Paint", category: "Finishing", unit: "litre", currentPrice: 0 },
];

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (read(KEYS.seeded, false)) return;
  write(KEYS.services, DEFAULT_SERVICES.map((s) => ({ ...s, id: uid() })));
  write(KEYS.materials, DEFAULT_MATERIALS.map((m) => ({ ...m, id: uid() })));
  write(KEYS.settings, DEFAULT_SETTINGS);
  write(KEYS.customers, []);
  write(KEYS.projects, []);
  write(KEYS.portfolio, []);
  write(KEYS.quoteRequests, []);
  write(KEYS.quotations, []);
  write(KEYS.invoices, []);
  write(KEYS.receipts, []);
  write(KEYS.estimates, []);
  write(KEYS.workforce, []);
  write(KEYS.seeded, true);
}

function collection<T extends { id: string }>(key: string) {
  return {
    all(): T[] {
      return read<T[]>(key, []);
    },
    get(id: string): T | undefined {
      return read<T[]>(key, []).find((x) => x.id === id);
    },
    upsert(item: T): T {
      const list = read<T[]>(key, []);
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx >= 0) list[idx] = item;
      else list.unshift(item);
      write(key, list);
      return item;
    },
    remove(id: string) {
      const list = read<T[]>(key, []).filter((x) => x.id !== id);
      write(key, list);
    },
  };
}

export const db = {
  customers: collection<Customer>(KEYS.customers),
  projects: collection<ProjectRecord>(KEYS.projects),
  portfolio: collection<PortfolioProject>(KEYS.portfolio),
  services: collection<Service>(KEYS.services),
  quoteRequests: collection<QuoteRequest>(KEYS.quoteRequests),
  quotations: collection<Quotation>(KEYS.quotations),
  invoices: collection<Invoice>(KEYS.invoices),
  receipts: collection<Receipt>(KEYS.receipts),
  estimates: collection<Estimate>(KEYS.estimates),
  workforce: collection<WorkforceMember>(KEYS.workforce),
  materials: collection<Material>(KEYS.materials),
  settings: {
    get(): SiteSettings {
      return read<SiteSettings>(KEYS.settings, DEFAULT_SETTINGS);
    },
    set(s: SiteSettings) {
      write(KEYS.settings, s);
    },
  },
  nextNumber(kind: "quotation" | "invoice" | "receipt") {
    const settings = read<SiteSettings>(KEYS.settings, DEFAULT_SETTINGS);
    if (kind === "quotation") return nextDocNumber(settings.documentPrefix.quotation, read(KEYS.quotations, []));
    if (kind === "invoice") return nextDocNumber(settings.documentPrefix.invoice, read(KEYS.invoices, []));
    return nextDocNumber(settings.documentPrefix.receipt, read(KEYS.receipts, []));
  },
};
