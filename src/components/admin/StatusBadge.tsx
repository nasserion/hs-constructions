import { clsx } from "clsx";

const TONE: Record<string, string> = {
  draft: "bg-steel-light/20 text-steel",
  new: "bg-rust/15 text-rust",
  reviewed: "bg-warn/15 text-warn",
  converted: "bg-good/15 text-good",
  archived: "bg-steel-light/20 text-steel",
  sent: "bg-warn/15 text-warn",
  viewed: "bg-warn/15 text-warn",
  accepted: "bg-good/15 text-good",
  rejected: "bg-bad/15 text-bad",
  expired: "bg-bad/15 text-bad",
  partially_paid: "bg-warn/15 text-warn",
  paid: "bg-good/15 text-good",
  overdue: "bg-bad/15 text-bad",
  cancelled: "bg-bad/15 text-bad",
  inquiry: "bg-steel-light/20 text-steel",
  approved: "bg-good/15 text-good",
  planning: "bg-warn/15 text-warn",
  in_progress: "bg-warn/15 text-warn",
  on_hold: "bg-bad/15 text-bad",
  completed: "bg-good/15 text-good",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium capitalize",
        TONE[status] || "bg-steel-light/20 text-steel"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
