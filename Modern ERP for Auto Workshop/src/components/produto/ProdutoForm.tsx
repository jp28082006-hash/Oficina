import { useState } from "react";
import type { FormEvent } from "react";
import { Field, Input, Select } from "../ui/Field";
import { Button } from "../ui/Button";
import type { ProdutoFormValues } from "../../types/produto";
import type { Pessoa } from "../../types/pessoa";

interface ProdutoFormProps {
  valoresIniciais: ProdutoFormValues;
  onSalvar: (valores: ProdutoFormValues) => Promise<void>;
  onCancelar: () => void;
  salvando?: boolean;
  fornecedores: Pessoa[];
  erroServidor?: Record<string, string[]>;
}

const UNIDADES = ["un", "jogo", "litro", "kg", "par", "kit"];

export function ProdutoForm({
  valoresIniciais,
  onSalvar,
  onCancelar,
  salvando,
  fornecedores,
  erroServidor,
}: ProdutoFormProps) {
  const [valores, setValores] = useState<ProdutoFormValues>(valoresIniciais);
  const [erros, setErros] = useState<Record<string, string>>({});

  function set<K extends keyof ProdutoFormValues>(campo: K, valor: ProdutoFormValues[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  function validar(): boolean {
    const proximos: Record<string, string> = {};
    if (!valores.nome.trim()) proximos.nome = "Informe o nome da peça ou produto.";
    if (valores.precoVenda < valores.precoCusto) proximos.precoVenda = "Preço de venda menor que o custo.";
    setErros(proximos);
    return Object.keys(proximos).length === 0;
  }

  const erroCampo = (campo: string, campoApi: string) => erros[campo] ?? erroServidor?.[campoApi]?.[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    await onSalvar(valores);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nome" required error={erroCampo("nome", "nome")}>
        <Input value={valores.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: Filtro de óleo" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria">
          <Input value={valores.categoria} onChange={(e) => set("categoria", e.target.value)} placeholder="Ex: Filtros" />
        </Field>
        <Field label="Unidade">
          <Select value={valores.unidade} onChange={(e) => set("unidade", e.target.value)}>
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Quantidade em estoque">
          <Input type="number" min={0} value={valores.quantidade} onChange={(e) => set("quantidade", Number(e.target.value))} />
        </Field>
        <Field label="Quantidade mínima" hint="Abaixo disso, gera alerta">
          <Input
            type="number"
            min={0}
            value={valores.quantidadeMinima}
            onChange={(e) => set("quantidadeMinima", Number(e.target.value))}
          />
        </Field>
        <Field label="Preço de custo">
          <Input type="number" min={0} step="0.01" value={valores.precoCusto} onChange={(e) => set("precoCusto", Number(e.target.value))} />
        </Field>
        <Field label="Preço de venda" error={erros.precoVenda}>
          <Input type="number" min={0} step="0.01" value={valores.precoVenda} onChange={(e) => set("precoVenda", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Fornecedor" hint="Opcional">
        <Select
          value={valores.fornecedorId ?? ""}
          onChange={(e) => set("fornecedorId", e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Nenhum</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome_razao_social}
            </option>
          ))}
        </Select>
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
