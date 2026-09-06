"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Pencil, FolderKanban, ImagePlus, X } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Modal } from "@/components/admin/Modal";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import { filesToCompressedDataUrls } from "@/lib/images";
import type { PortfolioProject } from "@/lib/types";

const CATEGORIES: PortfolioProject["category"][] = [
  "Residential",
  "Commercial",
  "Renovation",
  "Structural",
  "Civil Works",
  "Other",
];
const STATUSES: PortfolioProject["status"][] = ["Completed", "In Progress", "Planned"];
const MAX_IMAGES = 6;

const emptyForm = {
  name: "",
  category: "Residential" as PortfolioProject["category"],
  description: "",
  location: "",
  status: "Completed" as PortfolioProject["status"],
  completionDate: "",
  images: [] as string[],
};

export default function PortfolioAdminPage() {
  const [items, setItems] = useState<PortfolioProject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function refresh() {
    setItems(db.portfolio.all());
  }
  useEffect(refresh, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setUploadError(null);
    setModalOpen(true);
  }
  function openEdit(p: PortfolioProject) {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description,
      location: p.location || "",
      status: p.status,
      completionDate: p.completionDate || "",
      images: p.images || [],
    });
    setUploadError(null);
    setModalOpen(true);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) {
      setUploadError(`You can add up to ${MAX_IMAGES} photos per project.`);
      return;
    }
    setUploading(true);
    try {
      const files = Array.from(fileList).slice(0, remaining);
      const dataUrls = await filesToCompressedDataUrls(files);
      setForm((f) => ({ ...f, images: [...f.images, ...dataUrls] }));
    } catch {
      setUploadError("Some photos could not be processed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  function save() {
    if (!form.name.trim() || !form.description.trim()) return;
    const record: PortfolioProject = {
      id: editing?.id || uid(),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      location: form.location.trim() || undefined,
      status: form.status,
      completionDate: form.completionDate || undefined,
      images: form.images,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    try {
      db.portfolio.upsert(record);
    } catch {
      setUploadError(
        "Could not save — the browser's local storage is full. Try removing a photo or two, or use smaller images."
      );
      return;
    }
    refresh();
    setModalOpen(false);
  }
  function remove(id: string) {
    if (!confirm("Delete this project from the public portfolio?")) return;
    db.portfolio.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader
        title="Website Projects"
        description="Projects shown on the public Projects page. Only add real, completed or in-progress work."
        actions={
          <Button onClick={openNew} size="sm">
            <Plus size={16} /> Add Project
          </Button>
        }
      />
      <div className="p-6">
        {items.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No public projects yet"
            description="The public Projects page shows an empty state until you add real projects here."
            action={
              <Button onClick={openNew} size="sm">
                <Plus size={16} /> Add Project
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <div key={p.id} className="bg-white border border-line overflow-hidden">
                {p.images && p.images.length > 0 ? (
                  <div className="relative w-full aspect-[4/3] bg-paper-dim">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    {p.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 text-xs bg-ink/80 text-white px-2 py-0.5 rounded-sm">
                        +{p.images.length - 1} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-paper-dim flex items-center justify-center">
                    <ImagePlus size={24} className="text-steel-light" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-xs font-medium text-rust uppercase tracking-wide">{p.category}</p>
                  <h3 className="font-display font-semibold text-xl mt-1">{p.name}</h3>
                  <p className="text-sm text-steel mt-2 line-clamp-3">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs px-2 py-1 border border-line rounded-sm text-steel">{p.status}</span>
                    <div className="space-x-1">
                      <button onClick={() => openEdit(p)} className="text-steel hover:text-rust p-1" aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(p.id)} className="text-steel hover:text-bad p-1" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Project" : "Add Project"} wide>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Project name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as PortfolioProject["category"] })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PortfolioProject["status"] })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Completion date</label>
              <input
                type="date"
                value={form.completionDate}
                onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-1.5">
              <ImagePlus size={15} /> Photos ({form.images.length}/{MAX_IMAGES})
            </label>
            {uploadError && (
              <p className="mt-1.5 text-xs text-bad">{uploadError}</p>
            )}
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {form.images.map((src, i) => (
                <div key={i} className="relative aspect-square border border-line group">
                  <Image src={src} alt={`Photo ${i + 1}`} fill unoptimized className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-ink/80 text-white rounded-full hover:bg-bad"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {form.images.length < MAX_IMAGES && (
                <label className="aspect-square border border-dashed border-line flex flex-col items-center justify-center gap-1 text-steel cursor-pointer hover:border-rust hover:text-rust text-xs">
                  <ImagePlus size={18} />
                  {uploading ? "Uploading…" : "Add photo"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-steel leading-relaxed">
              Photos are resized and stored in this browser (no server yet), so keep it to a few per
              project. Up to {MAX_IMAGES} photos, JPG/PNG.
            </p>
          </div>

          <Button onClick={save} className="w-full">
            {editing ? "Save Changes" : "Add Project"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
