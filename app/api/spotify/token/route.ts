import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidSpotifyToken } from '@/lib/spotify/getValidToken';

/**
 * GET /api/spotify/token
 * Returns the authenticated user's valid Spotify access token.
 * Used by client components (SpotifyWebPlayer) that need the token at runtime.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const token = await getValidSpotifyToken(supabase, user.id);

  if (!token) {
    return NextResponse.json({ error: 'No Spotify token available' }, { status: 401 });
  }

  return NextResponse.json({ token });
}
