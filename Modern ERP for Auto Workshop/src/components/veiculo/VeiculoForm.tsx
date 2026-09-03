import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { Button } from "../ui/Button";
import type { VeiculoFormValues } from "../../types/veiculo";
import type { Pessoa } from "../../types/pessoa";
import { formatPlaca } from "../../lib/format";

interface VeiculoFormProps {
  valoresIniciais: VeiculoFormValues;
  onSalvar: (valores: VeiculoFormValues) => Promise<void>;
  onCancelar: () => void;
  salvando?: boolean;
  clientes: Pessoa[];
  carregandoClientes: boolean;
  erroClientes: boolean;
  erroServidor?: Record<string, string[]>;
}

export function VeiculoForm({
  valoresIniciais,
  onSalvar,
  onCancelar,
  salvando,
  clientes,
  carregandoClientes,
  erroClientes,
  erroServidor,
}: VeiculoFormProps) {
  const [valores, setValores] = useState<VeiculoFormValues>(valoresIniciais);
  const [erros, setErros] = useState<Record<string, string>>({});

  function set<K extends keyof VeiculoFormValues>(campo: K, valor: VeiculoFormValues[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  function validar(): boolean {
    const proximos: Record<string, string> = {};
    if (!valores.clienteId) proximos.clienteId = "Selecione o cliente.";
    if (!valores.placa.trim()) proximos.placa = "Informe a placa.";
    if (!valores.marca.trim()) proximos.marca = "Informe a marca.";
    if (!valores.modelo.trim()) proximos.modelo = "Informe o modelo.";
    setErros(proximos);
    return Object.keys(proximos).length === 0;
  }

  const erroCampo = (campo: string, campoApi: string) => erros[campo] ?? erroServidor?.[campoApi]?.[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    await onSalvar(valores);
  }

  if (!carregandoClientes && clientes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <p className="text-sm text-ink-soft">
          {erroClientes
            ? "Não foi possível carregar os clientes. Verifique se o backend está rodando."
            : "Cadastre um cliente antes de vincular um veículo a ele."}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancelar}>
            Fechar
          </Button>
          {!erroClientes && (
            <Link to="/clientes">
              <Button type="button">Ir para Clientes</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Cliente" required error={erroCampo("clienteId", "cliente")}>
        <Select
          value={valores.clienteId || ""}
          onChange={(e) => set("clienteId", Number(e.target.value))}
          disabled={carregandoClientes}
        >
          <option value="">{carregandoClientes ? "Carregando…" : "Selecione…"}</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome_razao_social}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Placa" required error={erroCampo("placa", "placa")}>
          <Input
            value={valores.placa}
            onChange={(e) => set("placa", formatPlaca(e.target.value))}
            maxLength={7}
            placeholder="ABC1D23"
            className="tabular uppercase"
          />
        </Field>
        <Field label="Cor">
          <Input value={valores.cor} onChange={(e) => set("cor", e.target.value)} />
        </Field>
        <Field label="Marca" required error={erros.marca}>
          <Input value={valores.marca} onChange={(e) => set("marca", e.target.value)} placeholder="Ex: Volkswagen" />
        </Field>
        <Field label="Modelo" required error={erros.modelo}>
          <Input value={valores.modelo} onChange={(e) => set("modelo", e.target.value)} placeholder="Ex: Gol 1.6" />
        </Field>
        <Field label="Ano de fabricação">
          <Input
            type="number"
            value={valores.anoFabricacao}
            onChange={(e) => set("anoFabricacao", Number(e.target.value))}
          />
        </Field>
        <Field label="Ano do modelo">
          <Input type="number" value={valores.anoModelo} onChange={(e) => set("anoModelo", Number(e.target.value))} />
        </Field>
        <Field label="KM atual" className="sm:col-span-2">
          <Input type="number" value={valores.km} onChange={(e) => set("km", Number(e.target.value))} />
        </Field>
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
