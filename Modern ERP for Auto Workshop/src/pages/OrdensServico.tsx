import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, Trash2, ClipboardList, LayoutGrid, List, CalendarDays } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { SearchInput } from "../components/ui/SearchInput";
import { Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { OrdemServicoForm } from "../components/ordemServico/OrdemServicoForm";
import { OSKanbanBoard } from "../components/ordemServico/OSKanbanBoard";
import { OSListView } from "../components/ordemServico/OSListView";
import { OSCalendarView } from "../components/ordemServico/OSCalendarView";
import { useToast } from "../components/ui/Toast";
import { ordensServicoService } from "../services/ordensServico";
import { clientesService } from "../services/clientes";
import { veiculosService } from "../services/veiculos";
import { ApiError } from "../lib/api";
import { STATUS_OS_LABEL, STATUS_OS_ORDER, ordemServicoFormValuesVazio } from "../types/ordemServico";
import type { OrdemServico, OrdemServicoFormValues, StatusOS } from "../types/ordemServico";
import type { Pessoa } from "../types/pessoa";
import type { Veiculo } from "../types/veiculo";

type Visao = "kanban" | "lista" | "calendario";

const VISOES: { valor: Visao; label: string; icon: typeof LayoutGrid }[] = [
  { valor: "kanban", label: "Kanban", icon: LayoutGrid },
  { valor: "lista", label: "Lista", icon: List },
  { valor: "calendario", label: "Calendário", icon: CalendarDays },
];

const CHAVE_VISAO = "oficina:os-visao";

export default function OrdensServico() {
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [clientes, setClientes] = useState<Pessoa[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  const [visao, setVisao] = useState<Visao>(() => {
    const salva = localStorage.getItem(CHAVE_VISAO);
    return salva === "kanban" || salva === "lista" || salva === "calendario" ? salva : "kanban";
  });
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOS | "todos">("todos");

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

  useEffect(() => {
    const idParam = searchParams.get("abrir");
    if (!idParam || ordens.length === 0) return;
    const alvo = ordens.find((os) => os.id === idParam);
    if (alvo) abrirEdicao(alvo);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, ordens]);

  function trocarVisao(nova: Visao) {
    setVisao(nova);
    localStorage.setItem(CHAVE_VISAO, nova);
  }

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

  const ordensFiltradas = useMemo(() => {
    const buscaLower = busca.toLowerCase();
    return ordens.filter((os) => {
      const combinaStatus = filtroStatus === "todos" || os.status === filtroStatus;
      const combinaBusca =
        !buscaLower ||
        `${os.numero} ${os.clienteNome} ${os.veiculoDescricao} ${os.mecanicoResponsavel}`
          .toLowerCase()
          .includes(buscaLower);
      return combinaStatus && combinaBusca;
    });
  }, [ordens, busca, filtroStatus]);

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description="Acompanhe o andamento dos serviços em Kanban, lista ou calendário."
        action={
          <Button onClick={abrirNovo}>
            <Plus size={18} /> Nova OS
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-control border border-border-strong bg-cream-dark p-1">
          {VISOES.map(({ valor, label, icon: Icon }) => (
            <button
              key={valor}
              onClick={() => trocarVisao(valor)}
              className={`flex items-center gap-1.5 rounded-[calc(var(--radius-control)-4px)] px-3 py-1.5 text-sm font-semibold transition-colors ${
                visao === valor ? "bg-white text-terracotta-600 shadow-soft" : "text-ink-soft"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <SearchInput
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por OS, cliente, veículo ou mecânico"
          className="max-w-xs flex-1"
        />

        <Select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as StatusOS | "todos")}
          className="w-auto"
        >
          <option value="todos">Todos os status</option>
          {STATUS_OS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_OS_LABEL[status]}
            </option>
          ))}
        </Select>
      </div>

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
      ) : ordensFiltradas.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nenhuma OS encontrada" description="Tente ajustar a busca ou o filtro de status." />
      ) : visao === "kanban" ? (
        <OSKanbanBoard ordens={ordensFiltradas} onAbrirEdicao={abrirEdicao} />
      ) : visao === "lista" ? (
        <OSListView ordens={ordensFiltradas} onAbrirEdicao={abrirEdicao} />
      ) : (
        <OSCalendarView ordens={ordensFiltradas} onAbrirEdicao={abrirEdicao} />
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
