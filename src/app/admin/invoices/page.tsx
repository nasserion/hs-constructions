"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/store";
import { documentTotals, formatMoney } from "@/lib/calc";
import type { Customer, Invoice } from "@/lib/types";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  function refresh() {
    setInvoices(db.invoices.all());
    setCustomers(db.customers.all());
  }
  useEffect(refresh, []);

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name || "—";

  function remove(id: string) {
    if (!confirm("Delete this invoice?")) return;
    db.invoices.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Track billing and payment status for every project."
        actions={
          <Link href="/admin/invoices/new">
            <Button size="sm">
              <Plus size={16} /> New Invoice
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        {invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Create an invoice manually, or convert an accepted quotation."
            action={
              <Link href="/admin/invoices/new">
                <Button size="sm">
                  <Plus size={16} /> New Invoice
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="bg-white border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-steel uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Number</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Balance</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {invoices.map((inv) => {
                  const totals = documentTotals(inv.items, inv.discount, inv.taxPercent, 0);
                  const balance = totals.grandTotal - inv.amountPaid;
                  return (
                    <tr key={inv.id}>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        <Link href={`/admin/invoices/${inv.id}`} className="hover:text-rust">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{customerName(inv.customerId)}</td>
                      <td className="px-4 py-3 max-w-[180px] truncate">{inv.projectName}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">{formatMoney(totals.grandTotal)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">{formatMoney(balance)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => remove(inv.id)} className="text-steel hover:text-bad p-1" aria-label="Delete">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
