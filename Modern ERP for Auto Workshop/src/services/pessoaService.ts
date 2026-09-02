import { api } from "../lib/api";
import type { Pessoa, PessoaFormValues } from "../types/pessoa";

export interface FiltrosPessoa {
  busca?: string;
  tipo_pessoa?: string;
  incluir_inativos?: boolean;
}

function query(filtros: FiltrosPessoa = {}): string {
  const params = new URLSearchParams();
  if (filtros.busca) params.set("search", filtros.busca);
  if (filtros.tipo_pessoa) params.set("tipo_pessoa", filtros.tipo_pessoa);
  if (filtros.incluir_inativos) params.set("incluir_inativos", "true");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Fábrica de service — Cliente e Fornecedor usam o mesmo contrato de API (ver backend/urls.py). */
export function createPessoaService(resource: "clientes" | "fornecedores") {
  return {
    listar: (filtros?: FiltrosPessoa) => api.get<Pessoa[]>(`/${resource}/${query(filtros)}`),
    obter: (id: number) => api.get<Pessoa>(`/${resource}/${id}/`),
    criar: (dados: PessoaFormValues) => api.post<Pessoa>(`/${resource}/`, dados),
    atualizar: (id: number, dados: PessoaFormValues) => api.patch<Pessoa>(`/${resource}/${id}/`, dados),
    inativar: (id: number) => api.delete<void>(`/${resource}/${id}/`),
    reativar: (id: number) => api.post<Pessoa>(`/${resource}/${id}/reativar/`, {}),
  };
}
