"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-ink/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative bg-white border border-line w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-8`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-display font-semibold text-2xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-steel hover:text-rust">
            <X size={22} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
