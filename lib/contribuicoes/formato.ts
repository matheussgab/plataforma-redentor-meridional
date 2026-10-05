/**
 * Máscaras e validações usadas no checkout (navegador) e na API (servidor).
 */

/** Lê "1.234,56" (ou só dígitos) como centavos inteiros. */
export function lerMoeda(texto: string): number {
  const digitos = texto.replace(/\D/g, "");
  return digitos ? parseInt(digitos, 10) : 0;
}

/** Máscara de moeda: os dígitos digitados são centavos ("2050" -> "20,50"). */
export function mascararMoeda(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 9);
  if (!digitos) return "";
  return (parseInt(digitos, 10) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function mascararCpf(texto: string): string {
  return texto
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

export function mascararTelefone(texto: string): string {
  const d = texto.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

/** Dígitos verificadores do CPF: o Asaas recusa CPF inválido, melhor avisar antes. */
export function cpfValido(texto: string): boolean {
  const d = texto.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (ate: number) => {
    let soma = 0;
    for (let i = 0; i < ate; i++) soma += Number(d[i]) * (ate + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}
