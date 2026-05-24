import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createSpotifyPlaylist,
  addTracksToSpotifyPlaylist,
  refreshSpotifyToken,
} from '@/lib/spotify/api';

// POST /api/spotify/playlists/[id]/export — push local playlist to Spotify
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: playlistId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
    .eq('id', user.id)
    .single();

  if (!profile?.spotify_access_token) {
    return NextResponse.json({ error: 'No Spotify token — please sign in again' }, { status: 401 });
  }

  // Refresh token if expired or expiring within 60 seconds
  let accessToken = profile.spotify_access_token;
  const expiresAt = profile.spotify_token_expires_at ? new Date(profile.spotify_token_expires_at).getTime() : 0;
  if (Date.now() >= expiresAt - 60_000 && profile.spotify_refresh_token) {
    try {
      const refreshed = await refreshSpotifyToken(profile.spotify_refresh_token);
      accessToken = refreshed.access_token;
      await supabase.from('profiles').update({
        spotify_access_token: accessToken,
        spotify_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      }).eq('id', user.id);
    } catch {
      return NextResponse.json({ error: 'Spotify token expired — please sign in again' }, { status: 401 });
    }
  }

  // Fetch local playlist + its tracks
  const { data: playlist, error: playlistErr } = await supabase
    .from('playlists')
    .select('*, playlist_tracks(spotify_uri, added_at)')
    .eq('id', playlistId)
    .eq('user_id', user.id)
    .single();

  if (playlistErr || !playlist) {
    return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
  }

  if (!playlist.playlist_tracks?.length) {
    return NextResponse.json({ error: 'Playlist is empty' }, { status: 400 });
  }

  try {
    // Verify token and log scopes via /me endpoint
    const { httpsFetch } = await import('@/lib/supabase/https-fetch');
    const meRes = await httpsFetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meData = await meRes.json() as Record<string, unknown>;
    console.log('[export] /me status:', meRes.status);
    console.log('[export] spotify user id:', meData.id);
    console.log('[export] product (premium?):', meData.product);
    if (!meRes.ok) {
      return NextResponse.json({ error: `Spotify /me failed: ${meRes.status}` }, { status: 401 });
    }

    // Create playlist on Spotify via /me/playlists (no user-id lookup needed)
    const spotifyPlaylist = await createSpotifyPlaylist(
      accessToken,
      playlist.name,
      playlist.description ?? `Exported from Sonara`,
    );

    // Add tracks ordered by insertion time
    const uris = (playlist.playlist_tracks as { spotify_uri: string | null; added_at: string }[])
      .sort((a, b) => new Date(a.added_at).getTime() - new Date(b.added_at).getTime())
      .map((t) => t.spotify_uri)
      .filter((uri): uri is string => !!uri);

    await addTracksToSpotifyPlaylist(accessToken, spotifyPlaylist.id, uris);

    // Store the Spotify playlist ID in our DB
    await supabase
      .from('playlists')
      .update({ spotify_playlist_id: spotifyPlaylist.id })
      .eq('id', playlistId);

    return NextResponse.json({
      spotify_playlist_id: spotifyPlaylist.id,
      spotify_url: spotifyPlaylist.external_urls.spotify,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[export] caught error:', message);
    if (message === 'SPOTIFY_UNAUTHORIZED') {
      return NextResponse.json({ error: 'Spotify token expired — please sign in again' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
