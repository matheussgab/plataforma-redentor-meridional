/**
 * Login por usuário, sem e-mail.
 *
 * O Supabase Auth só entra com e-mail; a tela pede "usuário" e aqui ele vira
 * um endereço interno. O domínio é POR CLIENTE: se o projeto Supabase for
 * compartilhado, um "admin" daqui não colide com o de outro cliente. O
 * domínio não recebe e-mail, então não há recuperação de senha por e-mail.
 */
const DOMINIO_INTERNO = "redentor.ma24.com.br";

/** 'natalia' -> 'natalia@redentor.ma24.com.br'; e-mail completo passa intacto. */
export function paraEmail(entrada: string): string {
  const limpo = entrada.trim().toLowerCase();
  if (limpo.includes("@")) return limpo;
  return `${limpo.replace(/[^a-z0-9._-]/g, "")}@${DOMINIO_INTERNO}`;
}

/** Só para exibição: devolve o que a pessoa digitaria para entrar. */
export function paraUsuario(email: string): string {
  return email.endsWith(`@${DOMINIO_INTERNO}`) ? email.split("@")[0] : email;
}
