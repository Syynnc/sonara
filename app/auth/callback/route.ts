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
  if (session.provider_token) {
    await supabase.from('profiles').upsert(
      {
        id: session.user.id,
        spotify_access_token: session.provider_token,
        spotify_refresh_token: session.provider_refresh_token ?? null,
        // Spotify tokens expire in 1 hour
        spotify_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
