import "server-only";

/**
 * Cliente mínimo do Asaas, com split de pagamento.
 *
 * Como o dinheiro chega a cada um:
 *   - as cobranças nascem na conta Asaas DA ORGANIZAÇÃO (ASAAS_API_KEY é a
 *     chave dessa conta);
 *   - cada cobrança leva uma regra de split: REPASSE_PERCENTUAL do valor
 *     LÍQUIDO vai para a carteira do MA24 (ASAAS_WALLET_ID_MA24). O Asaas
 *     divide na hora do pagamento; o dinheiro nunca passa pelo site.
 *
 * Vocabulário: o Asaas chama a cobrança mensal de "subscription". No site, no
 * painel e no banco ela é sempre "contribuição recorrente" (regra do
 * CLAUDE.md); o termo do Asaas só aparece nos caminhos da API.
 *
 * Sem ASAAS_API_KEY o módulo entra em MODO DEMO: devolve dados falsos e não
 * fala com o Asaas.
 */

const AMBIENTE = process.env.ASAAS_AMBIENTE === "producao" ? "producao" : "sandbox";
const BASE = AMBIENTE === "producao" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";

export function asaasConfigurado(): boolean {
  return Boolean(process.env.ASAAS_API_KEY);
}

function percentualRepasse(): number {
  const p = Number(process.env.REPASSE_PERCENTUAL ?? "10");
  if (!Number.isFinite(p) || p < 0 || p > 50) throw new Error("REPASSE_PERCENTUAL inválido (0 a 50)");
  return p;
}

/**
 * Regra de split: a parte do MA24.
 *
 * Trava (melhoria 13.1 do docs/ARQUITETURA-PAGAMENTOS.txt): em produção, sem
 * ASAAS_WALLET_ID_MA24, a cobrança é RECUSADA em vez de nascer sem split. A
 * exceção é explícita (PERMITIR_SEM_SPLIT=1), só para conta de teste.
 */
function split() {
  const wallet = process.env.ASAAS_WALLET_ID_MA24;
  if (wallet) return [{ walletId: wallet, percentualValue: percentualRepasse() }];
  if (AMBIENTE === "producao" && process.env.PERMITIR_SEM_SPLIT !== "1") {
    throw new Error("ASAAS_WALLET_ID_MA24 vazio em produção: cobrança recusada para não nascer sem split");
  }
  return undefined;
}

/**
 * Retorno ao site depois do pagamento (Pix e cartão, também na recorrente).
 * Só com SITE_URL preenchida: o Asaas RECUSA a cobrança se o domínio não for
 * o cadastrado em Configurações da conta > Informações. O retorno é só
 * navegação; quem confirma o pagamento continua sendo o webhook.
 */
function callback() {
  const base = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (!base) return undefined;
  return { successUrl: `${base}/obrigado`, autoRedirect: true };
}

