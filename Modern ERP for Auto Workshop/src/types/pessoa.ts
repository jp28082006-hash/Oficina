export type TipoPessoa = "PF" | "PJ";

/** Campos compartilhados por Cliente e Fornecedor — os models Django são espelhados. */
export interface Pessoa {
  id: number;
  tipo_pessoa: TipoPessoa;
  nome_razao_social: string;
  nome_fantasia?: string | null;
  cpf_cnpj: string;
  rg_ie?: string | null;
  email?: string | null;
  telefone_principal: string;
  telefone_secundario?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  data_cadastro: string;
  data_atualizacao: string;
}

export type PessoaFormValues = Omit<
  Pessoa,
  "id" | "ativo" | "data_cadastro" | "data_atualizacao"
>;

export const pessoaFormValuesVazio: PessoaFormValues = {
  tipo_pessoa: "PF",
  nome_razao_social: "",
  nome_fantasia: "",
  cpf_cnpj: "",
  rg_ie: "",
  email: "",
  telefone_principal: "",
  telefone_secundario: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  observacoes: "",
};

export type Cliente = Pessoa;
export type Fornecedor = Pessoa;
