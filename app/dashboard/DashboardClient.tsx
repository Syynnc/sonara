'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SpotifyWebPlayer } from '@/app/components/SpotifyWebPlayer';
import type { PlayerControls, NowPlayingInfo } from '@/app/components/SpotifyWebPlayer';
import { TasteDNACard } from '@/app/components/TasteDNACard';
import type { AudioFeatureSet, GenreEntry } from '@/app/components/TasteDNACard';
import { ShortcutsModal } from '@/app/components/ShortcutsModal';
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

// ── Sidebar nav button (double-bezel when active, labelled) ──────────────────
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
        w-full flex flex-col items-center gap-1.5 py-1
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${item.disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {active ? (
        /* Active — double-bezel machined button */
        <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.07] rounded-2xl shadow-[0_0_20px_rgba(255,85,0,0.14)]">
          <div className="w-9 h-9 rounded-[calc(1rem-1.5px)] bg-[#FF5500]/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.09)] flex items-center justify-center text-[#FF5500]">
            <Icon />
          </div>
        </div>
      ) : (
        /* Inactive — ghost */
        <div className="
          w-9 h-9 rounded-2xl flex items-center justify-center
          text-white/25 hover:text-white/60 hover:bg-white/[0.04]
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ">
          <Icon />
        </div>
      )}
      {/* Label */}
      <span className={`
        text-[9px] font-medium tracking-wide
        transition-colors duration-300
        ${active ? 'text-[#FF5500]/70' : 'text-white/20'}
      `}>
        {item.label}
      </span>
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

