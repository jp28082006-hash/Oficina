/**
 * Store local (localStorage) com a MESMA assinatura assíncrona de uma
 * chamada de API real. Serve os módulos que ainda não têm modelo no
 * backend Django (Veículos, Ordens de Serviço, Estoque, Financeiro) —
 * quando o model existir, basta trocar o service por chamadas a `api`
 * (ver src/services/clientes.ts) sem tocar nas telas.
 */

function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function createMockStore<T extends { id: string }>(key: string, seed: T[]) {
  function read(): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return seed;
    }
  }

  function write(items: T[]) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  return {
    listar: () => delay([...read()]),
    obter: (id: string) => delay(read().find((item) => item.id === id)),
    criar: (item: T) => {
      const items = read();
      items.unshift(item);
      write(items);
      return delay(item);
    },
    atualizar: (id: string, patch: Partial<T>) => {
      const items = read();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return delay(undefined);
      items[index] = { ...items[index], ...patch };
      write(items);
      return delay(items[index]);
    },
    remover: (id: string) => {
      const items = read().filter((item) => item.id !== id);
      write(items);
      return delay(undefined);
    },
    resetar: () => {
      write(seed);
      return delay([...seed]);
    },
  };
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
