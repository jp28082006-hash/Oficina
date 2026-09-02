import { useState } from "react";
import type { FormEvent } from "react";
import { Field, Input, Select } from "../ui/Field";
import { Button } from "../ui/Button";
import type { LancamentoFormValues, StatusLancamento, TipoLancamento } from "../../types/financeiro";

interface LancamentoFormProps {
  valoresIniciais: LancamentoFormValues;
  onSalvar: (valores: LancamentoFormValues) => Promise<void>;
  onCancelar: () => void;
  salvando?: boolean;
}

export function LancamentoForm({ valoresIniciais, onSalvar, onCancelar, salvando }: LancamentoFormProps) {
  const [valores, setValores] = useState<LancamentoFormValues>(valoresIniciais);
  const [erros, setErros] = useState<Record<string, string>>({});

  function set<K extends keyof LancamentoFormValues>(campo: K, valor: LancamentoFormValues[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  function validar(): boolean {
    const proximos: Record<string, string> = {};
    if (!valores.descricao.trim()) proximos.descricao = "Informe uma descrição.";
    if (valores.valor <= 0) proximos.valor = "Informe um valor maior que zero.";
    setErros(proximos);
    return Object.keys(proximos).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    await onSalvar(valores);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex rounded-control border border-border-strong bg-cream-dark p-1">
        {(["receber", "pagar"] as TipoLancamento[]).map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => set("tipo", tipo)}
            className={`flex-1 rounded-[calc(var(--radius-control)-4px)] py-2 text-sm font-semibold transition-colors ${
              valores.tipo === tipo ? "bg-white text-terracotta-600 shadow-soft" : "text-ink-soft"
            }`}
          >
            {tipo === "receber" ? "Contas a receber" : "Contas a pagar"}
          </button>
        ))}
      </div>

      <Field label="Descrição" required error={erros.descricao}>
        <Input value={valores.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Ex: OS 1050 · João Pedro" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria">
          <Input value={valores.categoria} onChange={(e) => set("categoria", e.target.value)} placeholder="Ex: Serviços" />
        </Field>
        <Field label="Valor" required error={erros.valor}>
          <Input type="number" min={0} step="0.01" value={valores.valor} onChange={(e) => set("valor", Number(e.target.value))} />
        </Field>
        <Field label="Vencimento">
          <Input type="date" value={valores.vencimento} onChange={(e) => set("vencimento", e.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={valores.status} onChange={(e) => set("status", e.target.value as StatusLancamento)}>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </Select>
        </Field>
      </div>

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
