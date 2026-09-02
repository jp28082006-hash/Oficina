import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-terracotta-500 text-white shadow-soft hover:bg-terracotta-600 active:bg-terracotta-700 disabled:bg-terracotta-400/60",
  secondary:
    "bg-white text-ink border border-border-strong hover:bg-cream-dark disabled:opacity-50",
  ghost: "bg-transparent text-ink-soft hover:bg-cream-dark hover:text-ink disabled:opacity-50",
  danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-500/60",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  sm: "h-9 px-3.5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
