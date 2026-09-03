import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { StatCard } from "../components/ui/StatCard";
import { LancamentoForm } from "../components/financeiro/LancamentoForm";
import { useToast } from "../components/ui/Toast";
import { financeiroService } from "../services/financeiro";
import { ApiError } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";
import { lancamentoFormValuesVazio } from "../types/financeiro";
import type { Lancamento, LancamentoFormValues, StatusLancamento } from "../types/financeiro";

const STATUS_TONE: Record<StatusLancamento, "amber" | "teal" | "red"> = {
  pendente: "amber",
  pago: "teal",
  atrasado: "red",
};

const STATUS_LABEL: Record<StatusLancamento, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
};

type Filtro = "todos" | "receber" | "pagar";

export default function Financeiro() {
  const { notify } = useToast();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Lancamento | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmacao, setConfirmacao] = useState<Lancamento | null>(null);

  async function carregar() {
    setCarregando(true);
    setLancamentos(await financeiroService.listar());
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(l: Lancamento) {
    setEditando(l);
    setModalAberto(true);
  }

  async function salvar(valores: LancamentoFormValues) {
    setSalvando(true);
    try {
      if (editando) {
        await financeiroService.atualizar(editando.id, valores);
        notify("Lançamento atualizado.");
      } else {
        await financeiroService.criar(valores);
        notify("Lançamento cadastrado.");
      }
      setModalAberto(false);
      await carregar();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Não foi possível salvar.", "error");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(l: Lancamento) {
    await financeiroService.remover(l.id);
    notify("Lançamento removido.");
    await carregar();
  }

  async function marcarComoPago(l: Lancamento) {
    await financeiroService.atualizar(l.id, { status: "pago" });
    notify("Lançamento marcado como pago.");
    await carregar();
  }

  const resumo = useMemo(() => {
    const aReceber = lancamentos.filter((l) => l.tipo === "receber" && l.status !== "pago");
    const aPagar = lancamentos.filter((l) => l.tipo === "pagar" && l.status !== "pago");
    const atrasados = lancamentos.filter((l) => l.status === "atrasado");
    return {
      aReceber: aReceber.reduce((s, l) => s + l.valor, 0),
      aPagar: aPagar.reduce((s, l) => s + l.valor, 0),
      atrasados: atrasados.length,
      atrasadosValor: atrasados.reduce((s, l) => s + l.valor, 0),
    };
  }, [lancamentos]);

  const filtrados = lancamentos
    .filter((l) => filtro === "todos" || l.tipo === filtro)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Contas a pagar e a receber da oficina."
        action={
          <Button onClick={abrirNovo}>
            <Plus size={18} /> Novo lançamento
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="A receber" value={formatCurrency(resumo.aReceber)} icon={ArrowDownCircle} tone="teal" />
        <StatCard label="A pagar" value={formatCurrency(resumo.aPagar)} icon={ArrowUpCircle} tone="terracotta" />
        <StatCard
          label="Atrasados"
          value={String(resumo.atrasados)}
          sublabel={formatCurrency(resumo.atrasadosValor)}
          icon={Wallet}
          tone="red"
        />
      </div>

      <div className="mb-4 flex gap-2">
        {(["todos", "receber", "pagar"] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filtro === f ? "bg-terracotta-500 text-white" : "bg-cream-dark text-ink-soft hover:text-ink"
            }`}
          >
            {f === "todos" ? "Todos" : f === "receber" ? "A receber" : "A pagar"}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-card bg-cream-dark" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <EmptyState icon={Wallet} title="Nenhum lançamento encontrado" description="Cadastre contas a pagar ou a receber." />
      ) : (
        <div className="grid gap-2.5">
          {filtrados.map((l) => (
            <Card key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    l.tipo === "receber" ? "bg-teal-100 text-teal-600" : "bg-terracotta-100 text-terracotta-600"
                  }`}
                >
                  {l.tipo === "receber" ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{l.descricao}</p>
                  <p className="text-xs text-ink-faint">
                    {l.categoria || "Sem categoria"} · vence em {formatDate(l.vencimento)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="tabular text-sm font-bold text-ink">{formatCurrency(l.valor)}</p>
                <Badge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</Badge>
                {l.status !== "pago" && (
                  <Button variant="ghost" size="sm" onClick={() => marcarComoPago(l)}>
                    <CheckCircle2 size={15} /> Marcar pago
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => abrirEdicao(l)}>
                  <Pencil size={15} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmacao(l)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando ? "Editar lançamento" : "Novo lançamento"}>
        <LancamentoForm
          valoresIniciais={editando ?? lancamentoFormValuesVazio}
          onSalvar={salvar}
          onCancelar={() => setModalAberto(false)}
          salvando={salvando}
        />
      </Modal>

      <ConfirmDialog
        open={!!confirmacao}
        onClose={() => setConfirmacao(null)}
        title="Remover lançamento?"
        description={`"${confirmacao?.descricao}" será removido definitivamente.`}
        confirmLabel="Remover"
        danger
        onConfirm={() => confirmacao && remover(confirmacao)}
      />
    </div>
  );
}
