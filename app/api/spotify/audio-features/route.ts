import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidSpotifyToken } from '@/lib/spotify/getValidToken';
import { httpsFetch } from '@/lib/supabase/https-fetch';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ids = request.nextUrl.searchParams.get('ids');
  if (!ids) return NextResponse.json({ error: 'ids required' }, { status: 400 });

  const token = await getValidSpotifyToken(supabase, user.id);
  if (!token) return NextResponse.json({ error: 'No Spotify token' }, { status: 401 });

  const res = await httpsFetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return NextResponse.json({ error: 'Spotify error' }, { status: res.status });
  return NextResponse.json(await res.json());
}
