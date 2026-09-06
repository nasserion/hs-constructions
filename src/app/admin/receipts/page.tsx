"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Receipt as ReceiptIcon, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/store";
import { formatMoney } from "@/lib/calc";
import type { Customer, Receipt } from "@/lib/types";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  function refresh() {
    setReceipts(db.receipts.all());
    setCustomers(db.customers.all());
  }
  useEffect(refresh, []);

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name || "—";

  function remove(id: string) {
    if (!confirm("Delete this receipt?")) return;
    db.receipts.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Receipts"
        description="Confirm payments received from customers."
        actions={
          <Link href="/admin/receipts/new">
            <Button size="sm">
              <Plus size={16} /> New Receipt
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        {receipts.length === 0 ? (
          <EmptyState
            icon={ReceiptIcon}
            title="No receipts yet"
            description="Receipts recorded here confirm payments against invoices."
            action={
              <Link href="/admin/receipts/new">
                <Button size="sm">
                  <Plus size={16} /> New Receipt
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
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {receipts.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      <Link href={`/admin/receipts/${r.id}`} className="hover:text-rust">
                        {r.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{customerName(r.customerId)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{formatMoney(r.amountReceived)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.paymentMethod}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(r.id)} className="text-steel hover:text-bad p-1" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
