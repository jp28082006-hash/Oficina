export type StatusOS =
  | "aberta"
  | "em_andamento"
  | "aguardando_peca"
  | "concluida"
  | "entregue"
  | "cancelada";

export const STATUS_OS_LABEL: Record<StatusOS, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando_peca: "Aguardando peça",
  concluida: "Concluída",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

export const STATUS_OS_ORDER: StatusOS[] = [
  "aberta",
  "em_andamento",
  "aguardando_peca",
  "concluida",
  "entregue",
];

export const STATUS_OS_TONE: Record<StatusOS, "amber" | "blue" | "red" | "teal" | "neutral"> = {
  aberta: "amber",
  em_andamento: "blue",
  aguardando_peca: "red",
  concluida: "teal",
  entregue: "neutral",
  cancelada: "neutral",
};

export interface ItemOS {
  id: string;
  tipo: "servico" | "peca";
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export interface OrdemServico {
  id: string;
  numero: number;
  clienteId: number;
  clienteNome: string;
  veiculoId: string;
  veiculoDescricao: string;
  status: StatusOS;
  mecanicoResponsavel: string;
  dataAbertura: string;
  dataPrevisao: string;
  itens: ItemOS[];
  observacoes?: string;
}

export type OrdemServicoFormValues = Omit<
  OrdemServico,
  "id" | "numero" | "clienteNome" | "veiculoDescricao"
>;

export function calcularTotalOS(itens: ItemOS[]): number {
  return itens.reduce((total, item) => total + item.quantidade * item.valorUnitario, 0);
}

export const ordemServicoFormValuesVazio: OrdemServicoFormValues = {
  clienteId: 0,
  veiculoId: "",
  status: "aberta",
  mecanicoResponsavel: "",
  dataAbertura: new Date().toISOString().slice(0, 10),
  dataPrevisao: new Date().toISOString().slice(0, 10),
  itens: [],
  observacoes: "",
};
