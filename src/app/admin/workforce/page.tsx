"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, HardHat } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Modal } from "@/components/admin/Modal";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import type { ProjectRecord, WorkforceMember, WorkforceRole } from "@/lib/types";

const ROLES: WorkforceRole[] = [
  "Mason",
  "Carpenter",
  "Electrician",
  "Plumber",
  "Painter",
  "Steel Fixer",
  "Tiler",
  "General Builder",
  "Porter",
  "Other",
];

const emptyForm = {
  name: "",
  role: "General Builder" as WorkforceRole,
  phone: "",
  skillCategory: "",
  availability: "Available" as WorkforceMember["availability"],
  assignedProjectId: "",
  notes: "",
};

export default function WorkforcePage() {
  const [members, setMembers] = useState<WorkforceMember[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkforceMember | null>(null);
  const [form, setForm] = useState(emptyForm);

  function refresh() {
    setMembers(db.workforce.all());
    setProjects(db.projects.all());
  }
  useEffect(refresh, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(m: WorkforceMember) {
    setEditing(m);
    setForm({
      name: m.name,
      role: m.role,
      phone: m.phone || "",
      skillCategory: m.skillCategory || "",
      availability: m.availability,
      assignedProjectId: m.assignedProjectId || "",
      notes: m.notes || "",
    });
    setModalOpen(true);
  }
  function save() {
    if (!form.name.trim()) return;
    const record: WorkforceMember = {
      id: editing?.id || uid(),
      name: form.name.trim(),
      role: form.role,
      phone: form.phone.trim() || undefined,
      skillCategory: form.skillCategory.trim() || undefined,
      availability: form.availability,
      assignedProjectId: form.assignedProjectId || undefined,
      notes: form.notes.trim() || undefined,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    db.workforce.upsert(record);
    refresh();
    setModalOpen(false);
  }
  function remove(id: string) {
    if (!confirm("Remove this workforce record?")) return;
    db.workforce.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Workforce"
        description="Manage records for the company's fundi, builders and porters."
        actions={
          <Button onClick={openNew} size="sm">
            <Plus size={16} /> Add Worker
          </Button>
        }
      />
      <div className="p-6">
        {members.length === 0 ? (
          <EmptyState
            icon={HardHat}
            title="No workforce records yet"
            description="Add records for your fundi, builders and porters as needed."
            action={
              <Button onClick={openNew} size="sm">
                <Plus size={16} /> Add Worker
              </Button>
            }
          />
        ) : (
          <div className="bg-white border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-steel uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Availability</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{m.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.role}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.availability.toLowerCase()} />
                    </td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Worker" : "Add Worker"}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as WorkforceRole })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Availability</label>
              <select
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value as WorkforceMember["availability"] })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              >
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Assigned project</label>
              <select
                value={form.assignedProjectId}
                onChange={(e) => setForm({ ...form, assignedProjectId: e.target.value })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              >
                <option value="">—</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Skill / category</label>
            <input
              value={form.skillCategory}
              onChange={(e) => setForm({ ...form, skillCategory: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
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
            {editing ? "Save Changes" : "Add Worker"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
