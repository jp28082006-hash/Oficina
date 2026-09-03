export interface Veiculo {
  id: string;
  clienteId: number;
  clienteNome: string;
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  km: number;
  observacoes?: string;
  criadoEm: string;
  ativo: boolean;
}

export type VeiculoFormValues = Omit<Veiculo, "id" | "criadoEm" | "clienteNome" | "ativo">;

export const veiculoFormValuesVazio: VeiculoFormValues = {
  clienteId: 0,
  placa: "",
  marca: "",
  modelo: "",
  anoFabricacao: new Date().getFullYear(),
  anoModelo: new Date().getFullYear(),
  cor: "",
  km: 0,
  observacoes: "",
};
