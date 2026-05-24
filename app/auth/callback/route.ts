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

  // Persist Spotify tokens so server components can make Spotify API calls
  // without relying on the client-only provider_token field.
  // session.expires_at is a Unix timestamp (seconds) reflecting the actual
  // provider token lifetime — far more accurate than a hardcoded +3600 s.
  if (session.provider_token) {
    const tokenExpiresAt = session.expires_at
      ? new Date(session.expires_at * 1000)
      : new Date(Date.now() + 3600 * 1000); // fallback: assume 1 h

    try {
      await db
        .insert(profiles)
        .values({
          id: session.user.id,
          spotifyAccessToken: session.provider_token,
          spotifyRefreshToken: session.provider_refresh_token ?? null,
          spotifyTokenExpiresAt: tokenExpiresAt,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: profiles.id,
          set: {
            spotifyAccessToken: session.provider_token,
            spotifyRefreshToken: session.provider_refresh_token ?? null,
            spotifyTokenExpiresAt: tokenExpiresAt,
            updatedAt: new Date(),
          },
        });
    } catch (e) {
      console.error('[auth/callback] profile upsert FAILED:', e);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
