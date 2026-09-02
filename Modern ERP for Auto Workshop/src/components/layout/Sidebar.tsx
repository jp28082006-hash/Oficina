import { NavLink } from "react-router";
import { Wrench } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/70 px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta-500 text-white shadow-soft">
          <Wrench size={20} strokeWidth={2.3} />
        </span>
        <div className="leading-tight">
          <p className="font-display text-lg font-bold text-ink">Oficina Clara</p>
          <p className="text-xs text-ink-faint">Gestão da oficina</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-terracotta-500 text-white shadow-soft"
                  : "text-ink-soft hover:bg-cream-dark hover:text-ink"
              }`
            }
          >
            <Icon size={18} strokeWidth={2.1} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="workshop-texture h-16 rounded-card" aria-hidden />
    </aside>
  );
}
