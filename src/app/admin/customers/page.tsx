"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Modal } from "@/components/admin/Modal";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import type { Customer } from "@/lib/types";

const emptyForm = { name: "", phone: "", whatsapp: "", email: "", address: "", notes: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);

  function refresh() {
    setCustomers(db.customers.all());
  }

  useEffect(refresh, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q)
    );
  }, [customers, query]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setForm({
      name: c.name,
      phone: c.phone,
      whatsapp: c.whatsapp || "",
      email: c.email || "",
      address: c.address || "",
      notes: c.notes || "",
    });
    setModalOpen(true);
  }

  function save() {
    if (!form.name.trim() || !form.phone.trim()) return;
    const record: Customer = {
      id: editing?.id || uid(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    db.customers.upsert(record);
    refresh();
    setModalOpen(false);
  }

  function remove(id: string) {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    db.customers.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Everyone you've quoted, invoiced or worked with."
        actions={
          <Button onClick={openNew} size="sm">
            <Plus size={16} /> Add Customer
          </Button>
        }
      />

      <div className="p-6">
        <div className="relative max-w-sm mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers…"
            className="w-full border border-line bg-white pl-9 pr-3 py-2 text-sm rounded-sm focus:border-rust"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Add a customer manually, or convert a quote request into one."
            action={
              <Button onClick={openNew} size="sm">
                <Plus size={16} /> Add Customer
              </Button>
            }
          />
        ) : (
          <div className="bg-white border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-steel uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{c.email || "—"}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{c.address || "—"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(c)} className="text-steel hover:text-rust p-1" aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(c.id)} className="text-steel hover:text-bad p-1" aria-label="Delete">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Customer" : "Add Customer"}>
        <div className="space-y-4">
          <FormRow label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FormRow label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
          <FormRow label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
          <FormRow label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <FormRow label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <Button onClick={save} className="w-full">
            {editing ? "Save Changes" : "Add Customer"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function FormRow({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-rust">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
      />
    </div>
  );
}
