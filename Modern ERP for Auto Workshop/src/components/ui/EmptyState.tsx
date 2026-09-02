import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong bg-cream-dark/40 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-100 text-terracotta-600">
        <Icon size={26} />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
