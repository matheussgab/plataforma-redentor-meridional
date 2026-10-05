import { NextResponse } from "next/server";
import { getStaffUser } from "@/lib/auth/requireStaff";
import { cancelarRecorrente } from "@/lib/asaas/cliente";
import { createAdminClient, podeGravar } from "@/lib/supabase/server";

/**
 * Botão "Encerrar" do painel (melhoria 13.4): encerra a contribuição
 * recorrente no Asaas e marca como cancelada no banco. Só staff.
 */
const UUID = /^[0-9a-f-]{36}$/;

export async function POST(_request: Request, ctx: RouteContext<"/api/admin/recorrentes/[id]/cancelar">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ erro: "id inválido" }, { status: 400 });
  if (!podeGravar()) return NextResponse.json({ erro: "Modo demonstração: nada para encerrar." }, { status: 409 });
  if (!(await getStaffUser())) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });

  const sb = createAdminClient();
  const { data: rec, error } = await sb.from("redentor_recorrentes").select("id, asaas_subscription_id, status").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!rec) return NextResponse.json({ erro: "não encontrada" }, { status: 404 });
  if (rec.status === "cancelada") return NextResponse.json({ ok: true });

  try {
    if (rec.asaas_subscription_id) await cancelarRecorrente(rec.asaas_subscription_id);
  } catch (e) {
    console.error("[cancelar] Asaas recusou:", e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: "Não foi possível encerrar agora. Tente de novo em instantes." }, { status: 502 });
  }

  const { error: eUp } = await sb.from("redentor_recorrentes")
    .update({ status: "cancelada", cancelado_em: new Date().toISOString() })
    .eq("id", id);
  if (eUp) return NextResponse.json({ erro: eUp.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
