/** Id local usado só como React key (ex.: itens de OS antes de salvar) — nunca é enviado à API. */
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
