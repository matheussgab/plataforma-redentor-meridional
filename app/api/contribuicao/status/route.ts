import { NextResponse } from "next/server";
import { createAdminClient, podeGravar } from "@/lib/supabase/server";

/**
 * Situação de uma contribuição, para a tela do Pix saber quando o pagamento
 * caiu. Só LÊ o que o webhook gravou. A chave é a `referencia` (16 hex
 * aleatórios, devolvida só a quem criou) e a resposta é só o status.
 */
export const dynamic = "force-dynamic";

const REFERENCIA = /^[0-9a-f]{16}$/;

export async function GET(request: Request) {
  const referencia = new URL(request.url).searchParams.get("referencia") ?? "";
  if (!REFERENCIA.test(referencia)) return NextResponse.json({ erro: "referência inválida" }, { status: 400 });

  if (!podeGravar()) return NextResponse.json({ status: "pendente", persistido: false });

  const { data, error } = await createAdminClient()
    .from("redentor_contribuicoes")
    .select("status")
    .eq("referencia", referencia)
    .maybeSingle();
  if (error) return NextResponse.json({ erro: "falha ao consultar" }, { status: 500 });
  if (!data) return NextResponse.json({ erro: "não encontrada" }, { status: 404 });
  return NextResponse.json({ status: data.status, persistido: true });
}
