'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { TrackCard } from '@/app/components/TrackCard';
import { SearchArtistCard } from '@/app/components/SearchArtistCard';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { SpotifyTrack, SpotifyArtist, SpotifySearchResult } from '@/lib/spotify/types';

const GENRE_CHIPS = ['Hip-Hop', 'Indie', 'Jazz', 'Electronic', 'R&B', 'Alternative', 'Soul', 'Neo-Soul', 'Ambient', 'Pop'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifySearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 380);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}&types=track,artist`);
      if (!res.ok) throw new Error('Search failed');
      const data: SpotifySearchResult = await res.json();
      setResults(data);
    } catch {
      setError('Could not reach Spotify. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  const tracks = results?.tracks?.items ?? [];
  const artists = results?.artists?.items ?? [];
  const hasResults = tracks.length > 0 || artists.length > 0;
  const searched = debouncedQuery.trim().length >= 2;

  return (
    <div className="min-h-[100dvh] bg-[#121212] pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#FF5500]/50 uppercase mb-3">
            Discover
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#FFFFFF]">
            Search.
          </h1>
        </div>

        {/* Search Input */}
        <div className="mb-8 max-w-2xl animate-fade-up-delay-1">
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF5500]/50 pointer-events-none">
              {loading
                ? <Loader2 size={18} strokeWidth={1.5} className="animate-spin" />
                : <Search size={18} strokeWidth={1.5} />
              }
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Artists, tracks, genres…"
              autoFocus
              /* pl-search = padding-left: 3.25rem, defined in globals.css */
              className="pl-search w-full bg-[#181818] border border-[#282828] rounded-2xl py-4 pr-6 text-[#FFFFFF] placeholder:text-[#B3B3B3]/35 focus:outline-none focus:border-[#FF5500]/40 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-[15px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B3B3B3]/40 hover:text-[#B3B3B3] transition-colors text-lg leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Genre chips */}
          {!query && (
            <div className="flex flex-wrap gap-2 mt-4">
              {GENRE_CHIPS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setQuery(g)}
                  className="px-3 py-1.5 text-xs font-medium text-[#B3B3B3]/60 bg-[#181818] border border-[#282828] rounded-full hover:border-[#FF5500]/35 hover:text-[#FF5500] transition-all duration-200"
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="space-y-12">

            {/* Tracks */}
            {tracks.length > 0 && (
              <section className="animate-fade-up-results">
                <div className="flex items-center gap-4 mb-4">
                  <p className="text-[10px] font-bold tracking-[0.3em] text-[#FF5500]/55 uppercase whitespace-nowrap">
                    Tracks
                  </p>
                  <div className="flex-1 h-px bg-[#282828]" />
                  <span className="text-[10px] text-[#B3B3B3]/30">{results?.tracks?.total.toLocaleString()} results</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                  {tracks.map((track: SpotifyTrack, i) => (
                    <div key={track.id} className={`stagger-30-${Math.min(i, 9)}`}>
                      <TrackCard track={track} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {artists.length > 0 && (
              <section className="animate-fade-up-results-delay">
                <div className="flex items-center gap-4 mb-4">
                  <p className="text-[10px] font-bold tracking-[0.3em] text-[#FF5500]/55 uppercase whitespace-nowrap">
                    Artists
                  </p>
                  <div className="flex-1 h-px bg-[#282828]" />
                  <span className="text-[10px] text-[#B3B3B3]/30">{results?.artists?.total.toLocaleString()} results</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {artists.map((artist: SpotifyArtist, i) => (
                    <div key={artist.id} className={`stagger-${Math.min(i, 20)}`}>
                      <SearchArtistCard artist={artist} />
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Empty state — searched but nothing found */}
        {searched && !loading && !hasResults && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-4xl mb-5 text-[#B3B3B3]/20 font-mono">?</p>
            <h3 className="text-lg font-semibold text-[#FFFFFF]/50 mb-2">No results for &ldquo;{query}&rdquo;</h3>
            <p className="text-sm text-[#B3B3B3]/30">Try a different spelling or a broader term.</p>
          </div>
        )}

        {/* Landing state */}
        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-[#B3B3B3]/30 max-w-[32ch]">
              Type an artist name, track title, or genre to start exploring.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
