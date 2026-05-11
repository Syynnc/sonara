import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await createClient();
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  const { session } = data;

  console.log('[auth/callback] provider_token present:', !!session.provider_token);
  console.log('[auth/callback] user id:', session.user.id);

  // Persist Spotify tokens so server components can make Spotify API calls
  // without relying on the client-only provider_token field.
  if (session.provider_token) {
    try {
      await db
        .insert(profiles)
        .values({
          id: session.user.id,
          spotifyAccessToken: session.provider_token,
          spotifyRefreshToken: session.provider_refresh_token ?? null,
          spotifyTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: profiles.id,
          set: {
            spotifyAccessToken: session.provider_token,
            spotifyRefreshToken: session.provider_refresh_token ?? null,
            spotifyTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
            updatedAt: new Date(),
          },
        });
      console.log('[auth/callback] profile upsert OK');
    } catch (e) {
      console.error('[auth/callback] profile upsert FAILED:', e);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
