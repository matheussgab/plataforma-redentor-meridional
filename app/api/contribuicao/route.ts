import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { createAdminClient, podeGravar } from "@/lib/supabase/server";
import {
  asaasConfigurado,
  cancelarCobranca,
  cancelarRecorrente,
  criarContribuicaoRecorrente,
  criarContribuicaoUnica,
  obterOuCriarCliente,
} from "@/lib/asaas/cliente";
import { UNICA_MAXIMO_CENTAVOS, UNICA_MINIMO_CENTAVOS, formatarReais, recorrentePorCodigo } from "@/lib/contribuicoes/valores";
import { cpfValido } from "@/lib/contribuicoes/formato";
import { POLITICA_VERSAO } from "@/lib/config/privacidade";

/**
 * Cria uma contribuição. É a ÚNICA porta de entrada de dinheiro do site.
 *
 * - O valor nunca vem solto do navegador: a recorrente chega como CÓDIGO e o
 *   valor sai de lib/contribuicoes/valores.ts; a única passa pelos limites.
 * - A cobrança nasce no Asaas com o split do MA24 (lib/asaas/cliente.ts).
 * - A linha nasce `pendente`; só o webhook a marca como paga.
 * - Se o banco falhar depois de o Asaas criar a cobrança, a cobrança é
 *   desfeita para não ficar órfã.
 * - LGPD: sem consentimento, nada é criado. O CPF vai só para o Asaas.
 * - Sem Supabase e sem Asaas, responde em modo demo e avisa (persistido: false).
 */
const Entrada = z.object({
  tipo: z.enum(["recorrente", "unica"]),
  forma: z.enum(["pix", "cartao"]),
  codigo: z.string().optional(),
  valorCentavos: z.number().int().optional(),
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  cpf: z.string().trim().regex(/^\d{11}$/).refine(cpfValido),
  telefone: z.string().trim().regex(/^\d{10,11}$/).optional().or(z.literal("")),
  consentimento: z.literal(true),
});

export async function POST(request: Request) {
  let corpo: unknown;
  try { corpo = await request.json(); } catch { return NextResponse.json({ erro: "Envio inválido" }, { status: 400 }); }
  const r = Entrada.safeParse(corpo);
  if (!r.success) {
    const semConsentimento = (corpo as { consentimento?: unknown } | null)?.consentimento !== true;
    const erro = semConsentimento ? "É preciso aceitar a Política de Privacidade para contribuir." : "Confira os dados informados.";
    return NextResponse.json({ erro, detalhes: r.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = r.data;

  // Valor: decidido aqui, nunca pelo navegador.
  let centavos: number;
  if (d.tipo === "recorrente") {
    const v = recorrentePorCodigo(d.codigo ?? "");
    if (!v) return NextResponse.json({ erro: "Valor de contribuição recorrente desconhecido." }, { status: 400 });
    centavos = v.centavos;
  } else {
    if (!d.valorCentavos || d.valorCentavos < UNICA_MINIMO_CENTAVOS || d.valorCentavos > UNICA_MAXIMO_CENTAVOS) {
      return NextResponse.json(
        { erro: `Escolha um valor entre ${formatarReais(UNICA_MINIMO_CENTAVOS)} e ${formatarReais(UNICA_MAXIMO_CENTAVOS)}.` },
        { status: 400 },
      );
    }
    centavos = d.valorCentavos;
  }

  const referencia = randomBytes(8).toString("hex");
  const pessoa = { nome: d.nome, email: d.email, cpf: d.cpf, telefone: d.telefone || undefined };

  let cob: Awaited<ReturnType<typeof criarContribuicaoUnica>> & { recorrenteId?: string };
  try {
    const clienteId = await obterOuCriarCliente(pessoa);
    cob = d.tipo === "recorrente"
      ? await criarContribuicaoRecorrente(clienteId, centavos, d.forma, referencia)
      : await criarContribuicaoUnica(clienteId, centavos, d.forma, referencia);

    let persistido = false;
    // Cobrança de demonstração (sem chave do Asaas) nunca vai para o banco real.
    if (podeGravar() && asaasConfigurado()) {
      try {
        const sb = createAdminClient();
        const { data: c, error: e1 } = await sb.from("redentor_contribuintes")
          .upsert({ asaas_customer_id: clienteId, nome: pessoa.nome, email: pessoa.email, telefone: pessoa.telefone ?? null }, { onConflict: "asaas_customer_id" })
          .select("id").single();
        if (e1) throw new Error(`contribuinte: ${e1.message}`);

        let recorrenteId: string | null = null;
        if (cob.recorrenteId) {
          const { data: rec, error: e2 } = await sb.from("redentor_recorrentes")
            .insert({ contribuinte_id: c.id, asaas_subscription_id: cob.recorrenteId, valor_centavos: centavos, forma: d.forma })
            .select("id").single();
          if (e2) throw new Error(`recorrente: ${e2.message}`);
          recorrenteId = rec.id;
        }
        const { error: e3 } = await sb.from("redentor_contribuicoes").insert({
          contribuinte_id: c.id, recorrente_id: recorrenteId, tipo: d.tipo, forma: d.forma,
          valor_centavos: centavos, asaas_payment_id: cob.id, referencia,
          consentimento_em: new Date().toISOString(), politica_versao: POLITICA_VERSAO,
        });
        if (e3) throw new Error(`contribuição: ${e3.message}`);
        persistido = true;
      } catch (e) {
        // Banco falhou com a cobrança já criada: desfaz no Asaas (melhoria 13.3).
        if (cob.recorrenteId) await cancelarRecorrente(cob.recorrenteId).catch(() => {});
        else await cancelarCobranca(cob.id);
        throw e;
      }
    } else {
      console.warn("[contribuicao] modo demo: nada gravado (falta Supabase/service_role ou chave do Asaas)");
    }

    return NextResponse.json({
      ok: true,
      demo: !asaasConfigurado() || !persistido,
      persistido,
      referencia,
      valorCentavos: centavos,
      forma: d.forma,
      tipo: d.tipo,
      linkPagamento: cob.invoiceUrl,
      pix: cob.pix ?? null,
    });
  } catch (e) {
    console.error("[contribuicao] falhou:", e instanceof Error ? e.message : String(e));
    return NextResponse.json({ erro: "Não conseguimos gerar a contribuição agora. Tente de novo em instantes." }, { status: 502 });
  }
}
