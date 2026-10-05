import { NextResponse } from "next/server";
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Batida diária de saúde. O Supabase Free PAUSA depois de 7 dias sem
 * consulta, e um site de contribuições pode passar uma semana sem visita. O
 * cron da Vercel (vercel.json) chama esta rota todo dia.
 *
 * Lê redentor_config (linha id = 1): NÃO apagar essa linha ao limpar testes.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: true, banco: "demo" });
  const { data, error } = await createPublicClient().from("redentor_config").select("nome_exibicao").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, banco: "ativo", nome: data?.nome_exibicao ?? null, em: new Date().toISOString() });
}
