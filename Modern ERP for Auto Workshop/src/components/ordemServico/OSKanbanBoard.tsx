import { User, CalendarClock } from "lucide-react";
import { Badge } from "../ui/Badge";
import { formatCurrency, formatDate } from "../../lib/format";
import { STATUS_OS_LABEL, STATUS_OS_ORDER, STATUS_OS_TONE, calcularTotalOS } from "../../types/ordemServico";
import type { OrdemServico } from "../../types/ordemServico";

interface OSKanbanBoardProps {
  ordens: OrdemServico[];
  onAbrirEdicao: (os: OrdemServico) => void;
}

export function OSKanbanBoard({ ordens, onAbrirEdicao }: OSKanbanBoardProps) {
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="flex gap-4" style={{ minWidth: `${STATUS_OS_ORDER.length * 280}px` }}>
        {STATUS_OS_ORDER.map((status) => {
          const itensColuna = ordens.filter((os) => os.status === status);
          return (
            <div key={status} className="flex w-[270px] shrink-0 flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <Badge tone={STATUS_OS_TONE[status]}>{STATUS_OS_LABEL[status]}</Badge>
                <span className="text-xs font-semibold text-ink-faint">{itensColuna.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {itensColuna.map((os) => {
                  const atrasada = os.dataPrevisao < hoje && status !== "concluida" && status !== "entregue";
                  return (
                    <button
                      key={os.id}
                      onClick={() => onAbrirEdicao(os)}
                      className="rounded-card border border-border bg-surface p-3.5 text-left shadow-soft transition-shadow hover:shadow-lift"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="tabular text-xs font-bold text-terracotta-600">#{os.numero}</span>
                        {atrasada && <Badge tone="red">Atrasada</Badge>}
                      </div>
                      <p className="text-sm font-semibold text-ink">{os.veiculoDescricao}</p>
                      <p className="mb-2 text-xs text-ink-soft">{os.clienteNome}</p>
                      <div className="flex items-center justify-between text-xs text-ink-faint">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {os.mecanicoResponsavel.split(" ")[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarClock size={12} /> {formatDate(os.dataPrevisao)}
                        </span>
                      </div>
                      <p className="tabular mt-2 text-sm font-bold text-ink">{formatCurrency(calcularTotalOS(os.itens))}</p>
                    </button>
                  );
                })}
                {itensColuna.length === 0 && (
                  <p className="rounded-control border border-dashed border-border-strong px-3 py-6 text-center text-xs text-ink-faint">
                    Nenhuma OS aqui
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
