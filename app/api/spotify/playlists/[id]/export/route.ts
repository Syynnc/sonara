import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createSpotifyPlaylist,
  addTracksToSpotifyPlaylist,
  getSpotifyCurrentUser,
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

  // Get user's Spotify token
  const { data: profile } = await supabase
    .from('profiles')
    .select('spotify_access_token')
    .eq('id', user.id)
    .single();

  if (!profile?.spotify_access_token) {
    return NextResponse.json({ error: 'No Spotify token — please sign in again' }, { status: 401 });
  }

  // Fetch local playlist + its tracks
  const { data: playlist, error: playlistErr } = await supabase
    .from('playlists')
    .select('*, playlist_tracks(spotify_uri, position)')
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
    const token = profile.spotify_access_token;

    // Get Spotify user id (needed to create playlist)
    const spotifyUser = await getSpotifyCurrentUser(token);

    // Create playlist on Spotify
    const spotifyPlaylist = await createSpotifyPlaylist(
      token,
      spotifyUser.id,
      playlist.name,
      playlist.description ?? `Exported from Sonara`,
    );

    // Add tracks in position order
    const uris = (playlist.playlist_tracks as { spotify_uri: string; position: number }[])
      .sort((a, b) => a.position - b.position)
      .map((t) => t.spotify_uri);

    await addTracksToSpotifyPlaylist(token, spotifyPlaylist.id, uris);

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
    if (message === 'SPOTIFY_UNAUTHORIZED') {
      return NextResponse.json({ error: 'Spotify token expired — please sign in again' }, { status: 401 });
    }
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
