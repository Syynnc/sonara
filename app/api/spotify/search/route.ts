import { NextRequest, NextResponse } from 'next/server';
import { getClientCredentialsToken, searchSpotify } from '@/lib/spotify/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const types = (searchParams.get('types') ?? 'track,artist').replace(/%2C/gi, ',');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  try {
    const token = await getClientCredentialsToken();
    const results = await searchSpotify(q.trim(), token, types);
    return NextResponse.json(results);
  } catch (err) {
    console.error('Spotify search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
