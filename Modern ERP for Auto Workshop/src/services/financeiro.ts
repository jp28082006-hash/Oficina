import { api } from "../lib/api";
import type { Lancamento, LancamentoFormValues, StatusLancamento, TipoLancamento } from "../types/financeiro";

interface LancamentoApi {
  id: number;
  tipo: TipoLancamento;
  descricao: string;
  categoria: string | null;
  valor: string;
  vencimento: string;
  status: StatusLancamento;
  ordem_servico: number | null;
  os_numero: number | null;
  data_cadastro: string;
}

function fromApi(l: LancamentoApi): Lancamento {
  return {
    id: String(l.id),
    tipo: l.tipo,
    descricao: l.descricao,
    categoria: l.categoria ?? "",
    valor: Number(l.valor),
    vencimento: l.vencimento,
    status: l.status,
    osNumero: l.os_numero ?? undefined,
    criadoEm: l.data_cadastro,
  };
}

function toApi(valores: Partial<LancamentoFormValues>) {
  return {
    tipo: valores.tipo,
    descricao: valores.descricao,
    categoria: valores.categoria || null,
    valor: valores.valor,
    vencimento: valores.vencimento,
    status: valores.status,
  };
}

export const financeiroService = {
  listar: async () => (await api.get<LancamentoApi[]>("/lancamentos/")).map(fromApi),
  criar: async (valores: LancamentoFormValues) =>
    fromApi(await api.post<LancamentoApi>("/lancamentos/", toApi(valores))),
  atualizar: async (id: string, valores: Partial<LancamentoFormValues>) =>
    fromApi(await api.patch<LancamentoApi>(`/lancamentos/${id}/`, toApi(valores))),
  remover: (id: string) => api.delete<void>(`/lancamentos/${id}/`),
};
