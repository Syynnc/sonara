import { createClient } from '@/lib/supabase/server';
import { getUserTopTracks, getUserTopArtists } from '@/lib/spotify/api';
import { getValidSpotifyToken } from '@/lib/spotify/getValidToken';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';
import type { SpotifyTrack, SpotifyArtist } from '@/lib/spotify/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const accessToken = await getValidSpotifyToken(supabase, user.id);
  if (!accessToken) redirect('/login?error=token_expired');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  let topTracks: SpotifyTrack[]   = [];
  let topArtists: SpotifyArtist[] = [];
  let spotifyError = false;

  try {
    const [tracksData, artistsData] = await Promise.all([
      getUserTopTracks(accessToken,  'short_term',  20),
      getUserTopArtists(accessToken, 'medium_term', 16),
    ]);
    topTracks  = tracksData.items  ?? [];
    topArtists = artistsData.items ?? [];
  } catch {
    spotifyError = true;
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <DashboardClient
      firstName={firstName}
      topTracks={topTracks}
      topArtists={topArtists}
      accessToken={accessToken}
      spotifyError={spotifyError}
    />
  );
}
