import { createMockStore } from "../lib/mockStore";
import { ordensServicoSeed } from "../data/seed";
import type { OrdemServico } from "../types/ordemServico";

const store = createMockStore<OrdemServico>("oficina:ordens_servico", ordensServicoSeed);

export const ordensServicoService = {
  ...store,
  async proximoNumero(): Promise<number> {
    const itens = await store.listar();
    return itens.reduce((max, os) => Math.max(max, os.numero), 1000) + 1;
  },
};
