// Shared domain types. Kept framework-agnostic so a real backend/DB can
// implement the same shapes later without touching UI code.

export type ID = string;

export type DocStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface LineItem {
  id: ID;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface Customer {
  id: ID;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export type ProjectStatus =
  | "inquiry"
  | "quotation"
  | "approved"
  | "planning"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export interface ProjectRecord {
  id: ID;
  name: string;
  customerId?: ID;
  location?: string;
  type?: string;
  description?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  status: ProjectStatus;
  budget?: number;
  amountPaid?: number;
  notes?: string;
  createdAt: string;
}

export interface PortfolioProject {
  id: ID;
  name: string;
  category: "Residential" | "Commercial" | "Renovation" | "Structural" | "Civil Works" | "Other";
  description: string;
  location?: string;
  status: "Completed" | "In Progress" | "Planned";
  completionDate?: string;
  services?: string[];
  // Compressed base64 data URLs, stored directly in localStorage since there
  // is no file/object storage backend yet. Keep these few and small — see
  // the note in lib/images.ts about localStorage size limits.
  images?: string[];
  createdAt: string;
}

export interface Service {
  id: ID;
  title: string;
  category: string;
  description: string;
  order: number;
}

export interface QuoteRequest {
  id: ID;
  reference: string;
  fullName: string;
  phone: string;
  email?: string;
  projectType: string;
  serviceRequired: string;
  projectLocation?: string;
  estimatedSize?: string;
  description: string;
  preferredStartDate?: string;
  budgetRange?: string;
  additionalNotes?: string;
  status: "new" | "reviewed" | "converted" | "archived";
  createdAt: string;
}

export interface Quotation {
  id: ID;
  number: string;
  date: string;
  validityDays: number;
  customerId: ID;
  projectName: string;
  projectLocation?: string;
  projectDescription?: string;
  items: LineItem[];
  discount: number; // flat amount
  taxPercent: number;
  otherCharges: number;
  status: DocStatus;
  notes?: string;
  createdAt: string;
  sourceQuoteRequestId?: ID;
}

export interface Invoice {
  id: ID;
  number: string;
  date: string;
  dueDate?: string;
  customerId: ID;
  projectName: string;
  items: LineItem[];
  discount: number;
  taxPercent: number;
  amountPaid: number;
  paymentTerms?: string;
  notes?: string;
  status: DocStatus;
  createdAt: string;
  sourceQuotationId?: ID;
}

export interface Receipt {
  id: ID;
  number: string;
  date: string;
  customerId: ID;
  projectName?: string;
  amountReceived: number;
  paymentMethod: string;
  reference?: string;
  remainingBalance?: number;
  description?: string;
  createdAt: string;
  sourceInvoiceId?: ID;
}

export interface MaterialCostItem {
  id: ID;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface LabourCostItem {
  id: ID;
  category: string;
  workers: number;
  ratePerDay: number;
  days: number;
}

export interface Estimate {
  id: ID;
  title: string;
  date: string;
  customerId?: ID;
  materials: MaterialCostItem[];
  labour: LabourCostItem[];
  otherCosts: { id: ID; label: string; amount: number }[];
  markupPercent: number;
  notes?: string;
  createdAt: string;
}

export type WorkforceRole =
  | "Mason"
  | "Carpenter"
  | "Electrician"
  | "Plumber"
  | "Painter"
  | "Steel Fixer"
  | "Tiler"
  | "General Builder"
  | "Porter"
  | "Other";

export interface WorkforceMember {
  id: ID;
  name: string;
  role: WorkforceRole;
  phone?: string;
  skillCategory?: string;
  availability: "Available" | "Assigned" | "Unavailable";
  assignedProjectId?: ID;
  notes?: string;
  createdAt: string;
}

export interface Material {
  id: ID;
  name: string;
  category: string;
  unit: string;
  currentPrice: number;
  supplier?: string;
  notes?: string;
}

export interface SiteSettings {
  companyName: string;
  companyDescription: string;
  documentPrefix: {
    quotation: string;
    invoice: string;
    receipt: string;
  };
  defaultValidityDays: number;
  defaultTaxPercent: number;
  paymentTerms: string;
  // Compressed base64 data URL for the homepage hero background photo.
  // Falls back to the dark blueprint-grid background when unset.
  heroImage?: string;
}
