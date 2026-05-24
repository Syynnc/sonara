import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidSpotifyToken } from '@/lib/spotify/getValidToken';
import { httpsFetch } from '@/lib/supabase/https-fetch';

// GET /api/spotify/debug — shows token status and granted scopes
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
    .eq('id', user.id)
    .single();

  const token = await getValidSpotifyToken(supabase, user.id);

  // Ask Spotify what scopes this token actually has
  let spotifyMe = null;
  let tokenInfo = null;
  if (token) {
    try {
      const meRes = await httpsFetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      spotifyMe = await meRes.json();
    } catch (e) { spotifyMe = { error: String(e) }; }

    // Check token info via Spotify's token introspection-like endpoint
    try {
      const infoRes = await httpsFetch(
        `https://accounts.spotify.com/api/token/info`,
        { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
      );
      tokenInfo = infoRes.ok ? await infoRes.json() : { status: infoRes.status };
    } catch { tokenInfo = null; }
  }

  return NextResponse.json({
    hasToken: !!profile?.spotify_access_token,
    hasRefreshToken: !!profile?.spotify_refresh_token,
    tokenExpiresAt: profile?.spotify_token_expires_at,
    tokenPrefix: token ? token.slice(0, 20) + '…' : null,
    spotifyMe,
    tokenInfo,
  });
}
