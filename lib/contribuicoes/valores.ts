/**
 * Valores e regras das contribuições. Dinheiro SEMPRE em centavos (inteiro).
 *
 * Os três valores da contribuição recorrente são fixos (definidos com o
 * cliente): o navegador manda só o CÓDIGO e o servidor busca o valor aqui.
 * A contribuição única aceita qualquer valor dentro dos limites.
 */
export const VALORES_RECORRENTES = [
  { codigo: "990", centavos: 990 },
  { codigo: "4990", centavos: 4_990 },
  { codigo: "14990", centavos: 14_990 },
] as const;

export const VALOR_RECORRENTE_PADRAO: CodigoRecorrente = "4990";

/** Sugestões da contribuição única (o valor livre continua aberto). */
export const SUGESTOES_UNICA_CENTAVOS = [2_500, 5_000, 10_000] as const;

export type CodigoRecorrente = (typeof VALORES_RECORRENTES)[number]["codigo"];

/**
 * Limites da contribuição única. O mínimo NÃO pode ficar abaixo de R$ 5: o
 * Asaas recusa cobrança menor (ver docs/ARQUITETURA-PAGAMENTOS.txt).
 */
export const UNICA_MINIMO_CENTAVOS = 500;
export const UNICA_MAXIMO_CENTAVOS = 1_000_000;

export type Tipo = "recorrente" | "unica";
export type Forma = "pix" | "cartao";

export function recorrentePorCodigo(codigo: string) {
  return VALORES_RECORRENTES.find((v) => v.codigo === codigo) ?? null;
}

export function formatarReais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
