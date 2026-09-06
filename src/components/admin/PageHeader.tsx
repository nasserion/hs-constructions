import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-6 py-6 border-b border-line bg-paper">
      <div>
        <h1 className="font-display font-semibold text-3xl text-ink">{title}</h1>
        {description && <p className="text-sm text-steel mt-1">{description}</p>}
      </div>
      {actions && <div className="flex gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
