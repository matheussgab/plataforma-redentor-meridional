import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { isSupabaseConfigured } from "@/lib/supabase/server";

// Next 16: `middleware.ts` virou `proxy.ts`.
// Ver node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
export function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) return;
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
