import { api } from "../lib/api";
import type { Veiculo, VeiculoFormValues } from "../types/veiculo";

interface VeiculoApi {
  id: number;
  cliente: number;
  cliente_nome: string;
  placa: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  ano_modelo: number;
  cor: string | null;
  km: number;
  observacoes: string | null;
  ativo: boolean;
  data_cadastro: string;
}

function fromApi(v: VeiculoApi): Veiculo {
  return {
    id: String(v.id),
    clienteId: v.cliente,
    clienteNome: v.cliente_nome,
    placa: v.placa,
    marca: v.marca,
    modelo: v.modelo,
    anoFabricacao: v.ano_fabricacao,
    anoModelo: v.ano_modelo,
    cor: v.cor ?? "",
    km: v.km,
    observacoes: v.observacoes ?? "",
    criadoEm: v.data_cadastro,
    ativo: v.ativo,
  };
}

function toApi(valores: VeiculoFormValues) {
  return {
    cliente: valores.clienteId,
    placa: valores.placa,
    marca: valores.marca,
    modelo: valores.modelo,
    ano_fabricacao: valores.anoFabricacao,
    ano_modelo: valores.anoModelo,
    cor: valores.cor || null,
    km: valores.km,
    observacoes: valores.observacoes || null,
  };
}

function query(incluirInativos?: boolean): string {
  return incluirInativos ? "?incluir_inativos=true" : "";
}

export const veiculosService = {
  listar: async (incluirInativos?: boolean) =>
    (await api.get<VeiculoApi[]>(`/veiculos/${query(incluirInativos)}`)).map(fromApi),
  criar: async (valores: VeiculoFormValues) => fromApi(await api.post<VeiculoApi>("/veiculos/", toApi(valores))),
  atualizar: async (id: string, valores: VeiculoFormValues) =>
    fromApi(await api.patch<VeiculoApi>(`/veiculos/${id}/`, toApi(valores))),
  inativar: (id: string) => api.delete<void>(`/veiculos/${id}/`),
  reativar: async (id: string) => fromApi(await api.post<VeiculoApi>(`/veiculos/${id}/reativar/`, {})),
};
