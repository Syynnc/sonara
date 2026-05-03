'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, ExternalLink, Loader2, Search, ListMusic } from 'lucide-react';
import { formatDuration } from '@/app/components/TrackCard';
import type { SpotifyTrack, SpotifySearchResult, LocalPlaylist, LocalPlaylistTrack } from '@/lib/spotify/types';

// ── Sub-components ────────────────────────────────────────────────────────────

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function CreatePlaylistModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await onCreate(name.trim(), description.trim());
    setCreating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]/80 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#181818] border border-[#282828] rounded-3xl p-7"
        style={{ animation: 'fade-up 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <h2 className="text-lg font-bold text-[#FFFFFF] tracking-tight mb-6">New playlist</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-medium text-[#B3B3B3]/60 mb-1.5 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My playlist"
              autoFocus
              className="w-full bg-[#121212] border border-[#282828] rounded-xl px-4 py-3 text-sm text-[#FFFFFF] placeholder:text-[#B3B3B3]/30 focus:outline-none focus:border-[#1DB954]/40 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#B3B3B3]/60 mb-1.5 block">Description <span className="text-[#B3B3B3]/30">(optional)</span></label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your playlist"
              className="w-full bg-[#121212] border border-[#282828] rounded-xl px-4 py-3 text-sm text-[#FFFFFF] placeholder:text-[#B3B3B3]/30 focus:outline-none focus:border-[#1DB954]/40 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#B3B3B3]/60 border border-[#282828] rounded-xl hover:border-[#3a3a3a] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || creating}
            className="flex-1 py-2.5 text-sm font-semibold text-[#121212] bg-[#1DB954] rounded-xl hover:bg-[#1ed760] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<LocalPlaylist[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<LocalPlaylistTrack[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  // Track search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 380);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchPlaylists = useCallback(async () => {
    const res = await fetch('/api/spotify/playlists');
    if (!res.ok) return;
    const data = await res.json();
    setPlaylists(data);
    setLoadingPlaylists(false);
  }, []);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  const fetchTracks = useCallback(async (playlistId: string) => {
    setLoadingTracks(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const res = await fetch(
      `${supabaseUrl}/rest/v1/playlist_tracks?playlist_id=eq.${playlistId}&order=position.asc`,
      { headers: { apikey: supabaseKey!, Authorization: `Bearer ${supabaseKey}` } },
    );
    if (res.ok) setTracks(await res.json());
    setLoadingTracks(false);
  }, []);

  useEffect(() => {
    if (activeId) { setExportUrl(null); fetchTracks(activeId); }
  }, [activeId, fetchTracks]);

  // ── Track search ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (debouncedSearch.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    fetch(`/api/spotify/search?q=${encodeURIComponent(debouncedSearch)}&types=track`)
      .then((r) => r.json())
      .then((d: SpotifySearchResult) => setSearchResults(d.tracks?.items ?? []))
      .catch(() => {})
      .finally(() => setSearching(false));
  }, [debouncedSearch]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const createPlaylist = async (name: string, description: string) => {
    const res = await fetch('/api/spotify/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      const newPl = await res.json();
      setPlaylists((prev) => [newPl, ...prev]);
      setActiveId(newPl.id);
    }
  };

  const addTrack = async (track: SpotifyTrack) => {
    if (!activeId) return;
    if (tracks.some((t) => t.spotify_track_id === track.id)) return; // already in playlist

    const payload = {
      spotify_track_id: track.id,
      track_name: track.name,
      artist_name: track.artists.map((a) => a.name).join(', '),
      album_name: track.album.name,
      album_image_url: track.album.images[1]?.url ?? track.album.images[0]?.url ?? null,
      duration_ms: track.duration_ms,
      spotify_uri: track.uri,
    };

    const res = await fetch(`/api/spotify/playlists/${activeId}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const newTrack = await res.json();
      setTracks((prev) => [...prev, newTrack]);
    }
  };

  const removeTrack = async (trackId: string) => {
    if (!activeId) return;
    await fetch(`/api/spotify/playlists/${activeId}/tracks?track_id=${trackId}`, { method: 'DELETE' });
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const exportToSpotify = async () => {
    if (!activeId) return;
    setExporting(true);
    const res = await fetch(`/api/spotify/playlists/${activeId}/export`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) setExportUrl(data.spotify_url);
    else alert(data.error ?? 'Export failed');
    setExporting(false);
  };

  const activePlaylist = playlists.find((p) => p.id === activeId);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-[#121212] pt-28 pb-20">
      {showCreate && (
        <CreatePlaylistModal onClose={() => setShowCreate(false)} onCreate={createPlaylist} />
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          className="flex items-end justify-between mb-10"
          style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#1DB954]/50 uppercase mb-2">Your Library</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#FFFFFF]">Playlists.</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1DB954] text-[#121212] font-semibold text-sm rounded-full hover:bg-[#1ed760] transition-colors active:scale-[0.98]"
          >
            <Plus size={15} strokeWidth={2.5} />
            New playlist
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* ── Playlist list ─────────────────────────────────────────── */}
          <aside className="space-y-1.5">
            {loadingPlaylists ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-[#181818] rounded-2xl animate-pulse" />
              ))
            ) : playlists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <ListMusic size={28} className="text-[#B3B3B3]/20 mb-3" strokeWidth={1.5} />
                <p className="text-sm text-[#B3B3B3]/40">No playlists yet.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="text-xs text-[#1DB954]/60 hover:text-[#1DB954] mt-2 transition-colors"
                >
                  Create your first →
                </button>
              </div>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => setActiveId(pl.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                    activeId === pl.id
                      ? 'bg-[#1DB954]/10 border border-[#1DB954]/25'
                      : 'hover:bg-[#181818] border border-transparent'
                  }`}
                >
                  <p className={`text-sm font-semibold truncate ${activeId === pl.id ? 'text-[#FFFFFF]' : 'text-[#FFFFFF]/70'}`}>
                    {pl.name}
                  </p>
                  {pl.description && (
                    <p className="text-xs text-[#B3B3B3]/40 truncate mt-0.5">{pl.description}</p>
                  )}
                </button>
              ))
            )}
          </aside>

          {/* ── Active playlist + track search ────────────────────────── */}
          {activePlaylist ? (
            <div className="space-y-6">
              {/* Playlist header */}
              <div className="bg-[#181818] border border-[#282828] rounded-3xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight">{activePlaylist.name}</h2>
                    {activePlaylist.description && (
                      <p className="text-sm text-[#B3B3B3]/50 mt-0.5">{activePlaylist.description}</p>
                    )}
                    <p className="text-xs text-[#B3B3B3]/35 mt-1 font-mono">{tracks.length} tracks</p>
                  </div>

                  {exportUrl ? (
                    <a
                      href={exportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#1DB954] text-white text-sm font-semibold rounded-full hover:bg-[#1ed760] transition-colors"
                    >
                      <ExternalLink size={13} />
                      Open in Spotify
                    </a>
                  ) : (
                    <button
                      onClick={exportToSpotify}
                      disabled={exporting || tracks.length === 0}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#1DB954]/90 text-white text-sm font-semibold rounded-full hover:bg-[#1DB954] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {exporting ? <Loader2 size={13} className="animate-spin" /> : (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                      )}
                      {exporting ? 'Exporting…' : 'Export to Spotify'}
                    </button>
                  )}
                </div>

                {/* Track search */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1DB954]/40 pointer-events-none">
                    {searching ? <Loader2 size={15} strokeWidth={1.5} className="animate-spin" /> : <Search size={15} strokeWidth={1.5} />}
                  </div>
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tracks to add…"
                    className="w-full bg-[#121212] border border-[#282828] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#FFFFFF] placeholder:text-[#B3B3B3]/30 focus:outline-none focus:border-[#1DB954]/35 transition-colors"
                  />
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-56 overflow-y-auto space-y-0.5 rounded-xl border border-[#282828] bg-[#121212] p-1">
                    {searchResults.map((track) => {
                      const alreadyAdded = tracks.some((t) => t.spotify_track_id === track.id);
                      return (
                        <button
                          key={track.id}
                          onClick={() => !alreadyAdded && addTrack(track)}
                          disabled={alreadyAdded}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            alreadyAdded
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:bg-[#181818]'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-[#282828] shrink-0">
                            {track.album.images[2]?.url && (
                              <img src={track.album.images[2].url} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#FFFFFF]/85 truncate">{track.name}</p>
                            <p className="text-[10px] text-[#B3B3B3]/45 truncate">{track.artists.map((a) => a.name).join(', ')}</p>
                          </div>
                          {alreadyAdded ? (
                            <span className="text-[10px] text-[#1DB954]/40 shrink-0">Added</span>
                          ) : (
                            <Plus size={14} className="text-[#1DB954]/50 shrink-0" strokeWidth={2} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Playlist tracks */}
              <div className="bg-[#181818] border border-[#282828] rounded-3xl overflow-hidden">
                {loadingTracks ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-[#282828] rounded-lg animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-[#282828] rounded-full w-2/3 animate-pulse" />
                          <div className="h-2.5 bg-[#282828] rounded-full w-1/3 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : tracks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <ListMusic size={28} className="text-[#B3B3B3]/15 mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-[#B3B3B3]/35">Search for tracks above to build your playlist.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#282828]">
                    {tracks.map((track, i) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-[#242424] transition-colors group"
                        style={{ animation: `fade-up 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 25}ms both` }}
                      >
                        <span className="text-xs font-mono text-[#B3B3B3]/25 w-5 text-right shrink-0">
                          {i + 1}
                        </span>
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#282828] shrink-0">
                          {track.album_image_url && (
                            <img src={track.album_image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#FFFFFF]/85 truncate leading-tight">{track.track_name}</p>
                          <p className="text-xs text-[#B3B3B3]/45 truncate mt-0.5">{track.artist_name}</p>
                        </div>
                        <span className="text-xs font-mono text-[#B3B3B3]/30 shrink-0 tabular-nums">
                          {formatDuration(track.duration_ms)}
                        </span>
                        <button
                          onClick={() => removeTrack(track.id)}
                          className="p-1.5 text-[#B3B3B3]/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150 active:scale-90"
                          aria-label="Remove track"
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ListMusic size={36} className="text-[#B3B3B3]/15 mb-4" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-[#FFFFFF]/40 mb-2">Select a playlist</h3>
              <p className="text-sm text-[#B3B3B3]/25 max-w-[28ch]">
                Choose one from the sidebar or create a new one to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
