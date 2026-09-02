/**
 * Validação de dígito verificador real de CPF/CNPJ, espelhando a regra
 * usada no backend (backend/validadores.py, via validate-docbr) para dar
 * feedback instantâneo no formulário sem esperar a resposta da API.
 */

function calcDigitoCpf(base: string, pesoInicial: number): number {
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (pesoInicial - i);
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function isValidCpf(digits: string): boolean {
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const d1 = calcDigitoCpf(digits.slice(0, 9), 10);
  const d2 = calcDigitoCpf(digits.slice(0, 9) + d1, 11);
  return digits === digits.slice(0, 9) + String(d1) + String(d2);
}

function calcDigitoCnpj(base: string): number {
  const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * pesos[i];
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function isValidCnpj(digits: string): boolean {
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const d1 = calcDigitoCnpj(digits.slice(0, 12));
  const d2 = calcDigitoCnpj(digits.slice(0, 12) + d1);
  return digits === digits.slice(0, 12) + String(d1) + String(d2);
}

export function isValidDocumento(tipoPessoa: "PF" | "PJ", digits: string): boolean {
  return tipoPessoa === "PF" ? isValidCpf(digits) : isValidCnpj(digits);
}
