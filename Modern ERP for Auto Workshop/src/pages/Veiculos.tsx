import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CarFront, Gauge } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { VeiculoForm } from "../components/veiculo/VeiculoForm";
import { useToast } from "../components/ui/Toast";
import { veiculosService } from "../services/veiculos";
import { clientesService } from "../services/clientes";
import { generateId } from "../lib/mockStore";
import { veiculoFormValuesVazio } from "../types/veiculo";
import type { Veiculo, VeiculoFormValues } from "../types/veiculo";
import type { Pessoa } from "../types/pessoa";

export default function Veiculos() {
  const { notify } = useToast();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [clientes, setClientes] = useState<Pessoa[]>([]);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [erroClientes, setErroClientes] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Veiculo | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmacao, setConfirmacao] = useState<Veiculo | null>(null);

  async function carregar() {
    setCarregando(true);
    setVeiculos(await veiculosService.listar());
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    clientesService
      .listar()
      .then(setClientes)
      .catch(() => setErroClientes(true))
      .finally(() => setCarregandoClientes(false));
  }, []);

  function abrirNovo() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(veiculo: Veiculo) {
    setEditando(veiculo);
    setModalAberto(true);
  }

  async function salvar(valores: VeiculoFormValues) {
    setSalvando(true);
    const cliente = clientes.find((c) => c.id === valores.clienteId);
    try {
      if (editando) {
        await veiculosService.atualizar(editando.id, { ...valores, clienteNome: cliente?.nome_razao_social });
        notify("Veículo atualizado com sucesso.");
      } else {
        await veiculosService.criar({
          ...valores,
          id: generateId("vei"),
          clienteNome: cliente?.nome_razao_social ?? "—",
          criadoEm: new Date().toISOString(),
        });
        notify("Veículo cadastrado com sucesso.");
      }
      setModalAberto(false);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(veiculo: Veiculo) {
    await veiculosService.remover(veiculo.id);
    notify("Veículo removido.");
    await carregar();
  }

  const filtrados = veiculos.filter((v) => {
    const alvo = `${v.placa} ${v.marca} ${v.modelo} ${v.clienteNome}`.toLowerCase();
    return alvo.includes(busca.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        title="Veículos"
        description="Veículos atendidos pela oficina, vinculados aos clientes cadastrados."
        action={
          <Button onClick={abrirNovo}>
            <Plus size={18} /> Novo veículo
          </Button>
        }
      />

      <SearchInput
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por placa, modelo ou cliente"
        className="mb-4 max-w-sm"
      />

      {carregando ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-card bg-cream-dark" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={CarFront}
          title="Nenhum veículo encontrado"
          description="Cadastre o primeiro veículo vinculado a um cliente."
          action={
            <Button onClick={abrirNovo}>
              <Plus size={18} /> Novo veículo
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtrados.map((veiculo) => (
            <Card key={veiculo.id} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-display text-base font-semibold text-ink">{veiculo.modelo}</p>
                    <Badge tone="neutral">
                      <span className="tabular">{veiculo.placa}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-soft">
                    {veiculo.marca} · {veiculo.anoFabricacao}/{veiculo.anoModelo} · {veiculo.cor || "cor não informada"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">{veiculo.clienteNome}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
                    <Gauge size={13} /> {veiculo.km.toLocaleString("pt-BR")} km
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Button variant="secondary" size="sm" onClick={() => abrirEdicao(veiculo)}>
                    <Pencil size={15} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmacao(veiculo)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? "Editar veículo" : "Novo veículo"}
        width="lg"
      >
        <VeiculoForm
          valoresIniciais={editando ?? veiculoFormValuesVazio}
          onSalvar={salvar}
          onCancelar={() => setModalAberto(false)}
          salvando={salvando}
          clientes={clientes}
          carregandoClientes={carregandoClientes}
          erroClientes={erroClientes}
        />
      </Modal>

      <ConfirmDialog
        open={!!confirmacao}
        onClose={() => setConfirmacao(null)}
        title="Remover veículo?"
        description={`${confirmacao?.modelo} (${confirmacao?.placa}) será removido definitivamente.`}
        confirmLabel="Remover"
        danger
        onConfirm={() => confirmacao && remover(confirmacao)}
      />
    </div>
  );
}
