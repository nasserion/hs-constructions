"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Modal } from "@/components/admin/Modal";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import { formatMoney } from "@/lib/calc";
import type { Customer, ProjectRecord, ProjectStatus } from "@/lib/types";

const STATUSES: ProjectStatus[] = [
  "inquiry",
  "quotation",
  "approved",
  "planning",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
];

const emptyForm = {
  name: "",
  customerId: "",
  location: "",
  type: "",
  description: "",
  startDate: "",
  expectedCompletionDate: "",
  status: "inquiry" as ProjectStatus,
  budget: 0,
  amountPaid: 0,
  notes: "",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRecord | null>(null);
  const [form, setForm] = useState(emptyForm);

  function refresh() {
    setProjects(db.projects.all());
    setCustomers(db.customers.all());
  }
  useEffect(refresh, []);

  const customerName = (id?: string) => customers.find((c) => c.id === id)?.name || "—";

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(p: ProjectRecord) {
    setEditing(p);
    setForm({
      name: p.name,
      customerId: p.customerId || "",
      location: p.location || "",
      type: p.type || "",
      description: p.description || "",
      startDate: p.startDate || "",
      expectedCompletionDate: p.expectedCompletionDate || "",
      status: p.status,
      budget: p.budget || 0,
      amountPaid: p.amountPaid || 0,
      notes: p.notes || "",
    });
    setModalOpen(true);
  }
  function save() {
    if (!form.name.trim()) return;
    const record: ProjectRecord = {
      id: editing?.id || uid(),
      name: form.name.trim(),
      customerId: form.customerId || undefined,
      location: form.location.trim() || undefined,
      type: form.type.trim() || undefined,
      description: form.description.trim() || undefined,
      startDate: form.startDate || undefined,
      expectedCompletionDate: form.expectedCompletionDate || undefined,
      status: form.status,
      budget: Number(form.budget) || undefined,
      amountPaid: Number(form.amountPaid) || undefined,
      notes: form.notes.trim() || undefined,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    db.projects.upsert(record);
    refresh();
    setModalOpen(false);
  }
  function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    db.projects.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Internal tracking for active and completed construction projects."
        actions={
          <Button onClick={openNew} size="sm">
            <Plus size={16} /> Add Project
          </Button>
        }
      />
      <div className="p-6">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Track a project once a quotation is approved, or add one manually."
            action={
              <Button onClick={openNew} size="sm">
                <Plus size={16} /> Add Project
              </Button>
            }
          />
        ) : (
          <div className="bg-white border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-steel uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Budget</th>
                  <th className="px-4 py-3 font-medium text-right">Paid</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{p.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{customerName(p.customerId)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{p.budget ? formatMoney(p.budget) : "—"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{p.amountPaid ? formatMoney(p.amountPaid) : "—"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(p)} className="text-steel hover:text-rust p-1" aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(p.id)} className="text-steel hover:text-bad p-1" aria-label="Delete">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Project" : "Add Project"} wide>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Project name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Customer</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            >
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm capitalize focus:border-rust"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Project type</label>
            <input
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Start date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Expected completion</label>
            <input
              type="date"
              value={form.expectedCompletionDate}
              onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Budget</label>
            <input
              type="number"
              min={0}
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Amount paid</label>
            <input
              type="number"
              min={0}
              value={form.amountPaid}
              onChange={(e) => setForm({ ...form, amountPaid: Number(e.target.value) })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <Button onClick={save} className="sm:col-span-2">
            {editing ? "Save Changes" : "Add Project"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
