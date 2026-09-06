"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Trash2, Copy } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import { documentTotals, formatMoney } from "@/lib/calc";
import type { Customer, Quotation } from "@/lib/types";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  function refresh() {
    setQuotations(db.quotations.all());
    setCustomers(db.customers.all());
  }
  useEffect(refresh, []);

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name || "—";

  function duplicate(q: Quotation) {
    const copy: Quotation = {
      ...q,
      id: uid(),
      number: db.nextNumber("quotation"),
      status: "draft",
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      items: q.items.map((i) => ({ ...i, id: uid() })),
    };
    db.quotations.upsert(copy);
    refresh();
  }

  function remove(id: string) {
    if (!confirm("Delete this quotation?")) return;
    db.quotations.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Quotations"
        description="Create, edit and track quotations sent to customers."
        actions={
          <Link href="/admin/quotations/new">
            <Button size="sm">
              <Plus size={16} /> New Quotation
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        {quotations.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quotations yet"
            description="Create a quotation manually, or convert a quote request into one."
            action={
              <Link href="/admin/quotations/new">
                <Button size="sm">
                  <Plus size={16} /> New Quotation
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
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {quotations.map((q) => {
                  const totals = documentTotals(q.items, q.discount, q.taxPercent, q.otherCharges);
                  return (
                    <tr key={q.id}>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        <Link href={`/admin/quotations/${q.id}`} className="hover:text-rust">
                          {q.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{customerName(q.customerId)}</td>
                      <td className="px-4 py-3 max-w-[180px] truncate">{q.projectName}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">{formatMoney(totals.grandTotal)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                        <button onClick={() => duplicate(q)} className="text-steel hover:text-rust p-1" aria-label="Duplicate">
                          <Copy size={15} />
                        </button>
                        <button onClick={() => remove(q.id)} className="text-steel hover:text-bad p-1" aria-label="Delete">
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
