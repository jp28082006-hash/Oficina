import { api } from "../lib/api";
import type { OrdemServico, OrdemServicoFormValues, ItemOS, StatusOS } from "../types/ordemServico";

interface ItemOSApi {
  id: number;
  tipo: "servico" | "peca";
  descricao: string;
  quantidade: number;
  valor_unitario: string;
}

interface OrdemServicoApi {
  id: number;
  numero: number;
  cliente: number;
  cliente_nome: string;
  veiculo: number;
  veiculo_descricao: string;
  status: StatusOS;
  mecanico_responsavel: string;
  data_abertura: string;
  data_previsao: string;
  itens: ItemOSApi[];
  observacoes: string | null;
}

function itemFromApi(item: ItemOSApi): ItemOS {
  return {
    id: String(item.id),
    tipo: item.tipo,
    descricao: item.descricao,
    quantidade: item.quantidade,
    valorUnitario: Number(item.valor_unitario),
  };
}

function fromApi(os: OrdemServicoApi): OrdemServico {
  return {
    id: String(os.id),
    numero: os.numero,
    clienteId: os.cliente,
    clienteNome: os.cliente_nome,
    veiculoId: String(os.veiculo),
    veiculoDescricao: os.veiculo_descricao,
    status: os.status,
    mecanicoResponsavel: os.mecanico_responsavel,
    dataAbertura: os.data_abertura,
    dataPrevisao: os.data_previsao,
    itens: os.itens.map(itemFromApi),
    observacoes: os.observacoes ?? "",
  };
}

function toApi(valores: OrdemServicoFormValues) {
  return {
    cliente: valores.clienteId,
    veiculo: Number(valores.veiculoId),
    status: valores.status,
    mecanico_responsavel: valores.mecanicoResponsavel,
    data_abertura: valores.dataAbertura,
    data_previsao: valores.dataPrevisao,
    observacoes: valores.observacoes || null,
    itens: valores.itens.map((item) => ({
      tipo: item.tipo,
      descricao: item.descricao,
      quantidade: item.quantidade,
      valor_unitario: item.valorUnitario,
    })),
  };
}

export const ordensServicoService = {
  listar: async () => (await api.get<OrdemServicoApi[]>("/ordens-servico/")).map(fromApi),
  criar: async (valores: OrdemServicoFormValues) =>
    fromApi(await api.post<OrdemServicoApi>("/ordens-servico/", toApi(valores))),
  atualizar: async (id: string, valores: OrdemServicoFormValues) =>
    fromApi(await api.patch<OrdemServicoApi>(`/ordens-servico/${id}/`, toApi(valores))),
  remover: (id: string) => api.delete<void>(`/ordens-servico/${id}/`),
};
