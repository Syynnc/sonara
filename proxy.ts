import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { httpsFetch } from '@/lib/supabase/https-fetch';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: httpsFetch },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed tokens to both request and response so Server
          // Components downstream receive the updated session on the same pass.
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // getClaims() validates the JWT signature server-side and refreshes the
  // token if expired. Never use getSession() in server contexts —
  // it trusts the client-supplied JWT without server-side revalidation.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
