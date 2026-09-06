"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Package } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Modal } from "@/components/admin/Modal";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import { formatMoney } from "@/lib/calc";
import type { Material } from "@/lib/types";

const emptyForm = { name: "", category: "", unit: "", currentPrice: 0, supplier: "", notes: "" };

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState(emptyForm);

  function refresh() {
    setMaterials(db.materials.all());
  }
  useEffect(refresh, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(m: Material) {
    setEditing(m);
    setForm({
      name: m.name,
      category: m.category,
      unit: m.unit,
      currentPrice: m.currentPrice,
      supplier: m.supplier || "",
      notes: m.notes || "",
    });
    setModalOpen(true);
  }
  function save() {
    if (!form.name.trim() || !form.unit.trim()) return;
    const record: Material = {
      id: editing?.id || uid(),
      name: form.name.trim(),
      category: form.category.trim() || "General",
      unit: form.unit.trim(),
      currentPrice: Number(form.currentPrice) || 0,
      supplier: form.supplier.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    db.materials.upsert(record);
    refresh();
    setModalOpen(false);
  }
  function remove(id: string) {
    if (!confirm("Delete this material?")) return;
    db.materials.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Materials"
        description="Maintain construction material prices used in quotations and estimates."
        actions={
          <Button onClick={openNew} size="sm">
            <Plus size={16} /> Add Material
          </Button>
        }
      />
      <div className="p-6">
        {materials.length === 0 ? (
          <EmptyState icon={Package} title="No materials yet" description="Add materials and set their current prices." />
        ) : (
          <div className="bg-white border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-steel uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Material</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium text-right">Current Price</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {materials.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{m.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.unit}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {m.currentPrice > 0 ? (
                        formatMoney(m.currentPrice)
                      ) : (
                        <span className="text-warn">Set price</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.supplier || "—"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(m)} className="text-steel hover:text-rust p-1" aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(m.id)} className="text-steel hover:text-bad p-1" aria-label="Delete">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Material" : "Add Material"}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Material name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unit *</label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Current price</label>
              <input
                type="number"
                min={0}
                value={form.currentPrice}
                onChange={(e) => setForm({ ...form, currentPrice: Number(e.target.value) })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Supplier</label>
              <input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <Button onClick={save} className="w-full">
            {editing ? "Save Changes" : "Add Material"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
