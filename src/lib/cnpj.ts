const PESOS_DO_PRIMEIRO_DIGITO = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_DO_SEGUNDO_DIGITO = [6, ...PESOS_DO_PRIMEIRO_DIGITO];

export function normalizarCnpj(cnpj: string) {
  return cnpj.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

// Desde jul/2026 a Receita também emite CNPJ alfanumérico: no cálculo, cada caractere vale (código ASCII - 48),
// o que mantém o resultado igual ao antigo para CNPJs só com números.
function digitoVerificador(base: string, pesos: number[]) {
  const soma = [...base].reduce((total, caractere, indice) => total + (caractere.charCodeAt(0) - 48) * pesos[indice], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cnpjValido(cnpj: string) {
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(.)\1+$/.test(cnpj)) return false;
  const base = cnpj.slice(0, 12);
  const primeiroDigito = digitoVerificador(base, PESOS_DO_PRIMEIRO_DIGITO);
  const segundoDigito = digitoVerificador(base + primeiroDigito, PESOS_DO_SEGUNDO_DIGITO);
  return cnpj.endsWith(`${primeiroDigito}${segundoDigito}`);
}

export function formatarCnpj(cnpj: string) {
  return cnpj.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, "$1.$2.$3/$4-$5");
}
