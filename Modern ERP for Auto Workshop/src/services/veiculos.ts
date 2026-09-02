import { createMockStore } from "../lib/mockStore";
import { veiculosSeed } from "../data/seed";
import type { Veiculo } from "../types/veiculo";

export const veiculosService = createMockStore<Veiculo>("oficina:veiculos", veiculosSeed);
