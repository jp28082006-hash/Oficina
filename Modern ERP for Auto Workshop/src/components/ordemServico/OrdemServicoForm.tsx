import { useState } from "react";
import type { FormEvent } from "react";
import { Trash2, Wrench, Package } from "lucide-react";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { Button } from "../ui/Button";
import type { OrdemServicoFormValues, ItemOS, StatusOS } from "../../types/ordemServico";
import { STATUS_OS_LABEL, calcularTotalOS } from "../../types/ordemServico";
import type { Pessoa } from "../../types/pessoa";
import type { Veiculo } from "../../types/veiculo";
import { generateId } from "../../lib/mockStore";
import { formatCurrency } from "../../lib/format";

interface OrdemServicoFormProps {
  valoresIniciais: OrdemServicoFormValues;
  onSalvar: (valores: OrdemServicoFormValues) => Promise<void>;
  onCancelar: () => void;
  salvando?: boolean;
  clientes: Pessoa[];
  veiculos: Veiculo[];
}

const MECANICOS = ["Paulo Mecânico", "Diego Silva", "Camila Torres"];

export function OrdemServicoForm({
  valoresIniciais,
  onSalvar,
  onCancelar,
  salvando,
  clientes,
  veiculos,
}: OrdemServicoFormProps) {
  const [valores, setValores] = useState<OrdemServicoFormValues>(valoresIniciais);
  const [erros, setErros] = useState<Record<string, string>>({});

  function set<K extends keyof OrdemServicoFormValues>(campo: K, valor: OrdemServicoFormValues[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  function adicionarItem(tipo: ItemOS["tipo"]) {
    const novo: ItemOS = { id: generateId("item"), tipo, descricao: "", quantidade: 1, valorUnitario: 0 };
    set("itens", [...valores.itens, novo]);
  }

  function atualizarItem(id: string, patch: Partial<ItemOS>) {
    set("itens", valores.itens.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removerItem(id: string) {
    set("itens", valores.itens.filter((item) => item.id !== id));
  }

  function validar(): boolean {
    const proximos: Record<string, string> = {};
    if (!valores.clienteId) proximos.clienteId = "Selecione o cliente.";
    if (!valores.veiculoId) proximos.veiculoId = "Selecione o veículo.";
    if (!valores.mecanicoResponsavel.trim()) proximos.mecanicoResponsavel = "Informe o responsável.";
    setErros(proximos);
    return Object.keys(proximos).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    await onSalvar(valores);
  }

  const total = calcularTotalOS(valores.itens);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cliente" required error={erros.clienteId}>
          <Select value={valores.clienteId || ""} onChange={(e) => set("clienteId", Number(e.target.value))}>
            <option value="">Selecione…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_razao_social}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Veículo" required error={erros.veiculoId}>
          <Select value={valores.veiculoId} onChange={(e) => set("veiculoId", e.target.value)}>
            <option value="">Selecione…</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.modelo} · {v.placa} ({v.clienteNome})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Responsável" required error={erros.mecanicoResponsavel}>
          <Input
            list="mecanicos"
            value={valores.mecanicoResponsavel}
            onChange={(e) => set("mecanicoResponsavel", e.target.value)}
            placeholder="Nome do mecânico"
          />
          <datalist id="mecanicos">
            {MECANICOS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Field>

        <Field label="Status">
          <Select value={valores.status} onChange={(e) => set("status", e.target.value as StatusOS)}>
            {Object.entries(STATUS_OS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Data de abertura">
          <Input type="date" value={valores.dataAbertura} onChange={(e) => set("dataAbertura", e.target.value)} />
        </Field>
        <Field label="Previsão de entrega">
          <Input type="date" value={valores.dataPrevisao} onChange={(e) => set("dataPrevisao", e.target.value)} />
        </Field>
      </div>

      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-soft">Serviços e peças</p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => adicionarItem("servico")}>
              <Wrench size={14} /> Serviço
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => adicionarItem("peca")}>
              <Package size={14} /> Peça
            </Button>
          </div>
        </div>

        {valores.itens.length === 0 ? (
          <p className="rounded-control border border-dashed border-border-strong bg-cream-dark/50 px-4 py-6 text-center text-sm text-ink-faint">
            Nenhum item adicionado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {valores.itens.map((item) => (
              <div key={item.id} className="grid grid-cols-12 items-center gap-2 rounded-control border border-border bg-cream-dark/40 p-2.5">
                <span
                  className={`col-span-12 -mt-0.5 mb-0.5 flex items-center gap-1 text-xs font-semibold sm:col-span-1 sm:mb-0 sm:mt-0 ${
                    item.tipo === "servico" ? "text-blue-600" : "text-teal-600"
                  }`}
                >
                  {item.tipo === "servico" ? <Wrench size={12} /> : <Package size={12} />}
                  {item.tipo === "servico" ? "Serviço" : "Peça"}
                </span>
                <Input
                  className="col-span-12 h-9 sm:col-span-5"
                  placeholder="Descrição"
                  value={item.descricao}
                  onChange={(e) => atualizarItem(item.id, { descricao: e.target.value })}
                />
                <Input
                  className="col-span-4 h-9 sm:col-span-2"
                  type="number"
                  min={1}
                  placeholder="Qtd"
                  value={item.quantidade}
                  onChange={(e) => atualizarItem(item.id, { quantidade: Number(e.target.value) })}
                />
                <Input
                  className="col-span-6 h-9 sm:col-span-3"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Valor unit."
                  value={item.valorUnitario}
                  onChange={(e) => atualizarItem(item.id, { valorUnitario: Number(e.target.value) })}
                />
                <button
                  type="button"
                  onClick={() => removerItem(item.id)}
                  className="col-span-2 flex h-9 items-center justify-center rounded-control text-ink-faint hover:bg-red-50 hover:text-red-600 sm:col-span-1"
                  aria-label="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <p className="font-display text-lg font-bold text-ink">
            Total: <span className="tabular text-terracotta-600">{formatCurrency(total)}</span>
          </p>
        </div>
      </div>

      <Field label="Observações">
        <Textarea value={valores.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)} />
      </Field>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
