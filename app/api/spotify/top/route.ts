import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserTopTracks, getUserTopArtists } from '@/lib/spotify/api';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('spotify_access_token')
    .eq('id', user.id)
    .single();

  if (!profile?.spotify_access_token) {
    return NextResponse.json({ error: 'No Spotify token — please reconnect' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'tracks';
  const timeRange = (searchParams.get('time_range') ?? 'short_term') as
    | 'short_term'
    | 'medium_term'
    | 'long_term';

  try {
    if (type === 'artists') {
      const data = await getUserTopArtists(profile.spotify_access_token, timeRange);
      return NextResponse.json(data);
    }
    const data = await getUserTopTracks(profile.spotify_access_token, timeRange);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'SPOTIFY_UNAUTHORIZED') {
      return NextResponse.json({ error: 'Spotify token expired — please sign in again' }, { status: 401 });
    }
    console.error('Spotify top error:', err);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
