import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { STATUS_OS_LABEL, STATUS_OS_ORDER, STATUS_OS_TONE } from "../../types/ordemServico";
import type { OrdemServico } from "../../types/ordemServico";

interface OSCalendarViewProps {
  ordens: OrdemServico[];
  onAbrirEdicao: (os: OrdemServico) => void;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MAX_VISIVEIS_POR_DIA = 3;

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function OSCalendarView({ ordens, onAbrirEdicao }: OSCalendarViewProps) {
  const [referencia, setReferencia] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  const hojeIso = toIso(new Date());

  const porDia = useMemo(() => {
    const mapa = new Map<string, OrdemServico[]>();
    for (const os of ordens) {
      const lista = mapa.get(os.dataPrevisao) ?? [];
      lista.push(os);
      mapa.set(os.dataPrevisao, lista);
    }
    return mapa;
  }, [ordens]);

  const celulas = useMemo(() => {
    const ano = referencia.getFullYear();
    const mes = referencia.getMonth();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const inicio = new Date(ano, mes, 1 - primeiroDiaSemana);
    return Array.from({ length: 42 }, (_, i) => {
      const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
      return {
        data,
        iso: toIso(data),
        noMesAtual: data.getMonth() === mes,
      };
    });
  }, [referencia]);

  const rotuloMes = referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const rotuloCapitalizado = rotuloMes.charAt(0).toUpperCase() + rotuloMes.slice(1);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-semibold text-ink">{rotuloCapitalizado}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setReferencia(new Date(referencia.getFullYear(), referencia.getMonth(), 1))}
          >
            Hoje
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setReferencia(new Date(referencia.getFullYear(), referencia.getMonth() - 1, 1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setReferencia(new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1))}
            aria-label="Próximo mês"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-soft">
        <div className="grid grid-cols-7 border-b border-border bg-cream-dark/50">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-faint">
              {dia}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {celulas.map(({ data, iso, noMesAtual }) => {
            const osNoDia = porDia.get(iso) ?? [];
            const visiveis = osNoDia.slice(0, MAX_VISIVEIS_POR_DIA);
            const restantes = osNoDia.length - visiveis.length;
            const ehHoje = iso === hojeIso;

            return (
              <div
                key={iso}
                className={`min-h-[104px] border-b border-r border-border p-1.5 last:border-r-0 ${
                  noMesAtual ? "bg-surface" : "bg-cream-dark/20"
                }`}
              >
                <span
                  className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    ehHoje
                      ? "bg-terracotta-500 text-white"
                      : noMesAtual
                        ? "text-ink-soft"
                        : "text-ink-faint"
                  }`}
                >
                  {data.getDate()}
                </span>
                <div className="flex flex-col gap-1">
                  {visiveis.map((os) => (
                    <button
                      key={os.id}
                      onClick={() => onAbrirEdicao(os)}
                      className="w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-ink hover:opacity-80"
                      style={{
                        backgroundColor: `var(--color-${STATUS_OS_TONE[os.status] === "neutral" ? "cream-dark" : `${STATUS_OS_TONE[os.status]}-100`})`,
                      }}
                    >
                      #{os.numero} {os.clienteNome.split(" ")[0]}
                    </button>
                  ))}
                  {restantes > 0 && <span className="px-1.5 text-[11px] text-ink-faint">+{restantes} mais</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_OS_ORDER.map((status) => (
          <Badge key={status} tone={STATUS_OS_TONE[status]}>
            {STATUS_OS_LABEL[status]}
          </Badge>
        ))}
      </div>
    </div>
  );
}