async function chamar<T>(caminho: string, corpo?: unknown, metodo = "POST"): Promise<T> {
  const r = await fetch(BASE + caminho, {
    method: metodo,
    headers: {
      "content-type": "application/json",
      access_token: process.env.ASAAS_API_KEY!,
      "user-agent": "ma24-redentor",
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  if (!r.ok) {
    // O Asaas devolve {errors:[{code,description}]}; a descrição é legível.
    let msg = texto.slice(0, 300);
    try { msg = JSON.parse(texto).errors?.map((e: { description: string }) => e.description).join("; ") || msg; } catch {}
    throw new Error(`Asaas ${metodo} ${caminho}: ${r.status} ${msg}`);
  }
  return texto ? JSON.parse(texto) : (null as T);
}

export type Contribuinte = { nome: string; email: string; cpf: string; telefone?: string };

/** Procura pelo CPF antes de criar: o Asaas não deduplica sozinho. */
export async function obterOuCriarCliente(c: Contribuinte): Promise<string> {
  if (!asaasConfigurado()) return "cus_demo";
  const r = await chamar<{ data: { id: string }[] }>(`/customers?cpfCnpj=${encodeURIComponent(c.cpf)}&limit=1`, undefined, "GET");
  if (r.data?.[0]) return r.data[0].id;
  const novo = await chamar<{ id: string }>("/customers", {
    name: c.nome, email: c.email, cpfCnpj: c.cpf, mobilePhone: c.telefone,
    notificationDisabled: false,
  });
  return novo.id;
}

export type Cobranca = {
  id: string;
  status: string;
  /** Página de pagamento do Asaas: cartão (sem dado de cartão no site) e alternativa ao QR. */
  invoiceUrl: string;
  /** Só para Pix: copia-e-cola e imagem do QR em base64. */
  pix?: { payload: string; imagemBase64: string; expiraEm: string };
};

const hoje = () => new Date().toISOString().slice(0, 10);

/** Contribuição única: uma cobrança. Pix devolve QR na hora; cartão devolve o link. */
export async function criarContribuicaoUnica(clienteId: string, centavos: number, forma: "pix" | "cartao", referencia: string): Promise<Cobranca> {
  if (!asaasConfigurado()) return demo(forma, referencia);
  const p = await chamar<{ id: string; status: string; invoiceUrl: string }>("/payments", {
    customer: clienteId,
    billingType: forma === "pix" ? "PIX" : "CREDIT_CARD",
    value: centavos / 100,
    dueDate: hoje(),
    description: "Contribuição única - Redentor Meridional",
    externalReference: referencia,
    split: split(),
    callback: callback(),
  });
  const cob: Cobranca = { id: p.id, status: p.status, invoiceUrl: p.invoiceUrl };
  if (forma === "pix") {
    // Sem QR a cobrança fica órfã no Asaas (melhoria 13.3): desfaz e avisa.
    try { cob.pix = await qrPix(p.id); } catch (e) { await cancelarCobranca(p.id); throw e; }
  }
  return cob;
}

/**
 * Contribuição recorrente mensal. O Asaas gera a cobrança todo mês com o
 * mesmo split. Cartão: o contribuinte cadastra o cartão uma vez na página do
 * Asaas e o resto é automático. Pix: o Asaas manda o link todo mês e a pessoa
 * paga de novo (Pix não tem débito automático).
 */
export async function criarContribuicaoRecorrente(clienteId: string, centavos: number, forma: "pix" | "cartao", referencia: string): Promise<Cobranca & { recorrenteId: string }> {
  if (!asaasConfigurado()) return { ...demo(forma, referencia), recorrenteId: "sub_demo" };
  const s = await chamar<{ id: string }>("/subscriptions", {
    customer: clienteId,
    billingType: forma === "pix" ? "PIX" : "CREDIT_CARD",
    value: centavos / 100,
    nextDueDate: hoje(),
    cycle: "MONTHLY",
    description: "Contribuição recorrente - Redentor Meridional",
    externalReference: referencia,
    split: split(),
    callback: callback(),
  });
  try {
    // A primeira cobrança já existe; é ela que a pessoa paga agora.
    const lista = await chamar<{ data: { id: string; status: string; invoiceUrl: string }[] }>(`/subscriptions/${s.id}/payments?limit=1`, undefined, "GET");
    const p = lista.data[0];
    if (!p) throw new Error("contribuição recorrente criada sem a primeira cobrança");
    const cob: Cobranca & { recorrenteId: string } = { id: p.id, status: p.status, invoiceUrl: p.invoiceUrl, recorrenteId: s.id };
    if (forma === "pix") cob.pix = await qrPix(p.id);
    return cob;
  } catch (e) {
    await cancelarRecorrente(s.id);
    throw e;
  }
}

async function qrPix(cobrancaId: string) {
  const q = await chamar<{ payload: string; encodedImage: string; expirationDate: string }>(`/payments/${cobrancaId}/pixQrCode`, undefined, "GET");
  return { payload: q.payload, imagemBase64: q.encodedImage, expiraEm: q.expirationDate };
}

/** Desfaz uma cobrança. Falha aqui só vai para o log: o erro original é o que importa. */
export async function cancelarCobranca(cobrancaId: string): Promise<void> {
  if (!asaasConfigurado()) return;
  try { await chamar(`/payments/${cobrancaId}`, undefined, "DELETE"); } catch (e) {
    console.error("[asaas] cobrança órfã, cancelar à mão:", cobrancaId, e instanceof Error ? e.message : e);
  }
}

/** Encerra uma contribuição recorrente no Asaas (as próximas cobranças deixam de existir). */
export async function cancelarRecorrente(recorrenteId: string): Promise<void> {
  if (!asaasConfigurado()) return;
  await chamar(`/subscriptions/${recorrenteId}`, undefined, "DELETE");
}

function demo(forma: "pix" | "cartao", referencia: string): Cobranca {
  const cob: Cobranca = { id: `pay_demo_${referencia}`, status: "PENDING", invoiceUrl: `https://sandbox.asaas.com/i/demo_${referencia}` };
  if (forma === "pix") {
    cob.pix = {
      payload: "00020126DEMO0014br.gov.bcb.pix0114+55519999999995204000053039865802BR5909REDENTOR6009PORTO ALE62070503***6304DEMO",
      // 1x1 transparente: em demo a tela mostra só o copia-e-cola.
      imagemBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      expiraEm: new Date(Date.now() + 3600_000).toISOString(),
    };
  }
  return cob;
}
