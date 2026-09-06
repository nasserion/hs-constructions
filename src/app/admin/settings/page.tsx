"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Save, Plus, Trash2, Pencil, ArrowUp, ArrowDown, KeyRound, ImagePlus, X } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { db, uid } from "@/lib/store";
import { changePassword } from "@/lib/auth";
import { fileToCompressedDataUrl } from "@/lib/images";
import { BUSINESS } from "@/lib/business";
import type { Service, SiteSettings } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ title: "", category: "", description: "" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  function refresh() {
    setSettings(db.settings.get());
    setServices(db.services.all().sort((a, b) => a.order - b.order));
  }
  useEffect(refresh, []);

  function saveSettings() {
    if (!settings) return;
    db.settings.set(settings);
    setMessage("Settings saved.");
    setTimeout(() => setMessage(null), 2500);
  }

  function openNewService() {
    setEditing(null);
    setForm({ title: "", category: "", description: "" });
    setModalOpen(true);
  }
  function openEditService(s: Service) {
    setEditing(s);
    setForm({ title: s.title, category: s.category, description: s.description });
    setModalOpen(true);
  }
  function saveService() {
    if (!form.title.trim() || !form.description.trim()) return;
    const record: Service = {
      id: editing?.id || uid(),
      title: form.title.trim(),
      category: form.category.trim() || "General",
      description: form.description.trim(),
      order: editing?.order ?? services.length + 1,
    };
    db.services.upsert(record);
    refresh();
    setModalOpen(false);
  }
  function removeService(id: string) {
    if (!confirm("Delete this service?")) return;
    db.services.remove(id);
    refresh();
  }
  function move(id: string, dir: -1 | 1) {
    const list = [...services];
    const idx = list.findIndex((s) => s.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const a = list[idx];
    const b = list[swapIdx];
    db.services.upsert({ ...a, order: b.order });
    db.services.upsert({ ...b, order: a.order });
    refresh();
  }

  function handleChangePassword() {
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    const error = changePassword(currentPassword, newPassword);
    if (error) {
      setPasswordError(error);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess("Password changed. Use the new password next time you log in.");
  }

  async function handleHeroUpload(file: File | undefined) {
    if (!file || !settings) return;
    setHeroError(null);
    setHeroUploading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      const updated = { ...settings, heroImage: dataUrl };
      db.settings.set(updated);
      setSettings(updated);
    } catch {
      setHeroError("Could not process that photo. Try a different file.");
    } finally {
      setHeroUploading(false);
    }
  }

  function removeHeroImage() {
    if (!settings) return;
    const updated = { ...settings, heroImage: undefined };
    db.settings.set(updated);
    setSettings(updated);
  }

  async function handleLogoUpload(file: File | undefined) {
    if (!file || !settings) return;
    setLogoError(null);
    setLogoUploading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      const updated = { ...settings, logoImage: dataUrl };
      db.settings.set(updated);
      setSettings(updated);
    } catch {
      setLogoError("Could not process that file. Try a different image.");
    } finally {
      setLogoUploading(false);
    }
  }

  function removeLogoImage() {
    if (!settings) return;
    const updated = { ...settings, logoImage: undefined };
    db.settings.set(updated);
    setSettings(updated);
  }

  if (!settings) return <div className="p-6 text-sm text-steel">Loading…</div>;

  return (
    <div>
      <PageHeader title="Settings" description="Company details, document numbering and services shown on the website." />

      <div className="p-6 space-y-6 max-w-3xl">
        {message && (
          <div className="border border-good/30 bg-good/5 text-good text-sm px-4 py-2.5 rounded-sm">{message}</div>
        )}

        <section className="bg-white border border-line p-5">
          <h2 className="font-display font-semibold text-xl mb-1 flex items-center gap-2">
            <ImagePlus size={18} className="text-rust" /> Company logo
          </h2>
          <p className="text-sm text-steel mb-4 max-w-lg">
            Upload your official logo to replace the text wordmark shown in the site header and
            footer. Best results: a transparent-background PNG or SVG-exported PNG.
          </p>
          {logoError && (
            <div className="border border-bad/40 bg-bad/5 text-bad text-sm px-4 py-2.5 rounded-sm mb-4">
              {logoError}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-40 h-20 bg-ink border border-line shrink-0 overflow-hidden flex items-center justify-center">
              {settings.logoImage ? (
                <Image src={settings.logoImage} alt="Logo preview" fill unoptimized className="object-contain p-2" />
              ) : (
                <span className="text-white font-display font-semibold text-lg">
                  H S <span className="text-rust">CONSTRUCTIONS</span>
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium border border-line px-4 py-2 rounded-sm cursor-pointer hover:border-rust hover:text-rust w-fit">
                <ImagePlus size={15} />
                {logoUploading ? "Uploading…" : settings.logoImage ? "Replace logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={logoUploading}
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
              {settings.logoImage && (
                <button
                  onClick={removeLogoImage}
                  className="inline-flex items-center gap-1.5 text-sm text-steel hover:text-bad w-fit"
                >
                  <X size={14} /> Remove logo, use text wordmark
                </button>
              )}
            </div>
          </div>
          <p className="mt-4 text-xs text-steel leading-relaxed">
            Note: this changes the header/footer logo only. Updating the browser tab icon
            (favicon) currently requires replacing <code>src/app/favicon.ico</code> directly in
            the code and rebuilding — ask if you&apos;d like help with that.
          </p>
        </section>

        <section className="bg-white border border-line p-5">
          <h2 className="font-display font-semibold text-xl mb-1 flex items-center gap-2">
            <ImagePlus size={18} className="text-rust" /> Homepage hero photo
          </h2>
          <p className="text-sm text-steel mb-4 max-w-lg">
            Upload a real photo of your site or work to replace the default dark background on
            the homepage. Recommended: a wide landscape photo, at least 1600px wide.
          </p>
          {heroError && (
            <div className="border border-bad/40 bg-bad/5 text-bad text-sm px-4 py-2.5 rounded-sm mb-4">
              {heroError}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="relative w-full sm:w-64 aspect-video bg-ink border border-line shrink-0 overflow-hidden">
              {settings.heroImage ? (
                <Image src={settings.heroImage} alt="Hero preview" fill unoptimized className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-steel-light text-xs">
                  No photo set — using default background
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium border border-line px-4 py-2 rounded-sm cursor-pointer hover:border-rust hover:text-rust w-fit">
                <ImagePlus size={15} />
                {heroUploading ? "Uploading…" : settings.heroImage ? "Replace photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={heroUploading}
                  onChange={(e) => handleHeroUpload(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
              {settings.heroImage && (
                <button
                  onClick={removeHeroImage}
                  className="inline-flex items-center gap-1.5 text-sm text-steel hover:text-bad w-fit"
                >
                  <X size={14} /> Remove photo, use default background
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white border border-line p-5">
          <h2 className="font-display font-semibold text-xl mb-4 flex items-center gap-2">
            <KeyRound size={18} className="text-rust" /> Admin password
          </h2>
          <p className="text-sm text-steel mb-4 max-w-lg">
            This is a temporary local password gate, not full account security — but you can
            change it here so it&apos;s not left on the default.
          </p>
          {passwordError && (
            <div className="border border-bad/40 bg-bad/5 text-bad text-sm px-4 py-2.5 rounded-sm mb-4">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="border border-good/30 bg-good/5 text-good text-sm px-4 py-2.5 rounded-sm mb-4">
              {passwordSuccess}
            </div>
          )}
          <div className="grid sm:grid-cols-3 gap-4 max-w-xl">
            <div>
              <label className="text-sm font-medium">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
          </div>
          <Button onClick={handleChangePassword} variant="outline" className="mt-5">
            Change Password
          </Button>
        </section>

        <section className="bg-white border border-line p-5">
          <h2 className="font-display font-semibold text-xl mb-1">Company details</h2>
          <p className="text-sm text-steel mb-4">
            Core contact details are set in code (<code>lib/business.ts</code>) to guarantee accuracy. Editable
            content shown on the website is managed here.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-xs text-steel uppercase tracking-wide">WhatsApp</p>
              <p className="font-medium">{BUSINESS.whatsappDisplay}</p>
            </div>
            <div>
              <p className="text-xs text-steel uppercase tracking-wide">Phone</p>
              <p className="font-medium">{BUSINESS.phoneDisplay}</p>
            </div>
            <div>
              <p className="text-xs text-steel uppercase tracking-wide">Email</p>
              <p className="font-medium">{BUSINESS.email}</p>
            </div>
            <div>
              <p className="text-xs text-steel uppercase tracking-wide">Director</p>
              <p className="font-medium">{BUSINESS.director.name}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Company description</label>
            <textarea
              value={settings.companyDescription}
              onChange={(e) => setSettings({ ...settings, companyDescription: e.target.value })}
              rows={2}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
        </section>

        <section className="bg-white border border-line p-5">
          <h2 className="font-display font-semibold text-xl mb-4">Document settings</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Quotation prefix</label>
              <input
                value={settings.documentPrefix.quotation}
                onChange={(e) =>
                  setSettings({ ...settings, documentPrefix: { ...settings.documentPrefix, quotation: e.target.value } })
                }
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Invoice prefix</label>
              <input
                value={settings.documentPrefix.invoice}
                onChange={(e) =>
                  setSettings({ ...settings, documentPrefix: { ...settings.documentPrefix, invoice: e.target.value } })
                }
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Receipt prefix</label>
              <input
                value={settings.documentPrefix.receipt}
                onChange={(e) =>
                  setSettings({ ...settings, documentPrefix: { ...settings.documentPrefix, receipt: e.target.value } })
                }
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Default validity (days)</label>
              <input
                type="number"
                min={1}
                value={settings.defaultValidityDays}
                onChange={(e) => setSettings({ ...settings, defaultValidityDays: Number(e.target.value) })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Default tax (%)</label>
              <input
                type="number"
                min={0}
                value={settings.defaultTaxPercent}
                onChange={(e) => setSettings({ ...settings, defaultTaxPercent: Number(e.target.value) })}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium">Default payment terms</label>
            <textarea
              value={settings.paymentTerms}
              onChange={(e) => setSettings({ ...settings, paymentTerms: e.target.value })}
              rows={2}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <Button onClick={saveSettings} className="mt-5">
            <Save size={16} /> Save Settings
          </Button>
        </section>

        <section className="bg-white border border-line p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl">Website services</h2>
            <Button variant="outline" size="sm" onClick={openNewService}>
              <Plus size={15} /> Add Service
            </Button>
          </div>
          <ul className="divide-y divide-line">
            {services.map((s, i) => (
              <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-steel truncate">{s.category}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => move(s.id, -1)} disabled={i === 0} className="text-steel hover:text-rust disabled:opacity-30 p-1">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => move(s.id, 1)} disabled={i === services.length - 1} className="text-steel hover:text-rust disabled:opacity-30 p-1">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => openEditService(s)} className="text-steel hover:text-rust p-1" aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => removeService(s.id)} className="text-steel hover:text-bad p-1" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-steel leading-relaxed">
          Note: all business data on this portal is currently stored in your browser&apos;s local storage for
          demonstration purposes. It is not shared between devices and will need a real backend/database before
          production use — see the note in <code>lib/store.ts</code>.
        </p>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Service" : "Add Service"}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1.5 w-full border border-line px-3 py-2 text-sm rounded-sm focus:border-rust"
            />
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
          <Button onClick={saveService} className="w-full">
            {editing ? "Save Changes" : "Add Service"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
