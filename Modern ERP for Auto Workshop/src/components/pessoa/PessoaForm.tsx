import { useState } from "react";
import type { FormEvent } from "react";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { Button } from "../ui/Button";
import type { PessoaFormValues, TipoPessoa } from "../../types/pessoa";
import { formatCep, formatCpfCnpj, formatPhone, onlyDigits } from "../../lib/format";
import { isValidDocumento } from "../../lib/cpfCnpj";
import { buscarEnderecoPorCep } from "../../lib/viacep";

interface PessoaFormProps {
  valoresIniciais: PessoaFormValues;
  onSalvar: (valores: PessoaFormValues) => Promise<void>;
  onCancelar: () => void;
  erroServidor?: Record<string, string[]>;
  salvando?: boolean;
}

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export function PessoaForm({ valoresIniciais, onSalvar, onCancelar, erroServidor, salvando }: PessoaFormProps) {
  const [valores, setValores] = useState<PessoaFormValues>(valoresIniciais);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [buscandoCep, setBuscandoCep] = useState(false);

  function set<K extends keyof PessoaFormValues>(campo: K, valor: PessoaFormValues[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  function trocarTipoPessoa(tipo: TipoPessoa) {
    setValores((prev) => ({ ...prev, tipo_pessoa: tipo, cpf_cnpj: "" }));
  }

  async function handleCepBlur() {
    const digits = onlyDigits(valores.cep ?? "");
    if (digits.length !== 8) return;
    setBuscandoCep(true);
    const endereco = await buscarEnderecoPorCep(digits);
    setBuscandoCep(false);
    if (endereco) {
      setValores((prev) => ({
        ...prev,
        logradouro: endereco.logradouro || prev.logradouro,
        bairro: endereco.bairro || prev.bairro,
        cidade: endereco.cidade || prev.cidade,
        uf: endereco.uf || prev.uf,
      }));
    }
  }

  function validar(): boolean {
    const proximos: Record<string, string> = {};
    if (!valores.nome_razao_social.trim()) {
      proximos.nome_razao_social = valores.tipo_pessoa === "PF" ? "Informe o nome." : "Informe a razão social.";
    }
    const documento = onlyDigits(valores.cpf_cnpj);
    if (!documento) {
      proximos.cpf_cnpj = valores.tipo_pessoa === "PF" ? "Informe o CPF." : "Informe o CNPJ.";
    } else if (!isValidDocumento(valores.tipo_pessoa, documento)) {
      proximos.cpf_cnpj = valores.tipo_pessoa === "PF" ? "CPF inválido." : "CNPJ inválido.";
    }
    if (!onlyDigits(valores.telefone_principal)) {
      proximos.telefone_principal = "Informe um telefone de contato.";
    }
    setErros(proximos);
    return Object.keys(proximos).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    await onSalvar({ ...valores, cpf_cnpj: onlyDigits(valores.cpf_cnpj) });
  }

  const erroCampo = (campo: string) => erros[campo] ?? erroServidor?.[campo]?.[0];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex rounded-control border border-border-strong bg-cream-dark p-1">
        {(["PF", "PJ"] as TipoPessoa[]).map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => trocarTipoPessoa(tipo)}
            className={`flex-1 rounded-[calc(var(--radius-control)-4px)] py-2 text-sm font-semibold transition-colors ${
              valores.tipo_pessoa === tipo ? "bg-white text-terracotta-600 shadow-soft" : "text-ink-soft"
            }`}
          >
            {tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={valores.tipo_pessoa === "PF" ? "Nome completo" : "Razão social"}
          required
          error={erroCampo("nome_razao_social")}
          className="sm:col-span-2"
        >
          <Input
            value={valores.nome_razao_social}
            onChange={(e) => set("nome_razao_social", e.target.value)}
            placeholder={valores.tipo_pessoa === "PF" ? "Ex: Marcos Andrade" : "Ex: Auto Peças Bahia Ltda"}
          />
        </Field>

        {valores.tipo_pessoa === "PJ" && (
          <Field label="Nome fantasia" className="sm:col-span-2">
            <Input
              value={valores.nome_fantasia ?? ""}
              onChange={(e) => set("nome_fantasia", e.target.value)}
              placeholder="Ex: AutoPeças BA"
            />
          </Field>
        )}

        <Field label={valores.tipo_pessoa === "PF" ? "CPF" : "CNPJ"} required error={erroCampo("cpf_cnpj")}>
          <Input
            value={formatCpfCnpj(valores.cpf_cnpj)}
            onChange={(e) => set("cpf_cnpj", onlyDigits(e.target.value))}
            inputMode="numeric"
            maxLength={valores.tipo_pessoa === "PF" ? 14 : 18}
            placeholder={valores.tipo_pessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
          />
        </Field>

        <Field label={valores.tipo_pessoa === "PF" ? "RG" : "Inscrição Estadual"}>
          <Input value={valores.rg_ie ?? ""} onChange={(e) => set("rg_ie", e.target.value)} />
        </Field>

        <Field label="Telefone principal" required error={erroCampo("telefone_principal")}>
          <Input
            value={formatPhone(valores.telefone_principal)}
            onChange={(e) => set("telefone_principal", onlyDigits(e.target.value))}
            inputMode="numeric"
            maxLength={15}
            placeholder="(11) 99999-9999"
          />
        </Field>

        <Field label="Telefone secundário">
          <Input
            value={formatPhone(valores.telefone_secundario ?? "")}
            onChange={(e) => set("telefone_secundario", onlyDigits(e.target.value))}
            inputMode="numeric"
            maxLength={15}
          />
        </Field>

        <Field label="E-mail" className="sm:col-span-2" error={erroCampo("email")}>
          <Input
            type="email"
            value={valores.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="contato@exemplo.com"
          />
        </Field>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-semibold text-ink-soft">Endereço</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="CEP" hint={buscandoCep ? "Buscando endereço…" : undefined}>
            <Input
              value={formatCep(valores.cep ?? "")}
              onChange={(e) => set("cep", onlyDigits(e.target.value))}
              onBlur={handleCepBlur}
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
            />
          </Field>
          <Field label="Logradouro" className="sm:col-span-2">
            <Input value={valores.logradouro ?? ""} onChange={(e) => set("logradouro", e.target.value)} />
          </Field>
          <Field label="Número">
            <Input value={valores.numero ?? ""} onChange={(e) => set("numero", e.target.value)} />
          </Field>
          <Field label="Complemento">
            <Input value={valores.complemento ?? ""} onChange={(e) => set("complemento", e.target.value)} />
          </Field>
          <Field label="Bairro">
            <Input value={valores.bairro ?? ""} onChange={(e) => set("bairro", e.target.value)} />
          </Field>
          <Field label="Cidade">
            <Input value={valores.cidade ?? ""} onChange={(e) => set("cidade", e.target.value)} />
          </Field>
          <Field label="UF">
            <Select value={valores.uf ?? ""} onChange={(e) => set("uf", e.target.value)}>
              <option value="">—</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </Select>
          </Field>
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
