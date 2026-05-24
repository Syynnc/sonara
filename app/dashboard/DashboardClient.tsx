'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SpotifyWebPlayer } from '@/app/components/SpotifyWebPlayer';
import { formatDuration } from '@/app/components/TrackCard';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type {
  SpotifyTrack, SpotifyArtist, SpotifySearchResult,
  LocalPlaylist, LocalPlaylistTrack,
} from '@/lib/spotify/types';

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'search' | 'playlists';

interface DashboardClientProps {
  firstName: string;
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
  accessToken: string;
  spotifyError: boolean;
}

interface NavItem {
  id: Tab | 'stats';
  icon: React.FC;
  label: string;
  disabled?: boolean;
}

// ── Ultra-thin custom icons (zero Lucide) ──────────────────────────────────────
function IcoGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IcoSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </svg>
  );
}
function IcoList() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function IcoChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18M7 20V10M12 20V4M17 20v-7" />
    </svg>
  );
}
function IcoSettings() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IcoLogOut() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IcoPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IcoTrash() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}
function IcoExternal() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
function IcoLoader() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function IcoAlert() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function IcoHeadphones() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

const NAV: NavItem[] = [
  { id: 'overview',  icon: IcoGrid,  label: 'Overview'  },
  { id: 'search',    icon: IcoSearch, label: 'Search'   },
  { id: 'playlists', icon: IcoList,  label: 'Playlists' },
  { id: 'stats',     icon: IcoChart, label: 'Stats', disabled: true },
];

