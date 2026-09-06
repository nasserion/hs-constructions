"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Download, Save, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import { documentTotals, formatMoney } from "@/lib/calc";
import { downloadQuotationPdf } from "@/lib/pdf";
import type { Customer, DocStatus, LineItem, Quotation } from "@/lib/types";

const STATUSES: DocStatus[] = ["draft", "sent", "viewed", "accepted", "rejected", "expired"];

function blankItem(): LineItem {
  return { id: uid(), description: "", unit: "unit", quantity: 1, unitPrice: 0 };
}

export function QuotationEditor({
  existing,
  initial,
}: {
  existing?: Quotation;
  initial?: {
    customerId?: string;
    projectName?: string;
    projectLocation?: string;
    projectDescription?: string;
    sourceQuoteRequestId?: string;
  };
}) {
  const router = useRouter();
  const settings = db.settings.get();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState(existing?.customerId || initial?.customerId || "");
  const [projectName, setProjectName] = useState(existing?.projectName || initial?.projectName || "");
  const [projectLocation, setProjectLocation] = useState(existing?.projectLocation || initial?.projectLocation || "");
  const [projectDescription, setProjectDescription] = useState(
    existing?.projectDescription || initial?.projectDescription || ""
  );
  const [date, setDate] = useState(existing?.date || new Date().toISOString().slice(0, 10));
  const [validityDays, setValidityDays] = useState(existing?.validityDays ?? settings.defaultValidityDays);
  const [items, setItems] = useState<LineItem[]>(existing?.items?.length ? existing.items : [blankItem()]);
  const [discount, setDiscount] = useState(existing?.discount ?? 0);
  const [taxPercent, setTaxPercent] = useState(existing?.taxPercent ?? settings.defaultTaxPercent);
  const [otherCharges, setOtherCharges] = useState(existing?.otherCharges ?? 0);
  const [status, setStatus] = useState<DocStatus>(existing?.status || "draft");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [savedId, setSavedId] = useState<string | undefined>(existing?.id);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setCustomers(db.customers.all());
  }, []);

  const totals = documentTotals(items, discount, taxPercent, otherCharges);

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function addItem() {
    setItems((list) => [...list, blankItem()]);
  }

  function removeItem(id: string) {
    setItems((list) => (list.length > 1 ? list.filter((i) => i.id !== id) : list));
  }

  function buildRecord(): Quotation | null {
    if (!customerId) {
      setMessage("Please select a customer.");
      return null;
    }
    if (!projectName.trim()) {
      setMessage("Please enter a project name.");
      return null;
    }
    const number = existing?.number || db.nextNumber("quotation");
    return {
      id: savedId || uid(),
      number,
      date,
      validityDays: Number(validityDays) || 30,
      customerId,
      projectName: projectName.trim(),
      projectLocation: projectLocation.trim() || undefined,
      projectDescription: projectDescription.trim() || undefined,
      items,
      discount: Number(discount) || 0,
      taxPercent: Number(taxPercent) || 0,
      otherCharges: Number(otherCharges) || 0,
      status,
      notes: notes.trim() || undefined,
      createdAt: existing?.createdAt || new Date().toISOString(),
      sourceQuoteRequestId: existing?.sourceQuoteRequestId || initial?.sourceQuoteRequestId,
    };
  }

  function save(andRedirect = true) {
    setMessage(null);
    const record = buildRecord();
    if (!record) return;
    db.quotations.upsert(record);
    setSavedId(record.id);
    setMessage("Quotation saved.");
    if (andRedirect && !existing) {
      router.replace(`/admin/quotations/${record.id}`);
    }
  }

  function downloadPdf() {
    const record = buildRecord();
    if (!record) return;
    db.quotations.upsert(record);
    setSavedId(record.id);
    const customer = customers.find((c) => c.id === record.customerId);
    downloadQuotationPdf(record, customer);
  }

  function convertToInvoice() {
    const record = buildRecord();
    if (!record) return;
    db.quotations.upsert({ ...record, status: "accepted" });
    const invNumber = db.nextNumber("invoice");
    const invoice = {
      id: uid(),
      number: invNumber,
      date: new Date().toISOString().slice(0, 10),
      customerId: record.customerId,
      projectName: record.projectName,
      items: record.items,
      discount: record.discount,
      taxPercent: record.taxPercent,
      amountPaid: 0,
      paymentTerms: db.settings.get().paymentTerms,
      status: "draft" as DocStatus,
      createdAt: new Date().toISOString(),
      sourceQuotationId: record.id,
    };
    db.invoices.upsert(invoice);
    router.push(`/admin/invoices/${invoice.id}`);
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
              <p className="text-xs text-steel mt-1">
                No customer yet? Add one from the{" "}
                <a href="/admin/customers" className="text-rust hover:underline">
                  Customers page
                </a>{" "}
                then come back.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Quotation date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
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
              <label className="text-sm font-medium">Project location</label>
              <input
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Project description</label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={2}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
          </div>
        </section>

        <section className="bg-white border border-line p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl">Quotation items</h2>
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
                  <th className="py-2 px-2 font-medium w-32 text-right">Total</th>
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
                        placeholder="Item description"
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
          <h2 className="font-display font-semibold text-xl mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Terms, inclusions/exclusions, or anything the customer should know."
            className="w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
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
            <div className="flex items-center justify-between gap-2">
              <label className="text-steel">Other charges</label>
              <input
                type="number"
                min={0}
                value={otherCharges}
                onChange={(e) => setOtherCharges(Math.max(0, Number(e.target.value)))}
                className="w-28 border border-line px-2 py-1 text-right rounded-sm focus:border-rust"
              />
            </div>
            <div className="border-t border-line pt-3 flex items-center justify-between font-display font-semibold text-xl">
              <span>Grand Total</span>
              <span>{formatMoney(totals.grandTotal)}</span>
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
                {s}
              </option>
            ))}
          </select>
          <label className="text-sm font-medium mt-4 block">Validity (days)</label>
          <input
            type="number"
            min={1}
            value={validityDays}
            onChange={(e) => setValidityDays(Number(e.target.value))}
            className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
          />
        </section>

        <div className="space-y-3">
          <Button onClick={() => save()} className="w-full">
            <Save size={16} /> Save Quotation
          </Button>
          <Button onClick={downloadPdf} variant="outline" className="w-full">
            <Download size={16} /> Download PDF
          </Button>
          <Button onClick={convertToInvoice} variant="dark" className="w-full">
            <ArrowRightLeft size={16} /> Convert to Invoice
          </Button>
        </div>

        {customer && (
          <section className="bg-white border border-line p-5 text-sm">
            <h3 className="font-display font-semibold text-lg mb-2">Customer details</h3>
            <p className="font-medium">{customer.name}</p>
            <p className="text-steel">{customer.phone}</p>
            {customer.email && <p className="text-steel">{customer.email}</p>}
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
