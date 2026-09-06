"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, ArrowRight, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import type { Customer, QuoteRequest } from "@/lib/types";

export default function QuoteRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [selected, setSelected] = useState<QuoteRequest | null>(null);

  function refresh() {
    setRequests(db.quoteRequests.all());
  }
  useEffect(refresh, []);

  function markReviewed(r: QuoteRequest) {
    db.quoteRequests.upsert({ ...r, status: "reviewed" });
    refresh();
  }

  function remove(id: string) {
    if (!confirm("Delete this quote request?")) return;
    db.quoteRequests.remove(id);
    setSelected(null);
    refresh();
  }

  function convertToQuotation(r: QuoteRequest) {
    // Find or create a matching customer
    let customer = db.customers.all().find((c) => c.phone === r.phone);
    if (!customer) {
      customer = {
        id: uid(),
        name: r.fullName,
        phone: r.phone,
        email: r.email,
        address: r.projectLocation,
        createdAt: new Date().toISOString(),
      } as Customer;
      db.customers.upsert(customer);
    }
    db.quoteRequests.upsert({ ...r, status: "converted" });
    // Stash context for the quotation builder via query params
    const params = new URLSearchParams({
      customerId: customer.id,
      projectName: r.serviceRequired,
      projectLocation: r.projectLocation || "",
      projectDescription: r.description,
      sourceQuoteRequestId: r.id,
    });
    router.push(`/admin/quotations/new?${params.toString()}`);
  }

  return (
    <div>
      <PageHeader title="Quote Requests" description="Requests submitted through the public website." />

      <div className="p-6">
        {requests.length === 0 ? (
          <EmptyState icon={Inbox} title="No quote requests yet" description="Submissions from the /quote page will appear here." />
        ) : (
          <div className="bg-white border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-steel uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      <button className="hover:text-rust" onClick={() => setSelected(r)}>
                        {r.reference}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.fullName}</td>
                    <td className="px-4 py-3 whitespace-nowrap max-w-[180px] truncate">{r.serviceRequired}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                      {r.status === "new" && (
                        <button onClick={() => markReviewed(r)} className="text-xs text-steel hover:text-rust px-2 py-1">
                          Mark reviewed
                        </button>
                      )}
                      {r.status !== "converted" && (
                        <button
                          onClick={() => convertToQuotation(r)}
                          className="text-xs text-rust hover:underline px-2 py-1 inline-flex items-center gap-1"
                        >
                          Convert to quotation <ArrowRight size={12} />
                        </button>
                      )}
                      <button onClick={() => remove(r.id)} className="text-steel hover:text-bad p-1 align-middle" aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.reference || ""}>
        {selected && (
          <div className="space-y-3 text-sm">
            <Row label="Full name" value={selected.fullName} />
            <Row label="Phone" value={selected.phone} />
            <Row label="Email" value={selected.email || "—"} />
            <Row label="Project type" value={selected.projectType} />
            <Row label="Service required" value={selected.serviceRequired} />
            <Row label="Location" value={selected.projectLocation || "—"} />
            <Row label="Estimated size" value={selected.estimatedSize || "—"} />
            <Row label="Budget range" value={selected.budgetRange || "—"} />
            <Row label="Preferred start date" value={selected.preferredStartDate || "—"} />
            <div>
              <p className="text-xs font-medium text-steel uppercase tracking-wide">Description</p>
              <p className="mt-1 whitespace-pre-wrap">{selected.description}</p>
            </div>
            {selected.additionalNotes && (
              <div>
                <p className="text-xs font-medium text-steel uppercase tracking-wide">Additional notes</p>
                <p className="mt-1 whitespace-pre-wrap">{selected.additionalNotes}</p>
              </div>
            )}
            {selected.status !== "converted" && (
              <Button onClick={() => convertToQuotation(selected)} className="w-full mt-2">
                Convert to Quotation
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line/60 pb-2">
      <span className="text-steel">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
