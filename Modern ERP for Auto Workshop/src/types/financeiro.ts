export type TipoLancamento = "receber" | "pagar";
export type StatusLancamento = "pendente" | "pago" | "atrasado";

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  descricao: string;
  categoria: string;
  valor: number;
  vencimento: string;
  status: StatusLancamento;
  osNumero?: number;
  criadoEm: string;
}

export type LancamentoFormValues = Omit<Lancamento, "id" | "criadoEm">;

export const lancamentoFormValuesVazio: LancamentoFormValues = {
  tipo: "receber",
  descricao: "",
  categoria: "",
  valor: 0,
  vencimento: new Date().toISOString().slice(0, 10),
  status: "pendente",
};
