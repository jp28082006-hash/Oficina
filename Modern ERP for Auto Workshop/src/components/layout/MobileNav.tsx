import { NavLink } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Wrench, X } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative flex h-full w-64 flex-col bg-surface px-4 py-6 shadow-lift"
          >
            <div className="mb-8 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta-500 text-white">
                  <Wrench size={20} strokeWidth={2.3} />
                </span>
                <p className="font-display text-lg font-bold text-ink">Oficina Clara</p>
              </div>
              <button onClick={onClose} className="rounded-full p-1.5 text-ink-faint hover:bg-cream-dark" aria-label="Fechar menu">
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-terracotta-500 text-white" : "text-ink-soft hover:bg-cream-dark hover:text-ink"
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={2.1} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
