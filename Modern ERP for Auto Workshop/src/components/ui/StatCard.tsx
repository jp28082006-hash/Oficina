import type { LucideIcon } from "lucide-react";
import type { BadgeTone } from "./Badge";
import { Card } from "./Card";

const toneClasses: Record<BadgeTone, string> = {
  terracotta: "bg-terracotta-100 text-terracotta-600",
  teal: "bg-teal-100 text-teal-600",
  amber: "bg-amber-100 text-amber-600",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
  neutral: "bg-cream-dark text-ink-soft",
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: BadgeTone;
  sublabel?: string;
}

export function StatCard({ label, value, icon: Icon, tone = "terracotta", sublabel }: StatCardProps) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        <p className="font-display text-2xl font-bold text-ink">{value}</p>
        {sublabel && <p className="mt-0.5 text-xs text-ink-faint">{sublabel}</p>}
      </div>
    </Card>
  );
}
