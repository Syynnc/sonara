import { db } from '@/lib/db';
import { playlists, playlistTracks } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { count, eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/spotify/playlists — list the user's playlists from Supabase
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await db
      .select({
        id: playlists.id,
        userId: playlists.userId,
        name: playlists.name,
        description: playlists.description,
        spotifyPlaylistId: playlists.spotifyPlaylistId,
        createdAt: playlists.createdAt,
        updatedAt: playlists.updatedAt,
        trackCount: count(playlistTracks.id),
      })
      .from(playlists)
      .leftJoin(playlistTracks, eq(playlists.id, playlistTracks.playlistId))
      .where(eq(playlists.userId, user.id))
      .groupBy(playlists.id)
      .orderBy(desc(playlists.updatedAt));

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/spotify/playlists — create a new local playlist
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, description = '' } = body as { name: string; description?: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const data = await db
      .insert(playlists)
      .values({ userId: user.id, name: name.trim(), description })
      .returning();

    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
