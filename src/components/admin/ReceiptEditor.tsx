"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import { downloadReceiptPdf } from "@/lib/pdf";
import type { Customer, Receipt } from "@/lib/types";

const METHODS = ["Cash", "Mobile Money", "Bank Transfer", "Cheque", "Other"];

export function ReceiptEditor({ existing }: { existing?: Receipt }) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState(existing?.customerId || "");
  const [projectName, setProjectName] = useState(existing?.projectName || "");
  const [date, setDate] = useState(existing?.date || new Date().toISOString().slice(0, 10));
  const [amountReceived, setAmountReceived] = useState(existing?.amountReceived ?? 0);
  const [paymentMethod, setPaymentMethod] = useState(existing?.paymentMethod || "Cash");
  const [reference, setReference] = useState(existing?.reference || "");
  const [remainingBalance, setRemainingBalance] = useState(existing?.remainingBalance ?? 0);
  const [description, setDescription] = useState(existing?.description || "");
  const [savedId, setSavedId] = useState(existing?.id);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setCustomers(db.customers.all()), []);

  function buildRecord(): Receipt | null {
    if (!customerId) {
      setMessage("Please select a customer.");
      return null;
    }
    return {
      id: savedId || uid(),
      number: existing?.number || db.nextNumber("receipt"),
      date,
      customerId,
      projectName: projectName.trim() || undefined,
      amountReceived: Number(amountReceived) || 0,
      paymentMethod,
      reference: reference.trim() || undefined,
      remainingBalance: Number(remainingBalance) || 0,
      description: description.trim() || undefined,
      createdAt: existing?.createdAt || new Date().toISOString(),
      sourceInvoiceId: existing?.sourceInvoiceId,
    };
  }

  function save() {
    setMessage(null);
    const record = buildRecord();
    if (!record) return;
    db.receipts.upsert(record);
    setSavedId(record.id);
    setMessage("Receipt saved.");
    if (!existing) router.replace(`/admin/receipts/${record.id}`);
  }

  function downloadPdf() {
    const record = buildRecord();
    if (!record) return;
    db.receipts.upsert(record);
    setSavedId(record.id);
    const customer = customers.find((c) => c.id === record.customerId);
    downloadReceiptPdf(record, customer);
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="bg-white border border-line p-5 space-y-4">
        {message && (
          <div className="border border-rust/30 bg-rust/5 text-rust text-sm px-4 py-2.5 rounded-sm">{message}</div>
        )}
        <div>
          <label className="text-sm font-medium">Customer *</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
          >
            <option value="">Select customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.phone}
              </option>
            ))}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Project</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Amount received *</label>
            <input
              type="number"
              min={0}
              value={amountReceived}
              onChange={(e) => setAmountReceived(Math.max(0, Number(e.target.value)))}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Reference</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Remaining balance</label>
            <input
              type="number"
              min={0}
              value={remainingBalance}
              onChange={(e) => setRemainingBalance(Math.max(0, Number(e.target.value)))}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={save} className="flex-1">
            <Save size={16} /> Save Receipt
          </Button>
          <Button onClick={downloadPdf} variant="outline" className="flex-1">
            <Download size={16} /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
