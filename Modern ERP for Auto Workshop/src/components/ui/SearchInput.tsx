import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export function SearchInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
      <input
        className="h-11 w-full rounded-control border border-border-strong bg-white pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-100"
        {...props}
      />
    </div>
  );
}
