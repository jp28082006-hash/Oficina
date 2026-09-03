import { api } from "../lib/api";
import type { Produto, ProdutoFormValues } from "../types/produto";

interface ProdutoApi {
  id: number;
  nome: string;
  categoria: string | null;
  quantidade: number;
  quantidade_minima: number;
  unidade: string;
  preco_custo: string;
  preco_venda: string;
  fornecedor: number | null;
  fornecedor_nome: string | null;
  ativo: boolean;
  data_cadastro: string;
}

function fromApi(p: ProdutoApi): Produto {
  return {
    id: String(p.id),
    nome: p.nome,
    categoria: p.categoria ?? "",
    quantidade: p.quantidade,
    quantidadeMinima: p.quantidade_minima,
    unidade: p.unidade,
    precoCusto: Number(p.preco_custo),
    precoVenda: Number(p.preco_venda),
    fornecedorId: p.fornecedor ?? undefined,
    fornecedorNome: p.fornecedor_nome ?? undefined,
    criadoEm: p.data_cadastro,
    ativo: p.ativo,
  };
}

function toApi(valores: ProdutoFormValues) {
  return {
    nome: valores.nome,
    categoria: valores.categoria || null,
    quantidade: valores.quantidade,
    quantidade_minima: valores.quantidadeMinima,
    unidade: valores.unidade,
    preco_custo: valores.precoCusto,
    preco_venda: valores.precoVenda,
    fornecedor: valores.fornecedorId ?? null,
  };
}

function query(incluirInativos?: boolean): string {
  return incluirInativos ? "?incluir_inativos=true" : "";
}

export const estoqueService = {
  listar: async (incluirInativos?: boolean) =>
    (await api.get<ProdutoApi[]>(`/produtos/${query(incluirInativos)}`)).map(fromApi),
  criar: async (valores: ProdutoFormValues) => fromApi(await api.post<ProdutoApi>("/produtos/", toApi(valores))),
  atualizar: async (id: string, valores: ProdutoFormValues) =>
    fromApi(await api.patch<ProdutoApi>(`/produtos/${id}/`, toApi(valores))),
  inativar: (id: string) => api.delete<void>(`/produtos/${id}/`),
  reativar: async (id: string) => fromApi(await api.post<ProdutoApi>(`/produtos/${id}/reativar/`, {})),
};