// ── Artist card (grid layout) ──────────────────────────────────────────────
function ArtistCard({
  artist, rank, onPlay,
}: {
  artist: SpotifyArtist;
  rank: number;
  onPlay?: (name: string) => void;
}) {
  const img = artist.images?.[1]?.url ?? artist.images?.[0]?.url;
  const followers = artist.followers?.total;
  const fmtFollowers = followers != null
    ? followers >= 1_000_000
      ? `${(followers / 1_000_000).toFixed(1)}M`
      : followers >= 1_000
        ? `${(followers / 1_000).toFixed(0)}K`
        : String(followers)
    : null;

  return (
    <button
      type="button"
      onClick={() => onPlay?.(artist.name)}
      className="group relative text-left"
    >
      {/* Outer double-bezel shell */}
      <div className="p-[1.5px] bg-white/[0.025] border border-white/[0.05] rounded-[1.25rem] group-hover:border-[#FF5500]/20 group-hover:shadow-[0_0_20px_rgba(255,85,0,0.08)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
        <div className="bg-[#0B0B0B] rounded-[calc(1.25rem-1.5px)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden">
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden bg-[#111]">
            {img
              ? <img src={img} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" loading="lazy" />
              : <div className="w-full h-full flex items-center justify-center text-white/10 text-3xl font-bold">{artist.name[0]}</div>
            }
            {/* Rank badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/[0.08]">
              <span className="text-[9px] font-bold text-white/50 tabular-nums">#{rank}</span>
            </div>
            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0B0B0B] to-transparent" />
          </div>
          {/* Info */}
          <div className="px-2 pb-2 pt-1">
            <p className="text-[11px] font-semibold text-white/80 truncate group-hover:text-white transition-colors duration-300">{artist.name}</p>
            {fmtFollowers && (
              <p className="text-[9px] text-white/25 mt-0.5">{fmtFollowers} followers</p>
            )}
            {artist.genres?.[0] && (
              <p className="text-[9px] text-[#FF5500]/40 mt-1 capitalize truncate">{artist.genres[0]}</p>
            )}
          </div>
        </div>
      </div>
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

// ── Ambient Glow — uses CSS custom property to avoid inline style={} ──────────
function AmbientGlow({ rgb }: { rgb: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (rgb) {
      el.style.setProperty('--ambient-rgb', rgb);
      el.style.setProperty('display', '');
    } else {
      el.style.setProperty('display', 'none');
    }
  }, [rgb]);
  return (
    <div
      ref={ref}
      className="ambient-glow fixed inset-0 z-0 pointer-events-none transition-all duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
      aria-hidden
    />
  );
}

// ── Playlist Health Score ─────────────────────────────────────────────────────
interface RawAudioFeature {
  energy: number; danceability: number; valence: number;
  acousticness: number; instrumentalness: number; speechiness: number;
}

function computePlaylistHealth(features: RawAudioFeature[]) {
  if (!features.length) return null;
  const avg = (k: keyof RawAudioFeature) => features.reduce((s, f) => s + (f[k] ?? 0), 0) / features.length;
  const energy = avg('energy'), valence = avg('valence'), dance = avg('danceability');
  const instru = avg('instrumentalness'), acoustic = avg('acousticness');

  if (energy > 0.75)                          return { label: 'Peak Energy',    emoji: '🔥', description: 'Intense, workout-ready' };
  if (valence > 0.65 && dance > 0.62)         return { label: 'Feel Good',      emoji: '😊', description: 'Upbeat and danceable'   };
  if (instru > 0.4)                           return { label: 'Focus Mode',     emoji: '📚', description: 'Great for deep work'    };
  if (acoustic > 0.55)                        return { label: 'Acoustic Soul',  emoji: '🎸', description: 'Warm organic sounds'    };
  if (energy < 0.42)                          return { label: 'Chill Zone',     emoji: '😌', description: 'Low energy, relaxing'   };
  if (dance > 0.74)                           return { label: 'Hype Beast',     emoji: '⚡', description: 'Maximum danceability'   };
  return                                             { label: 'Mixed Vibes',    emoji: '🌀', description: 'Balanced mood mix'      };
}

// ── Main component ─────────────────────────────────────────────────────────────
export function DashboardClient({
  firstName, topTracks, topArtists, accessToken, spotifyError,
}: DashboardClientProps) {


  const [tab, setTab]               = useState<Tab>('overview');
  const [playingUri, setPlayingUri] = useState<string | null>(null);
  const [rightOpen, setRightOpen]   = useState(true);
  const [showAllTracks, setShowAllTracks]   = useState(false);
  const [showAllArtists, setShowAllArtists] = useState(false);

  // ── Ambient glow + player controls ────────────────────────────────────────
  const [ambientColor, setAmbientColor]   = useState<string | null>(null);
  const [nowPlaying, setNowPlaying]       = useState<NowPlayingInfo | null>(null);
  const playerControlsRef = useRef<PlayerControls | null>(null);

  // ── Shortcuts modal ────────────────────────────────────────────────────────
  const [showShortcuts, setShowShortcuts] = useState(false);

  // ── Taste DNA (overview) ───────────────────────────────────────────────────
  const [dnaFeatures, setDnaFeatures] = useState<AudioFeatureSet | null>(null);
  const [dnaLoading, setDnaLoading]   = useState(false);

  // ── Playlist health ────────────────────────────────────────────────────────
  const [playlistHealth, setPlaylistHealth] = useState<ReturnType<typeof computePlaylistHealth>>(null);
  const [healthLoading, setHealthLoading]   = useState(false);

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
    if (activeId) { setPlaylistHealth(null); fetchTracks(activeId); }
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

  const deletePlaylist = async (id: string) => {
    const r = await fetch(`/api/spotify/playlists/${id}`, { method: 'DELETE' });
    if (r.ok || r.status === 204) {
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      if (activeId === id) { setActiveId(null); setTracks([]); }
    }
  };

  const downloadAsCSV = () => {
    if (!activePlaylist || !tracks.length) return;
    const header = ['Track', 'Artist', 'Album', 'Duration'];
    const rows = tracks.map((t) => [
      t.trackName   ?? '',
      t.artistName  ?? '',
      t.albumName   ?? '',
      t.durationMs  ? formatDuration(t.durationMs) : '',
    ].map((v) => `"${v.replace(/"/g, '""')}"`).join(','));
    const csv  = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${activePlaylist.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Taste DNA effect ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!topTracks.length) return;
    setDnaLoading(true);
    const ids = topTracks.map((t) => t.id).slice(0, 20).join(',');
    fetch(`/api/spotify/audio-features?ids=${ids}`)
      .then((r) => r.json())
      .then((d) => {
        const valid = (d.audio_features ?? []).filter(Boolean) as AudioFeatureSet[];
        if (!valid.length) return;
        const avgF = (k: keyof AudioFeatureSet) =>
          valid.reduce((s, f) => s + f[k], 0) / valid.length;
        setDnaFeatures({
          energy:           avgF('energy'),
          danceability:     avgF('danceability'),
          valence:          avgF('valence'),
          acousticness:     avgF('acousticness'),
          instrumentalness: avgF('instrumentalness'),
          speechiness:      avgF('speechiness'),
        });
      })
      .catch(() => {})
      .finally(() => setDnaLoading(false));
  }, [topTracks]);

  // ── Genre data from topArtists ────────────────────────────────────────────
  const genreData = useMemo<GenreEntry[]>(() => {
    const counts: Record<string, number> = {};
    topArtists.forEach((a) => a.genres?.forEach((g) => { counts[g] = (counts[g] ?? 0) + 1; }));
    const total = Object.values(counts).reduce((s, c) => s + c, 0);
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({ name, count, pct: count / total }));
  }, [topArtists]);

  // ── Playlist health effect ────────────────────────────────────────────────
  useEffect(() => {
    if (!tracks.length) { setPlaylistHealth(null); return; }
    const ids = tracks.map((t) => t.spotifyTrackId).filter(Boolean).slice(0, 50).join(',');
    if (!ids) return;
    setHealthLoading(true);
    fetch(`/api/spotify/audio-features?ids=${ids}`)
      .then((r) => r.json())
      .then((d) => {
        const valid = (d.audio_features ?? []).filter(Boolean) as RawAudioFeature[];
        setPlaylistHealth(computePlaylistHealth(valid));
      })
      .catch(() => {})
      .finally(() => setHealthLoading(false));
  }, [tracks]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const inInput = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement).isContentEditable;

      if (e.key === 'Escape') { setShowShortcuts(false); return; }
      if (e.key === '?') { e.preventDefault(); setShowShortcuts((v) => !v); return; }

      if (inInput) return;

      if (e.key === ' ') { e.preventDefault(); playerControlsRef.current?.toggle(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); playerControlsRef.current?.next(); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); playerControlsRef.current?.prev(); return; }
      if (e.key === 'k' || e.key === 'K') { e.preventDefault(); searchInputRef.current?.focus(); setTab('search'); return; }
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setRightOpen((o) => !o); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── playTrack helper ──────────────────────────────────────────────────────
  const playTrack = useCallback((uri: string | null | undefined) => {
    if (!uri) return;
    setPlayingUri(uri);
    setRightOpen(true);
  }, []);

  const playAll = useCallback(() => {
    const first = tracks.find((t) => t.spotifyUri);
    if (!first?.spotifyUri) return;
    playTrack(first.spotifyUri);
  }, [tracks, playTrack]);

  const shufflePlay = useCallback(() => {
    const withUri = tracks.filter((t) => t.spotifyUri);
    if (!withUri.length) return;
    const pick = withUri[Math.floor(Math.random() * withUri.length)];
    playTrack(pick.spotifyUri);
  }, [tracks, playTrack]);

  const activePlaylist = playlists.find((p) => p.id === activeId);
  const searchTracks   = results?.tracks?.items  ?? [];
  const searchArtists  = results?.artists?.items ?? [];
  const searched       = debouncedQuery.trim().length >= 2;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#070707] overflow-hidden">
      {/* Ambient glow — driven by playing track colour */}
      <AmbientGlow rgb={ambientColor} />

      {/* ── Left Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-[76px] flex flex-col items-center py-4 gap-1 border-r border-white/[0.05] bg-[#090909] shrink-0">

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
          className="flex flex-col items-center gap-1.5 py-1 w-full group"
        >
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-red-400/70 group-hover:bg-white/[0.03] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <IcoLogOut />
          </div>
          <span className="text-[9px] font-medium tracking-wide text-white/15 group-hover:text-red-400/50 transition-colors duration-300">
            Sign out
          </span>
        </a>

        {/* Settings */}
        <button
          type="button"
          title="Settings"
          className="flex flex-col items-center gap-1.5 py-1 w-full group"
        >
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-white/50 group-hover:bg-white/[0.03] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <IcoSettings />
          </div>
          <span className="text-[9px] font-medium tracking-wide text-white/15 group-hover:text-white/35 transition-colors duration-300">
            Settings
          </span>
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

          {/* Keyboard shortcuts trigger */}
          <button
            type="button"
            title="Keyboard shortcuts"
            onClick={() => setShowShortcuts(true)}
            className="w-7 h-7 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/25 hover:text-white/55 hover:bg-white/[0.05] transition-all duration-300 text-[11px] font-mono"
          >
            ?
          </button>

          {/* Avatar — double-bezel */}
          <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.06] rounded-full shrink-0">
            <div className="w-7 h-7 rounded-full bg-[#0C0C0C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] flex items-center justify-center text-[10px] font-bold text-white/50">
              {firstName[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── Scrollable content ────────────────────────────────────────────── */}
        <div
          className={`
            flex-1 overflow-y-auto
            transition-[padding] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${rightOpen ? 'pr-[296px]' : 'pr-0'}
          `}
        >

          {/* ── Overview ──────────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="px-6 py-10 space-y-10 max-w-5xl">

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
                  {/* Header row with See all */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full shrink-0">
                      <div className="px-2.5 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <span className="text-[9px] font-bold tracking-[0.28em] text-[#FF5500]/60 uppercase whitespace-nowrap">Top Tracks</span>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                    <span className="text-[10px] text-white/20 shrink-0">Last 4 weeks</span>
                    <button
                      type="button"
                      onClick={() => setShowAllTracks((v) => !v)}
                      className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-[#FF5500]/60 hover:text-[#FF5500] transition-colors duration-300"
                    >
                      {showAllTracks ? 'Show less' : 'See all'}
                      <svg
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        className={`transition-transform duration-300 ${showAllTracks ? '-rotate-90' : 'rotate-90'}`}
                      >
                        <path d="M3 2l4 3-4 3" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-[2rem]">
                    <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                        {(showAllTracks ? topTracks : topTracks.slice(0, 4)).map((track, i) => {
                          const image   = track.album.images[1]?.url ?? track.album.images[0]?.url;
                          const artists = track.artists.map((a) => a.name).join(', ');
                          return (
                            <div
                              key={track.id}
                              onClick={() => playTrack(track.uri)}
                              className="flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer group hover:bg-white/[0.04] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                            >
                              <span className="text-[11px] font-mono text-white/20 w-4 text-center shrink-0 tabular-nums select-none">{i + 1}</span>
                              <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.06] rounded-xl shrink-0">
                                <div className="w-11 h-11 rounded-[calc(0.75rem-1.5px)] overflow-hidden bg-[#111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] relative">
                                  {image && <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />}
                                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                    <div className="w-6 h-6 rounded-full bg-[#FF5500] flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.5)]">
                                      <svg viewBox="0 0 8 8" className="w-2 h-2 fill-white translate-x-[0.5px]"><polygon points="1,0 7,4 1,8" /></svg>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white/75 truncate leading-tight group-hover:text-white transition-colors duration-300">{track.name}</p>
                                <p className="text-xs text-white/28 truncate mt-0.5">{artists}</p>
                              </div>
                              <span className="text-[10px] font-mono text-white/18 shrink-0 tabular-nums">{formatDuration(track.duration_ms)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Collapsed footer hint */}
                      {!showAllTracks && topTracks.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setShowAllTracks(true)}
                          className="w-full mt-1 py-2.5 text-[11px] font-medium text-white/20 hover:text-[#FF5500]/70 border-t border-white/[0.04] transition-colors duration-300 flex items-center justify-center gap-1.5"
                        >
                          +{topTracks.length - 4} more tracks
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 2v6M2 5l3 3 3-3" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Top artists */}
              {topArtists.length > 0 && (
                <section>
                  {/* Header row with See all */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full shrink-0">
                      <div className="px-2.5 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <span className="text-[9px] font-bold tracking-[0.28em] text-[#FF5500]/60 uppercase whitespace-nowrap">Top Artists</span>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                    <span className="text-[10px] text-white/20 shrink-0">Last 6 months</span>
                    <button
                      type="button"
                      onClick={() => setShowAllArtists((v) => !v)}
                      className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-[#FF5500]/60 hover:text-[#FF5500] transition-colors duration-300"
                    >
                      {showAllArtists ? 'Show less' : 'See all'}
                      <svg
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        className={`transition-transform duration-300 ${showAllArtists ? '-rotate-90' : 'rotate-90'}`}
                      >
                        <path d="M3 2l4 3-4 3" />
                      </svg>
                    </button>
                  </div>

                  {/* Bento preview — top 3 in equal-height row */}
                  {!showAllArtists && (
                    <div className="grid grid-cols-3 gap-3">
                      {topArtists.slice(0, 3).map((artist, i) => (
                        <ArtistCard
                          key={artist.id}
                          artist={artist}
                          rank={i + 1}
                          onPlay={(name) => { setQuery(name); setTab('search'); }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Expanded grid — all artists */}
                  {showAllArtists && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {topArtists.map((artist, i) => (
                        <ArtistCard
                          key={artist.id}
                          artist={artist}
                          rank={i + 1}
                          onPlay={(name) => { setQuery(name); setTab('search'); }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Taste DNA */}
              {(dnaFeatures || dnaLoading) && (
                <section>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full shrink-0">
                      <div className="px-2.5 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                        <span className="text-[9px] font-bold tracking-[0.28em] text-[#FF5500]/60 uppercase whitespace-nowrap">Taste DNA</span>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                    <span className="text-[10px] text-white/20 shrink-0">Your sonic fingerprint</span>
                  </div>
                  <TasteDNACard features={dnaFeatures} genres={genreData} loading={dnaLoading} />
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
            <div className="px-6 py-10 max-w-5xl">
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
                              <TrackRow key={t.id} track={t} onPlay={playTrack} />
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
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 p-2">
                            {searchArtists.map((a, i) => (
                              <ArtistCard key={a.id} artist={a} rank={i + 1} onPlay={(name) => setQuery(name)} />
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
            <div className="px-6 py-10 max-w-5xl">
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
                    : playlists.length === 0 && !showCreate
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
                        <div
                          key={pl.id}
                          className={`
                            group flex items-center gap-1 rounded-2xl
                            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                            ${activeId === pl.id
                              ? 'bg-[#FF5500]/8 border border-[#FF5500]/18 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                              : 'border border-transparent hover:bg-white/[0.03]'
                            }
                          `}
                        >
                          {/* Name / select button */}
                          <button
                            type="button"
                            onClick={() => setActiveId(pl.id)}
                            className="flex-1 min-w-0 text-left px-3.5 py-3"
                          >
                            <p className={`text-sm font-medium truncate ${activeId === pl.id ? 'text-white' : 'text-white/55'}`}>{pl.name}</p>
                            {pl.description && <p className="text-xs text-white/25 truncate mt-0.5">{pl.description}</p>}
                          </button>

                          {/* Delete button — appears on hover */}
                          <button
                            type="button"
                            title="Delete playlist"
                            aria-label={`Delete ${pl.name}`}
                            onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
                            className="
                              shrink-0 mr-2 w-6 h-6 rounded-full
                              flex items-center justify-center
                              text-white/15 hover:text-red-400/80 hover:bg-red-500/[0.08]
                              opacity-0 group-hover:opacity-100
                              active:scale-90
                              transition-all duration-300
                            "
                          >
                            <IcoTrash />
                          </button>
                        </div>
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
                            {playlistHealth && (
                              <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full w-fit mt-2">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                  <span className="text-sm">{playlistHealth.emoji}</span>
                                  <span className="text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase">{playlistHealth.label}</span>
                                  <span className="text-[9px] text-white/25 hidden sm:inline">— {playlistHealth.description}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Export playlist as CSV */}
                          <button
                            type="button"
                            onClick={downloadAsCSV}
                            disabled={tracks.length === 0}
                            className="group shrink-0 flex items-center gap-0 pl-3.5 pr-1 py-1 bg-[#FF5500]/90 text-white text-xs font-semibold rounded-full hover:bg-[#FF5500] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                          >
                            Export Playlist
                            <span className="ml-2 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-500">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </span>
                          </button>
                        </div>

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

                    {/* Play controls */}
                    {tracks.length > 0 && (
                      <div className="flex items-center gap-2">
                        {/* Play All */}
                        <button
                          type="button"
                          onClick={playAll}
                          className="
                            group flex items-center gap-2 pl-3 pr-4 py-2 rounded-full
                            bg-[#FF5500] hover:bg-[#FF6820] active:scale-[0.97]
                            text-white text-xs font-semibold
                            shadow-[0_4px_16px_rgba(255,85,0,0.25)]
                            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                          "
                        >
                          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <svg viewBox="0 0 8 8" className="w-2 h-2 fill-white translate-x-[0.5px]"><polygon points="1,0 7,4 1,8" /></svg>
                          </span>
                          Play All
                        </button>
                        {/* Shuffle */}
                        <button
                          type="button"
                          onClick={shufflePlay}
                          className="
                            group flex items-center gap-2 pl-3 pr-4 py-2 rounded-full
                            bg-white/[0.05] hover:bg-white/[0.09] active:scale-[0.97]
                            border border-white/[0.07] hover:border-white/[0.14]
                            text-white/50 hover:text-white/80 text-xs font-medium
                            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                          "
                        >
                          <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            {/* Shuffle icon */}
                            <svg viewBox="0 0 16 16" className="w-3 h-3 fill-none stroke-current" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 4h2.5a4 4 0 0 1 3.2 1.6L9 7" />
                              <path d="M14 4h-2.5a4 4 0 0 0-3.2 1.6l-2.6 3.2A4 4 0 0 1 2.5 12H2" />
                              <path d="M11.5 2 14 4l-2.5 2M11.5 10 14 12l-2.5 2" />
                              <path d="M9 9l.3.4A4 4 0 0 0 12.5 11H14" />
                            </svg>
                          </span>
                          Shuffle
                        </button>
                        <span className="ml-auto text-[10px] text-white/20 tabular-nums">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
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
                                onClick={() => playTrack(track.spotifyUri)}
                              >
                                {/* Track number / play icon */}
                                <div className="w-4 shrink-0 flex items-center justify-center">
                                  <span className="text-[10px] font-mono text-white/20 group-hover:hidden">{i + 1}</span>
                                  <svg viewBox="0 0 8 8" className="hidden group-hover:block w-2.5 h-2.5 fill-[#FF5500] translate-x-[0.5px]"><polygon points="1,0 7,4 1,8" /></svg>
                                </div>
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

      {/* Shortcuts modal */}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {/* ── Floating Player Panel ────────────────────────────────────────────── */}

      {/* ── Now-Playing FAB pill ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setRightOpen(true)}
        title="Open player"
        aria-label="Open player"
        className={`
          fixed bottom-6 right-6 z-[35] group
          flex items-center gap-3
          pl-[5px] pr-5 py-[5px]
          rounded-full
          bg-[#0E0E0E] border border-white/[0.09]
          shadow-[0_0_0_1px_rgba(255,85,0,0.15),0_8px_40px_rgba(0,0,0,0.7),0_0_32px_rgba(255,85,0,0.12)]
          hover:shadow-[0_0_0_1px_rgba(255,85,0,0.35),0_8px_40px_rgba(0,0,0,0.7),0_0_48px_rgba(255,85,0,0.2)]
          active:scale-[0.97]
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${rightOpen ? 'opacity-0 pointer-events-none translate-y-3 scale-90' : 'opacity-100 pointer-events-auto translate-y-0 scale-100'}
        `}
      >
        {/* Album art or headphone icon */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#FF5500]/20 flex items-center justify-center">
          {nowPlaying?.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={nowPlaying.albumArt} alt="album art" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#FF5500]"><IcoHeadphones /></span>
          )}
          {/* Pulsing ring when playing */}
          {nowPlaying && !nowPlaying.paused && (
            <span className="absolute inset-0 rounded-full border-2 border-[#FF5500]/60 animate-ping" />
          )}
        </div>

        {/* Track info */}
        <div className="flex flex-col items-start leading-none min-w-0 max-w-[140px]">
          {nowPlaying ? (
            <>
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#FF5500] font-medium mb-[3px]">
                {nowPlaying.paused ? 'Paused' : 'Now Playing'}
              </span>
              <span className="text-[13px] font-semibold text-white truncate w-full">{nowPlaying.name}</span>
              <span className="text-[11px] text-white/40 truncate w-full mt-[1px]">{nowPlaying.artist}</span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-medium mb-[3px]">Player</span>
              <span className="text-[13px] font-semibold text-white/60">Open player</span>
            </>
          )}
        </div>

        {/* Mini live soundwave bars when playing */}
        {nowPlaying && !nowPlaying.paused && (
          <div className="flex items-end gap-[2px] h-4 ml-1 flex-shrink-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="w-[2px] rounded-full bg-[#FF5500] fab-bar" />
            ))}
          </div>
        )}
      </button>

      {/* Floating glass panel */}
      <div
        className={`
          fixed top-[calc(56px+2rem)] right-4 bottom-4 z-30 w-[280px]
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${rightOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-[calc(100%+1rem)] opacity-0 pointer-events-none'}
        `}
      >
        {/* Outer double-bezel shell — glass card */}
        <div className="
          h-full flex flex-col
          p-[1.5px] bg-white/[0.04] border border-white/[0.08] rounded-[2rem]
          shadow-[0_8px_64px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)]
          backdrop-blur-2xl
        ">
          <div className="
            flex-1 flex flex-col bg-[#0C0C0C]/95 rounded-[calc(2rem-1.5px)]
            shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)]
            overflow-hidden
          ">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-white/[0.05] shrink-0">
              <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#0A0A0A] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]/60 animate-pulse-dot" />
                  <span className="text-[9px] font-semibold tracking-[0.28em] text-[#FF5500]/50 uppercase">Now Playing</span>
                </div>
              </div>
              {/* Close button */}
              <button
                type="button"
                title="Hide player"
                aria-label="Hide player"
                onClick={() => setRightOpen(false)}
                className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-all duration-300"
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
                </svg>
              </button>
            </div>

            {/* Player content — scrollable */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <SpotifyWebPlayer
                accessToken={accessToken}
                trackUri={playingUri}
                onColorChange={setAmbientColor}
                onTrackChange={setNowPlaying}
                controlsRef={playerControlsRef}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
