"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FolderKanban,
  Inbox,
  FileText,
  Receipt as ReceiptIcon,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { db } from "@/lib/store";
import { documentTotals, formatMoney } from "@/lib/calc";
import type { Customer, Invoice, ProjectRecord, QuoteRequest, Quotation } from "@/lib/types";

export default function AdminDashboard() {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  useEffect(() => {
    setQuoteRequests(db.quoteRequests.all());
    setQuotations(db.quotations.all());
    setInvoices(db.invoices.all());
    setCustomers(db.customers.all());
    setProjects(db.projects.all());
  }, []);

  const customerName = (id?: string) => customers.find((c) => c.id === id)?.name || "—";

  const activeProjects = projects.filter((p) => !["completed", "cancelled"].includes(p.status)).length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const pendingRequests = quoteRequests.filter((r) => r.status === "new").length;
  const acceptedQuotations = quotations.filter((q) => q.status === "accepted").length;

  const outstanding = invoices.reduce((sum, inv) => {
    const totals = documentTotals(inv.items, inv.discount, inv.taxPercent, 0);
    const balance = totals.grandTotal - inv.amountPaid;
    return sum + Math.max(balance, 0);
  }, 0);

  const totalPayments = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of business activity across the portal." />

      <div className="p-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total customers" value={customers.length} icon={Users} />
        <StatCard label="Active projects" value={activeProjects} icon={FolderKanban} />
        <StatCard label="Completed projects" value={completedProjects} icon={CheckCircle2} tone="good" />
        <StatCard label="Pending quote requests" value={pendingRequests} icon={Inbox} tone="warn" />
        <StatCard label="Quotations" value={quotations.length} icon={FileText} />
        <StatCard label="Accepted quotations" value={acceptedQuotations} icon={CheckCircle2} tone="good" />
        <StatCard label="Outstanding invoices" value={formatMoney(outstanding)} icon={ReceiptIcon} tone="warn" />
        <StatCard label="Total payments" value={formatMoney(totalPayments)} icon={ReceiptIcon} tone="good" />
      </div>

      <div className="px-6 pb-10 grid lg:grid-cols-2 gap-6">
        <section className="bg-white border border-line">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl">Recent quote requests</h2>
            <Link href="/admin/quote-requests" className="text-xs text-rust hover:underline">
              View all
            </Link>
          </div>
          {quoteRequests.length === 0 ? (
            <EmptyState icon={Inbox} title="No quote requests yet" description="Requests submitted from the public website will appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {quoteRequests.slice(0, 5).map((r) => (
                <li key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.fullName}</p>
                    <p className="text-xs text-steel truncate">{r.serviceRequired} · {r.reference}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-line">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl">Recent quotations</h2>
            <Link href="/admin/quotations" className="text-xs text-rust hover:underline">
              View all
            </Link>
          </div>
          {quotations.length === 0 ? (
            <EmptyState icon={FileText} title="No quotations yet" description="Create your first quotation to see it here." />
          ) : (
            <ul className="divide-y divide-line">
              {quotations.slice(0, 5).map((q) => (
                <li key={q.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{q.number} — {customerName(q.customerId)}</p>
                    <p className="text-xs text-steel truncate">{q.projectName}</p>
                  </div>
                  <StatusBadge status={q.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-line">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl">Active projects</h2>
            <Link href="/admin/projects" className="text-xs text-rust hover:underline">
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState icon={FolderKanban} title="No projects yet" description="Approved quotations can be tracked here as projects." />
          ) : (
            <ul className="divide-y divide-line">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-steel truncate">{customerName(p.customerId)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-line">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl">Recent customers</h2>
            <Link href="/admin/customers" className="text-xs text-rust hover:underline">
              View all
            </Link>
          </div>
          {customers.length === 0 ? (
            <EmptyState icon={Users} title="No customers yet" description="Customers are added automatically from quote requests, or manually." />
          ) : (
            <ul className="divide-y divide-line">
              {customers.slice(0, 5).map((c) => (
                <li key={c.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-steel">{c.phone}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
