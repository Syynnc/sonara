import { createClient } from '@/lib/supabase/server';
import { getUserTopTracks, getUserTopArtists } from '@/lib/spotify/api';
import { redirect } from 'next/navigation';
import { TrackCard } from '@/app/components/TrackCard';
import { SearchArtistCard } from '@/app/components/SearchArtistCard';
import type { SpotifyTrack, SpotifyArtist } from '@/lib/spotify/types';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, spotify_access_token')
    .eq('id', user.id)
    .single();

  // No Spotify token — user needs to reconnect
  if (!profile?.spotify_access_token) {
    redirect('/login?error=token_expired');
  }

  let topTracks: SpotifyTrack[] = [];
  let topArtists: SpotifyArtist[] = [];
  let spotifyError = false;

  try {
    const [tracksData, artistsData] = await Promise.all([
      getUserTopTracks(profile.spotify_access_token, 'short_term', 20),
      getUserTopArtists(profile.spotify_access_token, 'medium_term', 12),
    ]);
    topTracks = tracksData.items ?? [];
    topArtists = artistsData.items ?? [];
  } catch {
    spotifyError = true;
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-[100dvh] bg-[#141414] pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Greeting */}
        <div
          className="mb-12"
          style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <p className="text-xs font-semibold tracking-[0.25em] text-[#d4af37]/50 uppercase mb-2">
            {getGreeting()}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#f0e6c8]">
            Hey, {firstName}.
          </h1>
          <p className="text-[#c8b87a]/55 mt-2 text-sm">Here&apos;s what you&apos;ve been listening to.</p>
        </div>

        {spotifyError && (
          <div className="mb-10 px-5 py-4 bg-[#d4af37]/8 border border-[#d4af37]/20 rounded-2xl flex items-center justify-between gap-4">
            <p className="text-sm text-[#c8b87a]">
              Your Spotify session expired. Sign in again to refresh your data.
            </p>
            <a
              href="/login?error=token_expired"
              className="shrink-0 px-4 py-2 text-xs font-semibold text-[#141414] bg-[#d4af37] rounded-full hover:bg-[#debb4a] transition-colors"
            >
              Reconnect
            </a>
          </div>
        )}

        {/* Top Tracks */}
        {topTracks.length > 0 && (
          <section
            className="mb-14"
            style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
          >
            <div className="flex items-center gap-4 mb-5">
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37]/55 uppercase whitespace-nowrap">
                Your Top Tracks
              </p>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <span className="text-[10px] text-[#c8b87a]/30">Last 4 weeks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
              {topTracks.map((track, i) => (
                <TrackCard key={track.id} track={track} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <section
            style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
          >
            <div className="flex items-center gap-4 mb-5">
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37]/55 uppercase whitespace-nowrap">
                Your Top Artists
              </p>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <span className="text-[10px] text-[#c8b87a]/30">Last 6 months</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {topArtists.map((artist) => (
                <SearchArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!spotifyError && topTracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-5">
              <span className="text-2xl text-[#c8b87a]/30 font-mono">♪</span>
            </div>
            <h3 className="text-lg font-semibold text-[#f0e6c8]/60 mb-2">No listening history yet</h3>
            <p className="text-sm text-[#c8b87a]/35 max-w-[32ch]">
              Play some music on Spotify and check back — your top tracks will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
