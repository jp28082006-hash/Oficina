import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatCurrency, formatDate } from "../../lib/format";
import { STATUS_OS_LABEL, STATUS_OS_TONE, calcularTotalOS } from "../../types/ordemServico";
import type { OrdemServico } from "../../types/ordemServico";

interface OSListViewProps {
  ordens: OrdemServico[];
  onAbrirEdicao: (os: OrdemServico) => void;
}

export function OSListView({ ordens, onAbrirEdicao }: OSListViewProps) {
  const hoje = new Date().toISOString().slice(0, 10);
  const ordenadas = [...ordens].sort((a, b) => b.numero - a.numero);

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-cream-dark/50 text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-semibold">OS</th>
              <th className="px-4 py-3 font-semibold">Cliente / Veículo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Responsável</th>
              <th className="px-4 py-3 font-semibold">Previsão</th>
              <th className="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((os) => {
              const atrasada = os.dataPrevisao < hoje && !["concluida", "entregue", "cancelada"].includes(os.status);
              return (
                <tr
                  key={os.id}
                  onClick={() => onAbrirEdicao(os)}
                  className="cursor-pointer border-b border-border last:border-b-0 hover:bg-cream-dark/30"
                >
                  <td className="tabular px-4 py-3 font-bold text-terracotta-600">#{os.numero}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{os.clienteNome}</p>
                    <p className="text-xs text-ink-faint">{os.veiculoDescricao}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={STATUS_OS_TONE[os.status]}>{STATUS_OS_LABEL[os.status]}</Badge>
                      {atrasada && <Badge tone="red">Atrasada</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{os.mecanicoResponsavel}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(os.dataPrevisao)}</td>
                  <td className="tabular px-4 py-3 font-semibold text-ink">{formatCurrency(calcularTotalOS(os.itens))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
