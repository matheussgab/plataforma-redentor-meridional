import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Site PÚBLICO: só o painel é fechado. /admin/entrar fica de fora para a tela
 * de login abrir sem sessão.
 */
const PROTEGIDO = "/admin";
const LOGIN = "/admin/entrar";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() (não getSession()) valida o token no Supabase e dispara o refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const protegido = (path === PROTEGIDO || path.startsWith(`${PROTEGIDO}/`)) && !path.startsWith(LOGIN);

  if (!user && protegido) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
