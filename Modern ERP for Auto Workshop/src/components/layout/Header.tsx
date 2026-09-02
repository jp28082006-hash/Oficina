import { useState } from "react";
import { Link } from "react-router";
import { Bell, Menu, PackageX, ClipboardX, CircleDollarSign } from "lucide-react";
import { useAlertas } from "../../hooks/useAlertas";
import { MobileNav } from "./MobileNav";

const ICON_BY_TIPO = {
  estoque: PackageX,
  os: ClipboardX,
  financeiro: CircleDollarSign,
} as const;

export function Header() {
  const alertas = useAlertas();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-cream/85 px-4 backdrop-blur sm:px-6">
      <button
        className="rounded-control p-2 text-ink-soft hover:bg-cream-dark lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex-1" />

      <div className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative rounded-control p-2 text-ink-soft transition-colors hover:bg-cream-dark hover:text-ink"
          aria-label="Alertas"
        >
          <Bell size={20} />
          {alertas.length > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {alertas.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-80 rounded-card border border-border bg-surface shadow-lift">
              <div className="border-b border-border px-4 py-3">
                <p className="font-display font-semibold text-ink">Alertas da oficina</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alertas.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-ink-faint">Tudo em dia por aqui.</p>
                ) : (
                  alertas.map((alerta) => {
                    const Icon = ICON_BY_TIPO[alerta.tipo];
                    return (
                      <Link
                        key={alerta.id}
                        to={alerta.href}
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-cream-dark/60"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                          <Icon size={16} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-ink">{alerta.titulo}</span>
                          <span className="block text-xs text-ink-soft">{alerta.descricao}</span>
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5 border-l border-border pl-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500 font-display text-sm font-bold text-white">
          AJ
        </span>
        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-semibold text-ink">André Junior</p>
          <p className="text-xs text-ink-faint">Administrador</p>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
