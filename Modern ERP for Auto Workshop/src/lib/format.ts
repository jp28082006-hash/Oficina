export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR");
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCpfCnpj(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, (_m, a, b, c) => (c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`));
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, (_m, a, b, c) => (c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`));
}

export function formatCep(digits: string): string {
  const d = digits.replace(/\D/g, "");
  return d.replace(/(\d{5})(\d{0,3})/, (_m, a, b) => (b ? `${a}-${b}` : a));
}

export function formatPlaca(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}
