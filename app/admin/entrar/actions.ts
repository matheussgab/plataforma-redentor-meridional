"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { paraEmail } from "@/lib/auth/usuario";

export type EstadoLogin = { erro?: string };

export async function entrar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!usuario || !senha) return { erro: "Preencha usuário e senha." };

  // Modo demo (sem Supabase): avisa em vez de quebrar. O painel abre sem login.
  if (!isSupabaseConfigured()) {
    return { erro: "Modo demonstração: o login precisa do banco configurado. O painel de exemplo abre direto em /admin." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: paraEmail(usuario), password: senha });

  // Mensagem genérica de propósito: não entrega quais contas existem.
  if (error || !data.user) return { erro: "Usuário ou senha incorretos." };

  // Sessão criada não é o mesmo que acesso: quem não está em redentor_staff sai.
  const { data: staff } = await supabase.from("redentor_staff").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!staff) {
    await supabase.auth.signOut();
    return { erro: "Esta conta não tem acesso ao painel." };
  }

  redirect("/admin");
}

export async function sair() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/entrar");
}
