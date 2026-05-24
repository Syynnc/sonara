import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { playlists } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

// DELETE /api/spotify/playlists/[id] — permanently remove a local playlist (cascades tracks)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: playlistId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deleted = await db
    .delete(playlists)
    .where(and(eq(playlists.id, playlistId), eq(playlists.userId, user.id)))
    .returning({ id: playlists.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
