import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-line bg-white p-12 text-center">
      <Icon size={28} className="mx-auto text-steel-light" />
      <h3 className="font-display font-semibold text-xl mt-3">{title}</h3>
      {description && <p className="text-sm text-steel mt-1 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
