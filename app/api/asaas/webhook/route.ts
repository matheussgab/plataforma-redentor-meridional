import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Webhook do Asaas: a única fonte de "foi pago".
 *
 * Configurar na conta Asaas da organização: Integrações > Webhooks, URL
 * https://<dominio>/api/asaas/webhook, token igual a ASAAS_WEBHOOK_TOKEN,
 * eventos de cobrança (PAYMENT_*) e de subscription (SUBSCRIPTION_*). O token
 * chega no cabeçalho `asaas-access-token`; sem ele bater, 401.
 *
 * Idempotente pelo id do evento: o Asaas reenvia quando não recebe 200, e
 * reenvio não pode contar a contribuição duas vezes.
 */
const STATUS: Record<string, string> = {
  PAYMENT_CREATED: "pendente",
  PAYMENT_UPDATED: "pendente",
  PAYMENT_CONFIRMED: "pago",
  PAYMENT_RECEIVED: "pago",
  PAYMENT_OVERDUE: "vencido",
  PAYMENT_DELETED: "cancelado",
  PAYMENT_REFUNDED: "estornado",
  PAYMENT_CHARGEBACK_REQUESTED: "estornado",
};

// Contribuição recorrente encerrada fora do site (painel do Asaas, cartão
// recusado de vez etc.). Conferir os nomes na doc do Asaas antes de ir ao ar.
const RECORRENTE_ENCERRADA = new Set(["SUBSCRIPTION_DELETED", "SUBSCRIPTION_INACTIVATED"]);

export async function POST(request: Request) {
  const esperado = process.env.ASAAS_WEBHOOK_TOKEN ?? "";
  const recebido = request.headers.get("asaas-access-token") ?? "";
  if (!esperado || recebido.length !== esperado.length || !timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado))) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }

  let ev: { id?: string; event?: string; payment?: Record<string, unknown>; subscription?: Record<string, unknown> };
  try { ev = await request.json(); } catch { return NextResponse.json({ erro: "corpo inválido" }, { status: 400 }); }
  if (!ev.id || !ev.event) return NextResponse.json({ erro: "evento sem id" }, { status: 400 });

  const sb = createAdminClient();
  const pay = ev.payment ?? {};
  const paymentId = typeof pay.id === "string" ? pay.id : null;

  // Registra primeiro. Se já existe, é reenvio: responde 200 e não mexe em nada.
  const { error: eIns } = await sb.from("redentor_asaas_eventos").insert({ id: ev.id, tipo: ev.event, payment_id: paymentId, payload: ev });
  if (eIns) {
    if (eIns.code === "23505") return NextResponse.json({ ok: true, repetido: true });
    console.error("[webhook] não gravei o evento:", eIns.message);
    return NextResponse.json({ erro: eIns.message }, { status: 500 });
  }

  if (RECORRENTE_ENCERRADA.has(ev.event)) {
    const subId = typeof ev.subscription?.id === "string" ? ev.subscription.id : null;
    if (subId) {
      const { error } = await sb.from("redentor_recorrentes")
        .update({ status: "cancelada", cancelado_em: new Date().toISOString() })
        .eq("asaas_subscription_id", subId).eq("status", "ativa");
      if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const status = STATUS[ev.event];
  if (!status || !paymentId) return NextResponse.json({ ok: true, ignorado: true });

  const agora = new Date().toISOString();
  const campos: Record<string, unknown> = { status, atualizado_em: agora };
  if (status === "pago") {
    campos.pago_em = typeof pay.paymentDate === "string" ? pay.paymentDate : agora;
    // Bruto menos líquido: tarifa do Asaas + split do MA24.
    if (typeof pay.netValue === "number") campos.repasse_centavos = Math.round((Number(pay.value) - pay.netValue) * 100);
  }

  const { data: atual, error: eUp } = await sb.from("redentor_contribuicoes").update(campos).eq("asaas_payment_id", paymentId).select("id");
  if (eUp) return NextResponse.json({ erro: eUp.message }, { status: 500 });

  // Cobrança de um mês novo da recorrente, que o site ainda não conhece: cria a linha.
  if ((!atual || !atual.length) && typeof pay.subscription === "string") {
    const { data: rec } = await sb.from("redentor_recorrentes").select("id, contribuinte_id, forma, valor_centavos").eq("asaas_subscription_id", pay.subscription).maybeSingle();
    if (rec) {
      const valor = typeof pay.value === "number" ? Math.round(pay.value * 100) : rec.valor_centavos;
      const { error: eNova } = await sb.from("redentor_contribuicoes").insert({
        contribuinte_id: rec.contribuinte_id, recorrente_id: rec.id, tipo: "recorrente", forma: rec.forma,
        valor_centavos: valor, status, asaas_payment_id: paymentId, pago_em: campos.pago_em ?? null,
        repasse_centavos: campos.repasse_centavos ?? null,
        referencia: typeof pay.externalReference === "string" ? `${pay.externalReference}-${paymentId}` : paymentId,
      });
      if (eNova) console.error("[webhook] contribuição do mês não gravada:", eNova.message);
    }
  }

  return NextResponse.json({ ok: true });
}
