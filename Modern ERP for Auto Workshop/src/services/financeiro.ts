import { createMockStore } from "../lib/mockStore";
import { lancamentosSeed } from "../data/seed";
import type { Lancamento } from "../types/financeiro";

export const financeiroService = createMockStore<Lancamento>("oficina:financeiro", lancamentosSeed);
