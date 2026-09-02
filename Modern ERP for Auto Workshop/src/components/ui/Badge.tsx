import type { ReactNode } from "react";

export type BadgeTone = "terracotta" | "teal" | "amber" | "red" | "blue" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  terracotta: "bg-terracotta-100 text-terracotta-700",
  teal: "bg-teal-100 text-teal-600",
  amber: "bg-amber-100 text-amber-600",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
  neutral: "bg-cream-dark text-ink-soft",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
