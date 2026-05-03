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

  const track = (await request.json()) as Omit<LocalPlaylistTrack, 'id' | 'playlist_id' | 'added_at'>;

  // Get current max position
  const { data: lastTrack } = await supabase
    .from('playlist_tracks')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (lastTrack?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from('playlist_tracks')
    .insert({ ...track, playlist_id: playlistId, position })
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
