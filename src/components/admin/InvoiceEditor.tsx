"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Download, Save, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import { documentTotals, formatMoney } from "@/lib/calc";
import { downloadInvoicePdf } from "@/lib/pdf";
import type { Customer, DocStatus, Invoice, LineItem } from "@/lib/types";

const STATUSES: DocStatus[] = ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"];

function blankItem(): LineItem {
  return { id: uid(), description: "", unit: "unit", quantity: 1, unitPrice: 0 };
}

export function InvoiceEditor({ existing }: { existing?: Invoice }) {
  const router = useRouter();
  const settings = db.settings.get();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState(existing?.customerId || "");
  const [projectName, setProjectName] = useState(existing?.projectName || "");
  const [date, setDate] = useState(existing?.date || new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(existing?.dueDate || "");
  const [items, setItems] = useState<LineItem[]>(existing?.items?.length ? existing.items : [blankItem()]);
  const [discount, setDiscount] = useState(existing?.discount ?? 0);
  const [taxPercent, setTaxPercent] = useState(existing?.taxPercent ?? settings.defaultTaxPercent);
  const [amountPaid, setAmountPaid] = useState(existing?.amountPaid ?? 0);
  const [paymentTerms, setPaymentTerms] = useState(existing?.paymentTerms || settings.paymentTerms);
  const [status, setStatus] = useState<DocStatus>(existing?.status || "draft");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [savedId, setSavedId] = useState(existing?.id);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setCustomers(db.customers.all()), []);

  const totals = documentTotals(items, discount, taxPercent, 0);
  const balance = totals.grandTotal - amountPaid;

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function addItem() {
    setItems((list) => [...list, blankItem()]);
  }
  function removeItem(id: string) {
    setItems((list) => (list.length > 1 ? list.filter((i) => i.id !== id) : list));
  }

  function buildRecord(): Invoice | null {
    if (!customerId) {
      setMessage("Please select a customer.");
      return null;
    }
    if (!projectName.trim()) {
      setMessage("Please enter a project name.");
      return null;
    }
    return {
      id: savedId || uid(),
      number: existing?.number || db.nextNumber("invoice"),
      date,
      dueDate: dueDate || undefined,
      customerId,
      projectName: projectName.trim(),
      items,
      discount: Number(discount) || 0,
      taxPercent: Number(taxPercent) || 0,
      amountPaid: Number(amountPaid) || 0,
      paymentTerms: paymentTerms.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
      createdAt: existing?.createdAt || new Date().toISOString(),
      sourceQuotationId: existing?.sourceQuotationId,
    };
  }

  function save() {
    setMessage(null);
    const record = buildRecord();
    if (!record) return;
    db.invoices.upsert(record);
    setSavedId(record.id);
    setMessage("Invoice saved.");
    if (!existing) router.replace(`/admin/invoices/${record.id}`);
  }

  function downloadPdf() {
    const record = buildRecord();
    if (!record) return;
    db.invoices.upsert(record);
    setSavedId(record.id);
    const customer = customers.find((c) => c.id === record.customerId);
    downloadInvoicePdf(record, customer);
  }

  function recordPayment() {
    const record = buildRecord();
    if (!record) return;
    db.invoices.upsert(record);
    const receiptNumber = db.nextNumber("receipt");
    const receipt = {
      id: uid(),
      number: receiptNumber,
      date: new Date().toISOString().slice(0, 10),
      customerId: record.customerId,
      projectName: record.projectName,
      amountReceived: 0,
      paymentMethod: "Cash",
      remainingBalance: balance,
      createdAt: new Date().toISOString(),
      sourceInvoiceId: record.id,
    };
    db.receipts.upsert(receipt);
    router.push(`/admin/receipts/${receipt.id}`);
  }

  const customer = customers.find((c) => c.id === customerId);

  return (
    <div className="grid xl:grid-cols-[1fr_320px] gap-6 p-6">
      <div className="space-y-6">
        {message && (
          <div className="border border-rust/30 bg-rust/5 text-rust text-sm px-4 py-2.5 rounded-sm">{message}</div>
        )}
        <section className="bg-white border border-line p-5">
          <h2 className="font-display font-semibold text-xl mb-4">Customer &amp; project</h2>
          <div className="grid sm:grid-cols-2 gap-4">
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
            <div>
              <label className="text-sm font-medium">Project name *</label>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Invoice date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
          </div>
        </section>

        <section className="bg-white border border-line p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl">Invoice items</h2>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus size={15} /> Add Item
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs text-steel uppercase tracking-wide border-b border-line">
                  <th className="py-2 pr-2 font-medium">Description</th>
                  <th className="py-2 px-2 font-medium w-24">Unit</th>
                  <th className="py-2 px-2 font-medium w-20">Qty</th>
                  <th className="py-2 px-2 font-medium w-32">Unit Price</th>
                  <th className="py-2 px-2 font-medium w-32 text-right">Amount</th>
                  <th className="py-2 pl-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-line/60">
                    <td className="py-2 pr-2">
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                        className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: Math.max(0, Number(e.target.value)) })}
                        className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: Math.max(0, Number(e.target.value)) })}
                        className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-medium whitespace-nowrap">
                      {formatMoney(item.quantity * item.unitPrice)}
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <button onClick={() => removeItem(item.id)} className="text-steel hover:text-bad" aria-label="Remove item">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-line p-5">
          <h2 className="font-display font-semibold text-xl mb-4">Payment terms &amp; notes</h2>
          <label className="text-sm font-medium">Payment terms</label>
          <textarea
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            rows={2}
            className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
          />
          <label className="text-sm font-medium mt-4 block">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
          />
        </section>
      </div>

      <aside className="space-y-6">
        <section className="bg-white border border-line p-5">
          <h2 className="font-display font-semibold text-xl mb-4">Totals</h2>
          <div className="space-y-3 text-sm">
            <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
            <div className="flex items-center justify-between gap-2">
              <label className="text-steel">Discount</label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-28 border border-line px-2 py-1 text-right rounded-sm focus:border-rust"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-steel">Tax (%)</label>
              <input
                type="number"
                min={0}
                value={taxPercent}
                onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
                className="w-28 border border-line px-2 py-1 text-right rounded-sm focus:border-rust"
              />
            </div>
            <div className="border-t border-line pt-3 flex items-center justify-between font-display font-semibold text-xl">
              <span>Total</span>
              <span>{formatMoney(totals.grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-steel">Amount paid</label>
              <input
                type="number"
                min={0}
                value={amountPaid}
                onChange={(e) => setAmountPaid(Math.max(0, Number(e.target.value)))}
                className="w-28 border border-line px-2 py-1 text-right rounded-sm focus:border-rust"
              />
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Balance due</span>
              <span className={balance > 0 ? "text-bad" : "text-good"}>{formatMoney(balance)}</span>
            </div>
          </div>
        </section>

        <section className="bg-white border border-line p-5">
          <label className="text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DocStatus)}
            className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm capitalize focus:border-rust"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </section>

        <div className="space-y-3">
          <Button onClick={save} className="w-full">
            <Save size={16} /> Save Invoice
          </Button>
          <Button onClick={downloadPdf} variant="outline" className="w-full">
            <Download size={16} /> Download PDF
          </Button>
          <Button onClick={recordPayment} variant="dark" className="w-full">
            <ArrowRightLeft size={16} /> Record Payment (Receipt)
          </Button>
        </div>

        {customer && (
          <section className="bg-white border border-line p-5 text-sm">
            <h3 className="font-display font-semibold text-lg mb-2">Customer details</h3>
            <p className="font-medium">{customer.name}</p>
            <p className="text-steel">{customer.phone}</p>
          </section>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-steel">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
