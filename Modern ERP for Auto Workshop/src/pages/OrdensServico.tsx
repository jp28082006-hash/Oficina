import { useEffect, useState } from "react";
import { Plus, Trash2, User, CalendarClock, ClipboardList } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { OrdemServicoForm } from "../components/ordemServico/OrdemServicoForm";
import { useToast } from "../components/ui/Toast";
import { ordensServicoService } from "../services/ordensServico";
import { clientesService } from "../services/clientes";
import { veiculosService } from "../services/veiculos";
import { ApiError } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";
import {
  STATUS_OS_LABEL,
  STATUS_OS_ORDER,
  STATUS_OS_TONE,
  calcularTotalOS,
  ordemServicoFormValuesVazio,
} from "../types/ordemServico";
import type { OrdemServico, OrdemServicoFormValues } from "../types/ordemServico";
import type { Pessoa } from "../types/pessoa";
import type { Veiculo } from "../types/veiculo";

export default function OrdensServico() {
  const { notify } = useToast();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [clientes, setClientes] = useState<Pessoa[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<OrdemServico | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroServidor, setErroServidor] = useState<Record<string, string[]>>();
  const [confirmacao, setConfirmacao] = useState<OrdemServico | null>(null);

  async function carregar() {
    setCarregando(true);
    setOrdens(await ordensServicoService.listar());
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    clientesService.listar().then(setClientes).catch(() => setClientes([]));
    veiculosService.listar().then(setVeiculos);
  }, []);

  function abrirNovo() {
    setEditando(null);
    setErroServidor(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(os: OrdemServico) {
    setEditando(os);
    setErroServidor(undefined);
    setModalAberto(true);
  }

  async function salvar(valores: OrdemServicoFormValues) {
    setSalvando(true);
    setErroServidor(undefined);
    try {
      if (editando) {
        const atualizada = await ordensServicoService.atualizar(editando.id, valores);
        notify(`OS #${atualizada.numero} atualizada.`);
      } else {
        const criada = await ordensServicoService.criar(valores);
        notify(`OS #${criada.numero} criada com sucesso.`);
      }
      setModalAberto(false);
      await carregar();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErroServidor(err.fieldErrors);
      } else {
        notify(err instanceof ApiError ? err.message : "Não foi possível salvar.", "error");
      }
    } finally {
      setSalvando(false);
    }
  }

  async function remover(os: OrdemServico) {
    await ordensServicoService.remover(os.id);
    notify(`OS #${os.numero} removida.`);
    await carregar();
  }

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description="Acompanhe o andamento dos serviços, coluna por status."
        action={
          <Button onClick={abrirNovo}>
            <Plus size={18} /> Nova OS
          </Button>
        }
      />

      {carregando ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-card bg-cream-dark" />
          ))}
        </div>
      ) : ordens.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma ordem de serviço"
          description="Crie a primeira OS para começar a acompanhar o fluxo da oficina."
          action={
            <Button onClick={abrirNovo}>
              <Plus size={18} /> Nova OS
            </Button>
          }
        />
      ) : (
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
                          onClick={() => abrirEdicao(os)}
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
                          <p className="tabular mt-2 text-sm font-bold text-ink">
                            {formatCurrency(calcularTotalOS(os.itens))}
                          </p>
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
      )}

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? `Editar OS #${editando.numero}` : "Nova ordem de serviço"}
        width="xl"
      >
        <OrdemServicoForm
          valoresIniciais={editando ?? ordemServicoFormValuesVazio}
          onSalvar={salvar}
          onCancelar={() => setModalAberto(false)}
          salvando={salvando}
          clientes={clientes}
          veiculos={veiculos}
          erroServidor={erroServidor}
        />
        {editando && (
          <div className="mt-4 flex justify-end border-t border-border pt-4">
            <Button variant="ghost" size="sm" onClick={() => setConfirmacao(editando)}>
              <Trash2 size={15} /> Excluir esta OS
            </Button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmacao}
        onClose={() => setConfirmacao(null)}
        title="Excluir ordem de serviço?"
        description={`A OS #${confirmacao?.numero} será removida definitivamente.`}
        confirmLabel="Excluir"
        danger
        onConfirm={() => {
          if (confirmacao) remover(confirmacao);
          setModalAberto(false);
        }}
      />
    </div>
  );
}
