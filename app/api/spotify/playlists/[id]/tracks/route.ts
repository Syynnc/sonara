import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LocalPlaylistTrack } from '@/lib/spotify/types';

// POST /api/spotify/playlists/[id]/tracks — add a track to a local playlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: playlistId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify playlist belongs to the user
  const { data: playlist } = await supabase
    .from('playlists')
    .select('id')
    .eq('id', playlistId)
    .eq('user_id', user.id)
    .single();

  if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });

  const track = (await request.json()) as {
    spotify_track_id: string;
    track_name?: string;
    artist_name?: string;
    album_name?: string;
    album_image_url?: string;
    duration_ms?: number;
    spotify_uri?: string;
  };

  if (!track.spotify_track_id) {
    return NextResponse.json({ error: 'spotify_track_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('playlist_tracks')
    .insert({
      playlist_id: playlistId,
      spotify_track_id: track.spotify_track_id,
      track_name: track.track_name ?? null,
      artist_name: track.artist_name ?? null,
      album_name: track.album_name ?? null,
      album_image_url: track.album_image_url ?? null,
      duration_ms: track.duration_ms ? String(track.duration_ms) : null,
      spotify_uri: track.spotify_uri ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/spotify/playlists/[id]/tracks?track_id=... — remove a track
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: playlistId } = await params;
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('track_id');

  if (!trackId) return NextResponse.json({ error: 'track_id required' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .eq('id', trackId)
    .eq('playlist_id', playlistId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
