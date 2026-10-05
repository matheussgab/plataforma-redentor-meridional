import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Único ponto de autorização do painel.
 *
 * Estar logado NÃO basta: se o projeto Supabase for compartilhado, o
 * auth.users é de todos os clientes. Quem não está em redentor_staff não entra.
 * O proxy.ts só redireciona quem não tem sessão e não protege app/api/**, por
 * isso esta checagem fica na página do painel e em toda rota de API do painel.
 */
async function staffAtual(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // A RLS de redentor_staff só devolve a própria linha.
  const { data: staff } = await supabase.from("redentor_staff").select("user_id").eq("user_id", user.id).maybeSingle();
  return staff ? user : null;
}

export async function requireStaff(): Promise<User> {
  const user = await staffAtual();
  if (!user) redirect("/admin/entrar?erro=sem_acesso");
  return user;
}

/** Versão para rota de API: devolve null em vez de redirecionar. */
export async function getStaffUser(): Promise<User | null> {
  return staffAtual();
}
