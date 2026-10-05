/** Formato das linhas que o painel recebe do servidor (já sem nada sensível). */
export type LinhaContribuicao = {
  id: string;
  nome: string;
  email: string | null;
  tipo: "recorrente" | "unica";
  forma: "pix" | "cartao";
  valorCentavos: number;
  repasseCentavos: number | null;
  status: "pendente" | "pago" | "vencido" | "cancelado" | "estornado";
  pagoEm: string | null;
  criadoEm: string;
};

export type LinhaRecorrente = {
  id: string;
  nome: string;
  email: string | null;
  forma: "pix" | "cartao";
  valorCentavos: number;
  status: "ativa" | "cancelada";
  criadoEm: string;
  canceladoEm: string | null;
};

const dia = 864e5;
const agora = Date.now();
const em = (dias: number) => new Date(agora - dias * dia).toISOString();

/** Dados fictícios do modo demonstração (sem Supabase configurado). */
export const DEMO_CONTRIBUICOES: LinhaContribuicao[] = [
  { id: "d1", nome: "Ana Exemplo", email: "ana@example.com", tipo: "recorrente", forma: "cartao", valorCentavos: 4_990, repasseCentavos: 640, status: "pago", pagoEm: em(0), criadoEm: em(0) },
  { id: "d2", nome: "Carlos Exemplo", email: "carlos@example.com", tipo: "unica", forma: "pix", valorCentavos: 10_000, repasseCentavos: 1_000, status: "pago", pagoEm: em(1), criadoEm: em(1) },
  { id: "d3", nome: "Mariana Exemplo", email: "mariana@example.com", tipo: "recorrente", forma: "cartao", valorCentavos: 14_990, repasseCentavos: 1_900, status: "pago", pagoEm: em(2), criadoEm: em(2) },
  { id: "d4", nome: "Pedro Exemplo", email: null, tipo: "recorrente", forma: "pix", valorCentavos: 990, repasseCentavos: null, status: "pendente", pagoEm: null, criadoEm: em(2) },
  { id: "d5", nome: "Beatriz Exemplo", email: "beatriz@example.com", tipo: "unica", forma: "cartao", valorCentavos: 5_000, repasseCentavos: 650, status: "pago", pagoEm: em(3), criadoEm: em(3) },
  { id: "d6", nome: "João Exemplo", email: "joao@example.com", tipo: "recorrente", forma: "pix", valorCentavos: 4_990, repasseCentavos: null, status: "vencido", pagoEm: null, criadoEm: em(9) },
];

export const DEMO_RECORRENTES: LinhaRecorrente[] = [
  { id: "r1", nome: "Ana Exemplo", email: "ana@example.com", forma: "cartao", valorCentavos: 4_990, status: "ativa", criadoEm: em(40), canceladoEm: null },
  { id: "r2", nome: "Mariana Exemplo", email: "mariana@example.com", forma: "cartao", valorCentavos: 14_990, status: "ativa", criadoEm: em(70), canceladoEm: null },
  { id: "r3", nome: "Pedro Exemplo", email: null, forma: "pix", valorCentavos: 990, status: "ativa", criadoEm: em(2), canceladoEm: null },
  { id: "r4", nome: "João Exemplo", email: "joao@example.com", forma: "pix", valorCentavos: 4_990, status: "cancelada", criadoEm: em(120), canceladoEm: em(5) },
];
