"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calculator, Save } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import { estimateTotals, formatMoney } from "@/lib/calc";
import type { Estimate, LabourCostItem, MaterialCostItem } from "@/lib/types";

function blankMaterial(): MaterialCostItem {
  return { id: uid(), name: "", unit: "unit", quantity: 1, unitPrice: 0 };
}
function blankLabour(): LabourCostItem {
  return { id: uid(), category: "General Builder", workers: 1, ratePerDay: 0, days: 1 };
}

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [title, setTitle] = useState("");
  const [materials, setMaterials] = useState<MaterialCostItem[]>([blankMaterial()]);
  const [labour, setLabour] = useState<LabourCostItem[]>([blankLabour()]);
  const [otherCosts, setOtherCosts] = useState<{ id: string; label: string; amount: number }[]>([]);
  const [markupPercent, setMarkupPercent] = useState(15);
  const [notes, setNotes] = useState("");

  function refresh() {
    setEstimates(db.estimates.all());
  }
  useEffect(refresh, []);

  const totals = estimateTotals({ materials, labour, otherCosts, markupPercent });

  function saveEstimate() {
    if (!title.trim()) return;
    const record: Estimate = {
      id: uid(),
      title: title.trim(),
      date: new Date().toISOString().slice(0, 10),
      materials,
      labour,
      otherCosts,
      markupPercent,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    db.estimates.upsert(record);
    refresh();
    setTitle("");
    setMaterials([blankMaterial()]);
    setLabour([blankLabour()]);
    setOtherCosts([]);
    setMarkupPercent(15);
    setNotes("");
  }

  function removeEstimate(id: string) {
    if (!confirm("Delete this estimate?")) return;
    db.estimates.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader title="Estimates" description="Calculate project costs from materials, labour and other costs." />

      <div className="p-6 grid xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <section className="bg-white border border-line p-5">
            <label className="text-sm font-medium">Estimate title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3-bedroom bungalow — Wakiso"
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </section>

          <section className="bg-white border border-line p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl">Materials</h2>
              <Button variant="outline" size="sm" onClick={() => setMaterials((l) => [...l, blankMaterial()])}>
                <Plus size={15} /> Add Material
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left text-xs text-steel uppercase tracking-wide border-b border-line">
                    <th className="py-2 pr-2 font-medium">Material</th>
                    <th className="py-2 px-2 font-medium w-24">Unit</th>
                    <th className="py-2 px-2 font-medium w-20">Qty</th>
                    <th className="py-2 px-2 font-medium w-32">Unit Price</th>
                    <th className="py-2 px-2 font-medium w-32 text-right">Total</th>
                    <th className="py-2 pl-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id} className="border-b border-line/60">
                      <td className="py-2 pr-2">
                        <input
                          value={m.name}
                          onChange={(e) => setMaterials((l) => l.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))}
                          className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          value={m.unit}
                          onChange={(e) => setMaterials((l) => l.map((x) => (x.id === m.id ? { ...x, unit: e.target.value } : x)))}
                          className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={m.quantity}
                          onChange={(e) => setMaterials((l) => l.map((x) => (x.id === m.id ? { ...x, quantity: Math.max(0, Number(e.target.value)) } : x)))}
                          className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={m.unitPrice}
                          onChange={(e) => setMaterials((l) => l.map((x) => (x.id === m.id ? { ...x, unitPrice: Math.max(0, Number(e.target.value)) } : x)))}
                          className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                        />
                      </td>
                      <td className="py-2 px-2 text-right whitespace-nowrap">{formatMoney(m.quantity * m.unitPrice)}</td>
                      <td className="py-2 pl-2 text-right">
                        <button
                          onClick={() => setMaterials((l) => (l.length > 1 ? l.filter((x) => x.id !== m.id) : l))}
                          className="text-steel hover:text-bad"
                          aria-label="Remove"
                        >
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl">Labour</h2>
              <Button variant="outline" size="sm" onClick={() => setLabour((l) => [...l, blankLabour()])}>
                <Plus size={15} /> Add Labour
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left text-xs text-steel uppercase tracking-wide border-b border-line">
                    <th className="py-2 pr-2 font-medium">Category</th>
                    <th className="py-2 px-2 font-medium w-24">Workers</th>
                    <th className="py-2 px-2 font-medium w-28">Rate / day</th>
                    <th className="py-2 px-2 font-medium w-20">Days</th>
                    <th className="py-2 px-2 font-medium w-32 text-right">Total</th>
                    <th className="py-2 pl-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {labour.map((lb) => (
                    <tr key={lb.id} className="border-b border-line/60">
                      <td className="py-2 pr-2">
                        <input
                          value={lb.category}
                          onChange={(e) => setLabour((l) => l.map((x) => (x.id === lb.id ? { ...x, category: e.target.value } : x)))}
                          className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={lb.workers}
                          onChange={(e) => setLabour((l) => l.map((x) => (x.id === lb.id ? { ...x, workers: Math.max(0, Number(e.target.value)) } : x)))}
                          className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={lb.ratePerDay}
                          onChange={(e) => setLabour((l) => l.map((x) => (x.id === lb.id ? { ...x, ratePerDay: Math.max(0, Number(e.target.value)) } : x)))}
                          className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={lb.days}
                          onChange={(e) => setLabour((l) => l.map((x) => (x.id === lb.id ? { ...x, days: Math.max(0, Number(e.target.value)) } : x)))}
                          className="w-full border border-line px-2 py-1.5 rounded-sm focus:border-rust"
                        />
                      </td>
                      <td className="py-2 px-2 text-right whitespace-nowrap">{formatMoney(lb.workers * lb.ratePerDay * lb.days)}</td>
                      <td className="py-2 pl-2 text-right">
                        <button
                          onClick={() => setLabour((l) => (l.length > 1 ? l.filter((x) => x.id !== lb.id) : l))}
                          className="text-steel hover:text-bad"
                          aria-label="Remove"
                        >
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl">Other costs</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOtherCosts((l) => [...l, { id: uid(), label: "", amount: 0 }])}
              >
                <Plus size={15} /> Add Cost
              </Button>
            </div>
            {otherCosts.length === 0 && (
              <p className="text-sm text-steel">e.g. transportation, equipment hire, site expenses.</p>
            )}
            <div className="space-y-2">
              {otherCosts.map((o) => (
                <div key={o.id} className="flex gap-2">
                  <input
                    value={o.label}
                    placeholder="Label"
                    onChange={(e) => setOtherCosts((l) => l.map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x)))}
                    className="flex-1 border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
                  />
                  <input
                    type="number"
                    min={0}
                    value={o.amount}
                    onChange={(e) => setOtherCosts((l) => l.map((x) => (x.id === o.id ? { ...x, amount: Math.max(0, Number(e.target.value)) } : x)))}
                    className="w-32 border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
                  />
                  <button onClick={() => setOtherCosts((l) => l.filter((x) => x.id !== o.id))} className="text-steel hover:text-bad px-2">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-line p-5">
            <label className="text-sm font-medium">Notes</label>
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
            <h2 className="font-display font-semibold text-xl mb-4">Cost summary</h2>
            <div className="space-y-2.5 text-sm">
              <Row label="Material cost" value={formatMoney(totals.materialCost)} />
              <Row label="Labour cost" value={formatMoney(totals.labourCost)} />
              <Row label="Other costs" value={formatMoney(totals.otherCost)} />
              <div className="border-t border-line pt-2.5 flex justify-between font-medium">
                <span>Total estimated cost</span>
                <span>{formatMoney(totals.totalCost)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-steel">Markup / profit (%)</label>
                <input
                  type="number"
                  min={0}
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(Math.max(0, Number(e.target.value)))}
                  className="w-20 border border-line px-2 py-1 text-right rounded-sm focus:border-rust"
                />
              </div>
              <Row label="Markup amount" value={formatMoney(totals.markup)} />
              <div className="border-t border-line pt-3 flex justify-between font-display font-semibold text-xl">
                <span>Final client price</span>
                <span>{formatMoney(totals.finalPrice)}</span>
              </div>
            </div>
            <Button onClick={saveEstimate} className="w-full mt-5">
              <Save size={16} /> Save Estimate
            </Button>
          </section>
        </aside>
      </div>

      <div className="px-6 pb-10">
        <h2 className="font-display font-semibold text-2xl mb-4">Saved estimates</h2>
        {estimates.length === 0 ? (
          <EmptyState icon={Calculator} title="No saved estimates yet" description="Estimates you save will appear here." />
        ) : (
          <div className="bg-white border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-steel uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Final price</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {estimates.map((e) => {
                  const t = estimateTotals(e);
                  return (
                    <tr key={e.id}>
                      <td className="px-4 py-3 font-medium">{e.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{e.date}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">{formatMoney(t.finalPrice)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeEstimate(e.id)} className="text-steel hover:text-bad p-1" aria-label="Delete">
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-steel">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
