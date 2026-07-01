import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Excludes static assets and the Sentry tunnel route (/monitoring, see
    // next.config.ts `tunnelRoute`) — that route proxies client-side error
    // reports to Sentry and must not be redirected to /login.
    "/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
