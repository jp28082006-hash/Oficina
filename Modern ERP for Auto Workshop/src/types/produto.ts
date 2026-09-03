export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  quantidadeMinima: number;
  unidade: string;
  precoCusto: number;
  precoVenda: number;
  fornecedorId?: number;
  fornecedorNome?: string;
  criadoEm: string;
  ativo: boolean;
}

export type ProdutoFormValues = Omit<Produto, "id" | "criadoEm" | "fornecedorNome" | "ativo">;

export const produtoFormValuesVazio: ProdutoFormValues = {
  nome: "",
  categoria: "",
  quantidade: 0,
  quantidadeMinima: 5,
  unidade: "un",
  precoCusto: 0,
  precoVenda: 0,
  fornecedorId: undefined,
};
