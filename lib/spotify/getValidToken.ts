import type { SupabaseClient } from '@supabase/supabase-js';
import { refreshSpotifyToken } from './api';

/**
 * Returns a valid Spotify access token for the given user, refreshing it
 * automatically if it has expired or will expire within 60 seconds.
 *
 * Returns `null` when:
 *  - The user has no stored access token (needs to reconnect)
 *  - The refresh attempt fails (token revoked or refresh token missing)
 */
export async function getValidSpotifyToken(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
    .eq('id', userId)
    .single();

  if (!profile?.spotify_access_token) return null;

  const expiresAt = profile.spotify_token_expires_at
    ? new Date(profile.spotify_token_expires_at).getTime()
    : 0;

  // Token is still fresh — return immediately
  if (Date.now() < expiresAt - 60_000) {
    return profile.spotify_access_token as string;
  }

  // Token expired or about to expire — attempt refresh
  if (!profile.spotify_refresh_token) return null;

  try {
    const refreshed = await refreshSpotifyToken(profile.spotify_refresh_token as string);

    await supabase
      .from('profiles')
      .update({
        spotify_access_token: refreshed.access_token,
        spotify_token_expires_at: new Date(
          Date.now() + refreshed.expires_in * 1000,
        ).toISOString(),
      })
      .eq('id', userId);

    return refreshed.access_token;
  } catch (err) {
    console.error('[getValidSpotifyToken] refresh failed:', err);
    return null;
  }
}
