import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { playlists, playlistTracks } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

// GET /api/spotify/playlists/[id]/tracks — list tracks (ownership verified server-side)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: playlistId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership before returning any data
  const [playlist] = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)))
    .limit(1);

  if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });

  const tracks = await db
    .select()
    .from(playlistTracks)
    .where(eq(playlistTracks.playlistId, playlistId))
    .orderBy(asc(playlistTracks.addedAt));

  return NextResponse.json(tracks);
}

// POST /api/spotify/playlists/[id]/tracks — add a track to a local playlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: playlistId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership via Drizzle (consistent with GET)
  const [playlist] = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)))
    .limit(1);

  if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });

  const body = (await request.json()) as {
    spotify_track_id: string;
    track_name?: string;
    artist_name?: string;
    album_name?: string;
    album_image_url?: string;
    duration_ms?: number;
    spotify_uri?: string;
  };

  if (!body.spotify_track_id) {
    return NextResponse.json({ error: 'spotify_track_id required' }, { status: 400 });
  }

  try {
    const [inserted] = await db
      .insert(playlistTracks)
      .values({
        playlistId,
        spotifyTrackId: body.spotify_track_id,
        trackName:      body.track_name      ?? null,
        artistName:     body.artist_name     ?? null,
        albumName:      body.album_name      ?? null,
        albumImageUrl:  body.album_image_url ?? null,
        durationMs:     body.duration_ms     ?? null,
        spotifyUri:     body.spotify_uri     ?? null,
      })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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