// ── Sidebar nav button (double-bezel when active) ─────────────────────────────
function NavBtn({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      disabled={item.disabled}
      onClick={onClick}
      title={item.label}
      className={`
        w-full flex items-center justify-center
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${item.disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {active ? (
        /* Active — double-bezel */
        <div className="p-1.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl shadow-[0_0_16px_rgba(255,85,0,0.12)]">
          <div className="w-8 h-8 rounded-[calc(1rem-0.375rem)] bg-[#FF5500]/12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex items-center justify-center text-[#FF5500]">
            <Icon />
          </div>
        </div>
      ) : (
        /* Inactive */
        <div className={`
          w-10 h-10 rounded-2xl flex items-center justify-center
          text-white/25 hover:text-white/55 hover:bg-white/[0.04]
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        `}>
          <Icon />
        </div>
      )}
    </button>
  );
}

// ── Track row ─────────────────────────────────────────────────────────────────
function TrackRow({
  track, rank, onPlay, onAdd,
}: {
  track: SpotifyTrack;
  rank?: number;
  onPlay?: (uri: string) => void;
  onAdd?: (track: SpotifyTrack) => void;
}) {
  const image   = track.album.images[1]?.url ?? track.album.images[0]?.url;
  const artists = track.artists.map((a) => a.name).join(', ');

  return (
    <div
      className="
        flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer group
        hover:bg-white/[0.03]
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
      "
      onClick={() => onPlay?.(track.uri)}
    >
      {rank !== undefined && (
        <span className="text-[10px] font-mono text-white/20 w-5 text-right shrink-0 tabular-nums">{rank}</span>
      )}

      {/* Album art — double-bezel */}
      <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.06] rounded-xl shrink-0">
        <div className="w-9 h-9 rounded-[calc(0.75rem-1.5px)] overflow-hidden bg-[#111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] relative">
          {image && <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />}
          {onPlay && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <div className="w-5 h-5 rounded-full bg-[#FF5500] flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.5)]">
                <svg viewBox="0 0 8 8" className="w-2 h-2 fill-white translate-x-[0.5px]"><polygon points="1,0 7,4 1,8" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80 truncate leading-tight group-hover:text-white transition-colors duration-300">{track.name}</p>
        <p className="text-xs text-white/30 truncate mt-0.5">{artists}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono text-white/20 tabular-nums">{formatDuration(track.duration_ms)}</span>
        {onAdd && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAdd(track); }}
            aria-label={`Add ${track.name}`}
            className="
              w-6 h-6 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20
              flex items-center justify-center text-[#FF5500]
              opacity-0 group-hover:opacity-100
              hover:bg-[#FF5500]/20 active:scale-90
              transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            "
          >
            <IcoPlus />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Artist chip ───────────────────────────────────────────────────────────────
function ArtistChip({ artist, onPlay }: { artist: SpotifyArtist; onPlay?: (name: string) => void }) {
  const img = artist.images?.[2]?.url ?? artist.images?.[0]?.url;
  return (
    <button
      type="button"
      onClick={() => onPlay?.(artist.name)}
      className="flex flex-col items-center gap-2.5 group"
    >
      {/* Avatar — double-bezel ring */}
      <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.06] rounded-full group-hover:border-[#FF5500]/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:shadow-[0_0_16px_rgba(255,85,0,0.12)]">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-[#111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          {img
            ? <img src={img} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
            : <div className="w-full h-full flex items-center justify-center text-white/25 text-lg font-bold">{artist.name[0]}</div>
          }
        </div>
      </div>
      <p className="text-[10px] text-white/35 group-hover:text-white/70 transition-colors duration-300 text-center w-16 truncate">{artist.name}</p>
    </button>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────
function SectionHeader({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Eyebrow pill */}
      <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full shrink-0">
        <div className="px-2.5 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <span className="text-[9px] font-bold tracking-[0.28em] text-[#FF5500]/60 uppercase whitespace-nowrap">{label}</span>
        </div>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
      {meta && <span className="text-[10px] text-white/20 shrink-0">{meta}</span>}
    </div>
  );
}

// ── Inset search input ────────────────────────────────────────────────────────
function SearchInput({
  value, onChange, onFocus, placeholder, inputRef, isSearching,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  placeholder: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  isSearching?: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
        {isSearching ? <IcoLoader /> : <IcoSearch />}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="
          w-full bg-[#0A0A0A] border border-white/[0.07]
          shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)]
          rounded-2xl py-2.5 pl-9 pr-4
          text-sm text-white placeholder:text-white/25
          focus:outline-none focus:border-[#FF5500]/25
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        "
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors duration-300 text-base leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function DashboardClient({
  firstName, topTracks, topArtists, accessToken, spotifyError,
}: DashboardClientProps) {
  const [tab, setTab]               = useState<Tab>('overview');
  const [playingUri, setPlayingUri] = useState<string | null>(null);

  // ── Search state ───────────────────────────────────────────────────────────
  const [query, setQuery]             = useState('');
  const [results, setResults]         = useState<SpotifySearchResult | null>(null);
  const [searching, setSearching]     = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 380);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const GENRE_CHIPS = ['Hip-Hop', 'Indie', 'Jazz', 'Electronic', 'R&B', 'Neo-Soul', 'Ambient', 'Pop'];

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) { setResults(null); return; }
    setSearching(true);
    setSearchError(null);
    fetch(`/api/spotify/search?q=${encodeURIComponent(debouncedQuery)}&types=track,artist`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: SpotifySearchResult) => setResults(d))
      .catch(() => setSearchError('Could not reach Spotify.'))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  // ── Playlist state ─────────────────────────────────────────────────────────
  const [playlists, setPlaylists]               = useState<LocalPlaylist[]>([]);
  const [activeId, setActiveId]                 = useState<string | null>(null);
  const [tracks, setTracks]                     = useState<LocalPlaylistTrack[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadingTracks, setLoadingTracks]       = useState(false);
  const [showCreate, setShowCreate]             = useState(false);
  const [newName, setNewName]                   = useState('');
  const [newDesc, setNewDesc]                   = useState('');
  const [creating, setCreating]                 = useState(false);
  const [plSearch, setPlSearch]                 = useState('');
  const [plResults, setPlResults]               = useState<SpotifyTrack[]>([]);
  const [plSearching, setPlSearching]           = useState(false);
  const [exporting, setExporting]               = useState(false);
  const [exportUrl, setExportUrl]               = useState<string | null>(null);
  const [exportError, setExportError]           = useState<string | null>(null);
  const [removeError, setRemoveError]           = useState<string | null>(null);
  const debouncedPlSearch = useDebounce(plSearch, 380);

  const fetchPlaylists = useCallback(async () => {
    setLoadingPlaylists(true);
    try {
      const r = await fetch('/api/spotify/playlists');
      if (r.ok) setPlaylists(await r.json());
    } finally { setLoadingPlaylists(false); }
  }, []);

  const fetchTracks = useCallback(async (id: string) => {
    setLoadingTracks(true);
    try {
      const r = await fetch(`/api/spotify/playlists/${id}/tracks`);
      if (r.ok) setTracks(await r.json());
    } finally { setLoadingTracks(false); }
  }, []);

  useEffect(() => { fetchPlaylists(); }, [fetchPlaylists]);

  useEffect(() => {
    if (activeId) { setExportUrl(null); setExportError(null); fetchTracks(activeId); }
  }, [activeId, fetchTracks]);

  useEffect(() => {
    if (debouncedPlSearch.trim().length < 2) { setPlResults([]); return; }
    setPlSearching(true);
    fetch(`/api/spotify/search?q=${encodeURIComponent(debouncedPlSearch)}&types=track`)
      .then((r) => r.json())
      .then((d: SpotifySearchResult) => setPlResults(d.tracks?.items ?? []))
      .catch(() => {})
      .finally(() => setPlSearching(false));
  }, [debouncedPlSearch]);

  const createPlaylist = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const r = await fetch('/api/spotify/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
    });
    if (r.ok) {
      const pl = await r.json();
      setPlaylists((prev) => [pl, ...prev]);
      setActiveId(pl.id);
    }
    setCreating(false);
    setShowCreate(false);
    setNewName('');
    setNewDesc('');
  };

  const addTrack = async (track: SpotifyTrack) => {
    if (!activeId || tracks.some((t) => t.spotifyTrackId === track.id)) return;
    const payload = {
      spotify_track_id: track.id,
      track_name:       track.name,
      artist_name:      track.artists.map((a) => a.name).join(', '),
      album_name:       track.album.name,
      album_image_url:  track.album.images[1]?.url ?? track.album.images[0]?.url ?? null,
      duration_ms:      track.duration_ms,
      spotify_uri:      track.uri,
    };
    const r = await fetch(`/api/spotify/playlists/${activeId}/tracks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (r.ok) { const nt = await r.json(); setTracks((p) => [...p, nt]); setPlSearch(''); setPlResults([]); }
  };

  const removeTrack = async (trackId: string) => {
    if (!activeId) return;
    setRemoveError(null);
    const snapshot = tracks;
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    const r = await fetch(`/api/spotify/playlists/${activeId}/tracks?track_id=${trackId}`, { method: 'DELETE' });
    if (!r.ok) { setTracks(snapshot); setRemoveError('Could not remove track. Please try again.'); }
  };

  const exportToSpotify = async () => {
    if (!activeId) return;
    setExporting(true); setExportError(null);
    const r = await fetch(`/api/spotify/playlists/${activeId}/export`, { method: 'POST' });
    const d = await r.json();
    if (r.ok) setExportUrl(d.spotify_url); else setExportError(d.error ?? 'Export failed.');
    setExporting(false);
  };

  const activePlaylist = playlists.find((p) => p.id === activeId);
  const searchTracks   = results?.tracks?.items  ?? [];
  const searchArtists  = results?.artists?.items ?? [];
  const searched       = debouncedQuery.trim().length >= 2;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#070707] overflow-hidden">

      {/* ── Left Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-[60px] flex flex-col items-center py-4 gap-1.5 border-r border-white/[0.05] bg-[#090909] shrink-0">

        {/* Logo — double-bezel */}
        <a href="/" className="mb-4 group" title="Home">
          <div className="p-1.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl group-hover:border-[#FF5500]/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <div className="w-7 h-7 rounded-[calc(1rem-0.375rem)] bg-[#FF5500]/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex items-center justify-center text-[#FF5500]">
              <IcoHeadphones />
            </div>
          </div>
        </a>

        {/* Nav items */}
        {NAV.map((item) => (
          <NavBtn
            key={item.id}
            item={item}
            active={tab === item.id}
            onClick={() => { if (!item.disabled) setTab(item.id as Tab); }}
          />
        ))}

        <div className="flex-1" />

        {/* Sign out */}
        <a
          href="/api/auth/signout"
          title="Sign out"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/20 hover:text-red-400/70 hover:bg-white/[0.03] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          <IcoLogOut />
        </a>

        {/* Settings */}
        <button
          type="button"
          title="Settings"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.03] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          <IcoSettings />
        </button>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.05] bg-[#080808] shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <SearchInput
              value={query}
              onChange={(v) => { setQuery(v); if (tab !== 'search') setTab('search'); }}
              onFocus={() => setTab('search')}
              placeholder="Search music…"
              inputRef={searchInputRef}
              isSearching={searching}
            />
          </div>

          {/* Tab pills */}
          <div className="flex items-center gap-1 ml-auto">
            {NAV.filter((n) => !n.disabled).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setTab(n.id as Tab)}
                className={`
                  px-3.5 py-1.5 rounded-full text-[11px] font-medium
                  transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                  ${tab === n.id
                    ? 'bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04] border border-transparent'
                  }
                `}
              >
                {n.label}
              </button>
            ))}
          </div>

          {/* Avatar — double-bezel */}
          <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.06] rounded-full shrink-0">
            <div className="w-7 h-7 rounded-full bg-[#0C0C0C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] flex items-center justify-center text-[10px] font-bold text-white/50">
              {firstName[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── Scrollable content ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Overview ──────────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="px-6 py-10 space-y-10 max-w-4xl">

              {/* Welcome */}
              <div>
                <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full w-fit mb-3">
                  <div className="px-3 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <span className="text-[9px] font-bold tracking-[0.28em] text-[#FF5500]/50 uppercase">Welcome back</span>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Good to see you, {firstName}.</h1>
                <p className="text-sm text-white/30 mt-1.5">Here&apos;s what you&apos;ve been listening to.</p>
              </div>

              {/* Spotify error banner */}
              {spotifyError && (
                <div className="p-2 bg-white/[0.025] border border-white/[0.06] rounded-2xl">
                  <div className="bg-[#0C0C0C] rounded-[calc(1rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] px-5 py-4 flex items-center justify-between gap-4">
                    <p className="text-sm text-white/50">Could not load Spotify data. It will refresh on your next visit.</p>
                    <a
                      href="/dashboard"
                      className="group shrink-0 flex items-center gap-0 pl-4 pr-1 py-1 bg-[#FF5500] text-white text-xs font-semibold rounded-full hover:bg-[#FF6820] active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_4px_16px_rgba(255,85,0,0.25)]"
                    >
                      Retry
                      <span className="ml-2 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" /></svg>
                      </span>
                    </a>
                  </div>
                </div>
              )}

              {/* Top tracks */}
              {topTracks.length > 0 && (
                <section>
                  <SectionHeader label="Your Top Tracks" meta="Last 4 weeks" />
                  {/* Card shell */}
                  <div className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-[2rem]">
                    <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-2">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        {topTracks.map((track, i) => (
                          <TrackRow key={track.id} track={track} rank={i + 1} onPlay={setPlayingUri} />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Top artists */}
              {topArtists.length > 0 && (
                <section>
                  <SectionHeader label="Your Top Artists" meta="Last 6 months" />
                  <div className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-[2rem]">
                    <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-6">
                      <div className="flex flex-wrap gap-5">
                        {topArtists.map((artist) => (
                          <ArtistChip
                            key={artist.id}
                            artist={artist}
                            onPlay={(name) => { setQuery(name); setTab('search'); }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Empty state */}
              {!spotifyError && topTracks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="p-2 bg-white/[0.03] border border-white/[0.05] rounded-3xl mb-5">
                    <div className="w-14 h-14 rounded-[calc(1.5rem-0.5rem)] bg-[#0A0A0A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] flex items-center justify-center">
                      <span className="text-2xl text-white/15 font-mono">♪</span>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white/35 mb-2">No listening history yet</h3>
                  <p className="text-sm text-white/20 max-w-[32ch]">Play some music on Spotify and check back.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Search ────────────────────────────────────────────────────── */}
          {tab === 'search' && (
            <div className="px-6 py-10 max-w-4xl">
              <div className="mb-6">
                <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full w-fit mb-3">
                  <div className="px-3 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <span className="text-[9px] font-bold tracking-[0.28em] text-[#FF5500]/50 uppercase">Discover</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Search</h2>
              </div>

              {/* Genre chips */}
              {!query && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {GENRE_CHIPS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => { setQuery(g); searchInputRef.current?.focus(); }}
                      className="
                        px-3.5 py-1.5 text-xs font-medium text-white/40
                        bg-[#0A0A0A] border border-white/[0.07]
                        shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]
                        rounded-full
                        hover:border-[#FF5500]/25 hover:text-[#FF5500]/80
                        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                      "
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}

              {searchError && (
                <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-red-500/[0.06] border border-red-500/15 rounded-2xl text-sm text-red-400">
                  <IcoAlert />
                  {searchError}
                </div>
              )}

              {searching && (
                <div className="flex items-center gap-2.5 py-10 text-white/30">
                  <IcoLoader />
                  <span className="text-sm">Searching…</span>
                </div>
              )}

              {!searching && (searchTracks.length > 0 || searchArtists.length > 0) && (
                <div className="space-y-10">
                  {searchTracks.length > 0 && (
                    <section>
                      <SectionHeader label="Tracks" meta={results?.tracks?.total.toLocaleString() + ' results'} />
                      <div className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-[2rem]">
                        <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-2">
                          <div className="grid grid-cols-1 md:grid-cols-2">
                            {searchTracks.map((t) => (
                              <TrackRow key={t.id} track={t} onPlay={setPlayingUri} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                  {searchArtists.length > 0 && (
                    <section>
                      <SectionHeader label="Artists" />
                      <div className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-[2rem]">
                        <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] px-6 py-5">
                          <div className="flex flex-wrap gap-5">
                            {searchArtists.map((a) => (
                              <ArtistChip key={a.id} artist={a} onPlay={(name) => setQuery(name)} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              )}

              {searched && !searching && searchTracks.length === 0 && searchArtists.length === 0 && !searchError && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-5xl mb-5 text-white/10 font-mono select-none">?</p>
                  <h3 className="text-base font-semibold text-white/30 mb-2">No results for &ldquo;{query}&rdquo;</h3>
                  <p className="text-sm text-white/18">Try a different spelling or broader term.</p>
                </div>
              )}
              {!searched && !searching && (
                <p className="text-sm text-white/20 py-10">Type a name, track, or genre above to start exploring.</p>
              )}
            </div>
          )}

          {/* ── Playlists ─────────────────────────────────────────────────── */}
          {tab === 'playlists' && (
            <div className="px-6 py-10 max-w-4xl">
              {/* Header */}
              <div className="flex items-end justify-between mb-7">
                <div>
                  <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full w-fit mb-3">
                    <div className="px-3 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      <span className="text-[9px] font-bold tracking-[0.28em] text-[#FF5500]/50 uppercase">Your Library</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Playlists</h2>
                </div>

                {/* New playlist — Button-in-Button */}
                <button
                  type="button"
                  onClick={() => setShowCreate(!showCreate)}
                  className="
                    group flex items-center gap-0 pl-4 pr-1 py-1
                    bg-[#FF5500] text-white text-xs font-semibold rounded-full
                    hover:bg-[#FF6820] active:scale-[0.97]
                    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    shadow-[0_4px_20px_rgba(255,85,0,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]
                  "
                >
                  New playlist
                  <span className="ml-2 w-7 h-7 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <IcoPlus />
                  </span>
                </button>
              </div>

              {/* Create form — double-bezel card */}
              {showCreate && (
                <div className="mb-5 p-2 bg-white/[0.025] border border-white/[0.06] rounded-[2rem]">
                  <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] p-6">
                    <h3 className="text-sm font-bold text-white mb-5">New playlist</h3>
                    <div className="space-y-3 mb-5">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Playlist name"
                        autoFocus
                        className="w-full bg-[#0A0A0A] border border-white/[0.07] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FF5500]/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      />
                      <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full bg-[#0A0A0A] border border-white/[0.07] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#FF5500]/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      />
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => { setShowCreate(false); setNewName(''); setNewDesc(''); }}
                        className="flex-1 py-2.5 text-xs font-medium text-white/35 border border-white/[0.07] rounded-2xl hover:border-white/15 hover:text-white/55 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!newName.trim() || creating}
                        onClick={createPlaylist}
                        className="flex-1 py-2.5 text-xs font-semibold text-white bg-[#FF5500] rounded-2xl hover:bg-[#FF6820] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_4px_16px_rgba(255,85,0,0.2)]"
                      >
                        {creating ? 'Creating…' : 'Create'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Playlists + detail grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">

                {/* Playlist list */}
                <aside className="space-y-1">
                  {loadingPlaylists
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-14 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse" />
                      ))
                    : playlists.length === 0
                      ? (
                        <div className="py-12 text-center">
                          <IcoList />
                          <p className="text-xs text-white/25 mt-3">No playlists yet.</p>
                          <button type="button" onClick={() => setShowCreate(true)} className="text-xs text-[#FF5500]/50 hover:text-[#FF5500] mt-2 transition-colors duration-300">
                            Create one →
                          </button>
                        </div>
                      )
                      : playlists.map((pl) => (
                        <button
                          key={pl.id}
                          type="button"
                          onClick={() => setActiveId(pl.id)}
                          className={`
                            w-full text-left px-3.5 py-3 rounded-2xl
                            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                            ${activeId === pl.id
                              ? 'bg-[#FF5500]/8 border border-[#FF5500]/18 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                              : 'border border-transparent hover:bg-white/[0.03]'
                            }
                          `}
                        >
                          <p className={`text-sm font-medium truncate ${activeId === pl.id ? 'text-white' : 'text-white/55'}`}>{pl.name}</p>
                          {pl.description && <p className="text-xs text-white/25 truncate mt-0.5">{pl.description}</p>}
                        </button>
                      ))
                  }
                </aside>

                {/* Active playlist detail */}
                {activePlaylist ? (
                  <div className="space-y-3">
                    {/* Playlist header card — double-bezel */}
                    <div className="p-2 bg-white/[0.025] border border-white/[0.06] rounded-[2rem]">
                      <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] p-6">
                        <div className="flex items-start justify-between gap-3 mb-5">
                          <div>
                            <h3 className="text-base font-bold text-white tracking-tight">{activePlaylist.name}</h3>
                            {activePlaylist.description && <p className="text-xs text-white/35 mt-0.5">{activePlaylist.description}</p>}
                            <p className="text-[10px] text-white/20 mt-1 font-mono">{tracks.length} tracks</p>
                          </div>

                          {exportUrl ? (
                            <a
                              href={exportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group shrink-0 flex items-center gap-0 pl-3.5 pr-1 py-1 bg-[#FF5500] text-white text-xs font-semibold rounded-full hover:bg-[#FF6820] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                            >
                              Open in Spotify
                              <span className="ml-2 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-500">
                                <IcoExternal />
                              </span>
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={exportToSpotify}
                              disabled={exporting || tracks.length === 0}
                              className="group shrink-0 flex items-center gap-0 pl-3.5 pr-1 py-1 bg-[#FF5500]/90 text-white text-xs font-semibold rounded-full hover:bg-[#FF5500] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                            >
                              {exporting ? 'Exporting…' : 'Export to Spotify'}
                              <span className="ml-2 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-500">
                                {exporting
                                  ? <IcoLoader />
                                  : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                    </svg>
                                  )
                                }
                              </span>
                            </button>
                          )}
                        </div>

                        {exportError && (
                          <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-2xl text-xs text-red-400">
                            <IcoAlert />{exportError}
                          </div>
                        )}

                        {/* Track search to add */}
                        <SearchInput
                          value={plSearch}
                          onChange={setPlSearch}
                          placeholder="Search tracks to add…"
                          isSearching={plSearching}
                        />

                        {plResults.length > 0 && (
                          <div className="mt-2 max-h-48 overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#0A0A0A] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] p-1.5">
                            {plResults.map((track) => {
                              const added = tracks.some((t) => t.spotifyTrackId === track.id);
                              return (
                                <button
                                  key={track.id}
                                  type="button"
                                  onClick={() => !added && addTrack(track)}
                                  disabled={added}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-300 ${added ? 'opacity-35 cursor-not-allowed' : 'hover:bg-white/[0.04]'}`}
                                >
                                  <div className="p-[1px] bg-white/[0.04] border border-white/[0.06] rounded-lg shrink-0">
                                    <div className="w-7 h-7 rounded-[calc(0.5rem-1px)] overflow-hidden bg-[#111]">
                                      {track.album.images[2]?.url && <img src={track.album.images[2].url} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-white/80 truncate">{track.name}</p>
                                    <p className="text-[10px] text-white/35 truncate">{track.artists.map((a) => a.name).join(', ')}</p>
                                  </div>
                                  {added
                                    ? <span className="text-[9px] text-[#FF5500]/40 shrink-0">Added</span>
                                    : <IcoPlus />
                                  }
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remove error */}
                    {removeError && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-red-500/[0.06] border border-red-500/15 rounded-2xl text-xs text-red-400">
                        <IcoAlert />{removeError}
                        <button type="button" onClick={() => setRemoveError(null)} className="ml-auto text-red-400/40 hover:text-red-400 transition-colors duration-300">×</button>
                      </div>
                    )}

                    {/* Track list — double-bezel */}
                    <div className="p-2 bg-white/[0.025] border border-white/[0.06] rounded-[2rem]">
                      <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] overflow-hidden">
                        {loadingTracks ? (
                          <div className="p-6 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="flex gap-3 items-center">
                                <div className="w-9 h-9 bg-white/[0.04] rounded-xl animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-2.5 bg-white/[0.04] rounded-full w-2/3 animate-pulse" />
                                  <div className="h-2 bg-white/[0.04] rounded-full w-1/3 animate-pulse" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : tracks.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-14 text-center px-5">
                            <p className="text-xs text-white/20">Search for tracks above to build your playlist.</p>
                          </div>
                        ) : (
                          <div>
                            {tracks.map((track, i) => (
                              <div
                                key={track.id}
                                className="
                                  flex items-center gap-3 px-4 py-2.5 cursor-pointer group
                                  hover:bg-white/[0.03]
                                  border-b border-white/[0.04] last:border-0
                                  transition-all duration-300
                                "
                                onClick={() => track.spotifyUri && setPlayingUri(track.spotifyUri)}
                              >
                                <span className="text-[10px] font-mono text-white/20 w-4 text-right shrink-0">{i + 1}</span>
                                <div className="p-[1px] bg-white/[0.04] border border-white/[0.06] rounded-lg shrink-0">
                                  <div className="w-8 h-8 rounded-[calc(0.5rem-1px)] overflow-hidden bg-[#111]">
                                    {track.albumImageUrl && <img src={track.albumImageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white/80 truncate leading-tight">{track.trackName}</p>
                                  <p className="text-xs text-white/30 truncate mt-0.5">{track.artistName}</p>
                                </div>
                                <span className="text-[10px] font-mono text-white/20 shrink-0 tabular-nums">
                                  {track.durationMs ? formatDuration(track.durationMs) : '—'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
                                  aria-label="Remove track"
                                  className="p-1.5 text-white/15 hover:text-red-400/70 opacity-0 group-hover:opacity-100 active:scale-90 transition-all duration-300"
                                >
                                  <IcoTrash />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="p-2 bg-white/[0.03] border border-white/[0.05] rounded-3xl mb-5 opacity-40">
                      <div className="w-14 h-14 rounded-[calc(1.5rem-0.5rem)] bg-[#0A0A0A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] flex items-center justify-center">
                        <IcoList />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-white/25 mb-1.5">Select a playlist</h3>
                    <p className="text-xs text-white/15 max-w-[24ch]">Choose one from the left or create a new one.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Right Panel — Spotify Player ─────────────────────────────────────── */}
      <aside className="w-72 shrink-0 border-l border-white/[0.05] bg-[#090909] flex flex-col overflow-y-auto">
        <div className="px-4 pt-5 pb-3 border-b border-white/[0.05]">
          {/* Header — double-bezel eyebrow */}
          <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full w-fit">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]/60 animate-pulse-dot" />
              <span className="text-[9px] font-semibold tracking-[0.28em] text-[#FF5500]/50 uppercase">Now Playing</span>
            </div>
          </div>
        </div>
        <SpotifyWebPlayer accessToken={accessToken} trackUri={playingUri} />
      </aside>

    </div>
  );
}
