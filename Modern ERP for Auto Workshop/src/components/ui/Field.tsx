import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const baseControl =
  "w-full rounded-control border border-border-strong bg-white px-3.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-100 disabled:bg-cream-dark disabled:text-ink-faint";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`h-11 ${baseControl} ${className}`} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea ref={ref} className={`min-h-[88px] py-2.5 ${baseControl} ${className}`} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select ref={ref} className={`h-11 ${baseControl} ${className}`} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, error, hint, required, children, className = "" }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="ml-0.5 text-terracotta-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
}
