import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "warn" | "good";
}) {
  const toneClass =
    tone === "warn" ? "text-warn" : tone === "good" ? "text-good" : "text-rust";
  return (
    <div className="bg-white border border-line p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-steel uppercase tracking-wide">{label}</span>
        <Icon size={16} className={toneClass} />
      </div>
      <p className="font-display font-semibold text-3xl text-ink mt-3">{value}</p>
    </div>
  );
}
