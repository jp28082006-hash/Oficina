import { createMockStore } from "../lib/mockStore";
import { produtosSeed } from "../data/seed";
import type { Produto } from "../types/produto";

export const estoqueService = createMockStore<Produto>("oficina:estoque", produtosSeed);
