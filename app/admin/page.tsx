import { requireStaff } from "@/lib/auth/requireStaff";
import { paraUsuario } from "@/lib/auth/usuario";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Painel } from "./painel";
import {
  DEMO_CONTRIBUICOES,
  DEMO_RECORRENTES,
  type LinhaContribuicao,
  type LinhaRecorrente,
} from "./dados";

// O painel nunca é cacheado: a contribuição que acabou de entrar tem que aparecer.
export const dynamic = "force-dynamic";

type Contribuinte = { nome: string; email: string | null } | null;

/**
 * Painel. Sem Supabase (máquina de desenvolvimento), abre em modo
 * demonstração com dados fictícios. Com Supabase, exige staff e lê pelo
 * cliente da sessão: a RLS garante que só staff enxerga, sem service_role.
 */
export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return <Painel demo operador="Demonstração" contribuicoes={DEMO_CONTRIBUICOES} recorrentes={DEMO_RECORRENTES} />;
  }

  const user = await requireStaff();
  const sb = await createClient();
  const [{ data: staff }, { data: cs }, { data: rs }] = await Promise.all([
    sb.from("redentor_staff").select("nome").eq("user_id", user.id).maybeSingle(),
    sb
      .from("redentor_contribuicoes")
      .select("id, tipo, forma, valor_centavos, repasse_centavos, status, pago_em, criado_em, contribuinte:redentor_contribuintes(nome, email)")
      .order("criado_em", { ascending: false })
      .limit(1000),
    sb
      .from("redentor_recorrentes")
      .select("id, forma, valor_centavos, status, criado_em, cancelado_em, contribuinte:redentor_contribuintes(nome, email)")
      .order("criado_em", { ascending: false }),
  ]);

  const contribuicoes: LinhaContribuicao[] = (cs ?? []).map((c) => {
    const pessoa = c.contribuinte as unknown as Contribuinte;
    return {
      id: c.id,
      nome: pessoa?.nome ?? "Contribuinte",
      email: pessoa?.email ?? null,
      tipo: c.tipo,
      forma: c.forma,
      valorCentavos: c.valor_centavos,
      repasseCentavos: c.repasse_centavos,
      status: c.status,
      pagoEm: c.pago_em,
      criadoEm: c.criado_em,
    };
  });
  const recorrentes: LinhaRecorrente[] = (rs ?? []).map((r) => {
    const pessoa = r.contribuinte as unknown as Contribuinte;
    return {
      id: r.id,
      nome: pessoa?.nome ?? "Contribuinte",
      email: pessoa?.email ?? null,
      forma: r.forma,
      valorCentavos: r.valor_centavos,
      status: r.status,
      criadoEm: r.criado_em,
      canceladoEm: r.cancelado_em,
    };
  });

  return (
    <Painel
      demo={false}
      operador={staff?.nome || paraUsuario(user.email ?? "") || "Equipe"}
      contribuicoes={contribuicoes}
      recorrentes={recorrentes}
    />
  );
}
