'use client';

import React, { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react';

// ── Spotify SDK types ─────────────────────────────────────────────────────────
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
  addListener(event: string, cb: (arg: unknown) => void): void;
  connect(): Promise<boolean>;
  disconnect(): void;
  togglePlay(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  seek(ms: number): Promise<void>;
  setVolume(vol: number): Promise<void>;
  getCurrentState(): Promise<SpotifyPlayerState | null>;
}

interface SpotifyPlayerState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: {
      id: string;
      name: string;
      uri: string;
      duration_ms: number;
      album: { name: string; images: { url: string }[] };
      artists: { name: string }[];
    };
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatMs(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Waveform data ─────────────────────────────────────────────────────────────
// Per-bar values are static — stored as CSSProperties objects set via
// element.style in the WaveformBar component to avoid JSX style={}.
const BAR_HEIGHTS   = [38, 62, 44, 80, 32, 72, 54, 90, 40, 68, 50, 84, 36, 74, 48, 88, 34, 66, 56, 78, 42, 70, 46, 82];
const BAR_DURATIONS = [0.75, 1.05, 0.88, 1.25, 0.68, 1.12, 0.95, 1.35];
const BAR_DELAYS    = [0, 0.28, 0.12, 0.44, 0.06, 0.38, 0.20, 0.52];

// Pre-compute static CSS property objects once (not in JSX render path)
const BAR_STYLES: CSSProperties[] = BAR_HEIGHTS.map((h, i) => ({
  height:            `${h}%`,
  animationDuration: `${BAR_DURATIONS[i % BAR_DURATIONS.length]}s`,
  animationDelay:    `${BAR_DELAYS[i % BAR_DELAYS.length]}s`,
  opacity:           0.18 + (h / 90) * 0.72,
}));

// WaveformBar writes its static style via DOM ref — no JSX style={} needed
function WaveformBar({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = BAR_STYLES[index];
    el.style.height            = s.height as string;
    el.style.animationDuration = s.animationDuration as string;
    el.style.animationDelay    = s.animationDelay as string;
    el.style.opacity           = String(s.opacity);
  // Static values — only needs to run once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={ref} className="player-waveform-bar bg-[#FF5500] w-[2.5px]" />;
}

// ── Ultra-thin custom icons ───────────────────────────────────────────────────
function IcoPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="6,3 21,12 6,21" />
    </svg>
  );
}
function IcoPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="5"  y="3" width="4" height="18" rx="1.5" />
      <rect x="15" y="3" width="4" height="18" rx="1.5" />
    </svg>
  );
}
function IcoSkipBack() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="19,20 9,12 19,4" />
      <line x1="5" y1="19" x2="5" y2="5" />
    </svg>
  );
}
function IcoSkipFwd() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5,4 15,12 5,20" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}
function IcoVolume() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
function IcoMuted() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

// ── Custom slider (transparent overlay pattern) ───────────────────────────────
// Visible UI is pure CSS. An invisible <input type="range"> sits on top for
// pointer/touch interaction. Dynamic fill position is written via DOM
// style.setProperty (not JSX style={}) to satisfy the no-inline-styles rule.
function PlayerSlider({
  min,
  max,
  value,
  step,
  onChange,
  label,
  showThumb = true,
}: {
  min: number;
  max: number;
  value: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  showThumb?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Write --slider-pct directly onto the DOM element — avoids JSX style={}
  useEffect(() => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    trackRef.current?.style.setProperty('--slider-pct', `${pct}%`);
  }, [value, max]);

  return (
    <div className="relative group h-5 flex items-center">
      {/* Track shell — inset groove */}
      <div
        ref={trackRef}
        className="
          relative w-full h-[5px] rounded-full
          bg-[#060606]
          shadow-[inset_0_1px_3px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(0,0,0,0.6)]
        "
      >
        {/* Filled portion — reads --slider-pct from parent ref */}
        <div className="slider-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#E84800] to-[#FF6A2A] shadow-[0_0_8px_rgba(255,85,0,0.35)]" />

        {/* Glowing thumb — visible on hover */}
        {showThumb && (
          <div className="
            slider-thumb-pos
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-[13px] h-[13px] rounded-full bg-white
            shadow-[0_0_0_2.5px_rgba(255,85,0,0.35),0_2px_10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.9)]
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            pointer-events-none
          " />
        )}
      </div>

      {/* Invisible native input — captures all pointer/touch events */}
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="slider-raw"
      />
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface PlayerControls {
  toggle: () => void;
  next: () => void;
  prev: () => void;
}

export interface NowPlayingInfo {
  name: string;
  artist: string;
  albumArt: string | null;
  paused: boolean;
}

interface SpotifyWebPlayerProps {
  accessToken: string;
  trackUri?: string | null;
  onColorChange?: (rgb: string | null) => void;
  onTrackChange?: (info: NowPlayingInfo | null) => void;
  controlsRef?: React.MutableRefObject<PlayerControls | null>;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SpotifyWebPlayer({ accessToken: initialToken, trackUri, onColorChange, onTrackChange, controlsRef }: SpotifyWebPlayerProps) {
  const playerRef    = useRef<SpotifyPlayer | null>(null);
  const deviceIdRef  = useRef<string | null>(null);
  // Keep a mutable ref to the latest access token so SDK callbacks always have a fresh one
  const tokenRef     = useRef<string>(initialToken);

  const [ready, setReady]       = useState(false);
  const [state, setState]       = useState<SpotifyPlayerState | null>(null);
  const [volume, setVolume]     = useState(0.6);
  const [muted, setMuted]       = useState(false);
  const [position, setPosition] = useState(0);
  const [error, setError]       = useState<string | null>(null);
  const prevUriRef = useRef<string | null>(null);

  // ── Always use a fresh token from the server ──────────────────────────────
  const getFreshToken = useCallback(async (): Promise<string> => {
    try {
      const res = await fetch('/api/spotify/token');
      if (res.ok) {
        const data = await res.json() as { token: string };
        tokenRef.current = data.token;
        return data.token;
      }
    } catch { /* fall through to cached token */ }
    return tokenRef.current;
  }, []);

  // ── Transfer playback ─────────────────────────────────────────────────────
  const transferPlayback = useCallback(async (deviceId: string, shouldPlay = false) => {
    const token = await getFreshToken();
    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [deviceId], play: shouldPlay }),
    });
  }, [getFreshToken]);

  // ── Play URI ──────────────────────────────────────────────────────────────
  const playUri = useCallback(async (uri: string, deviceId: string) => {
    const token = await getFreshToken();
    const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [uri] }),
    });
    if (!res.ok && res.status !== 204) {
      const body = await res.text();
      console.error(`[SpotifyWebPlayer] playUri failed ${res.status}:`, body);
    }
  }, [getFreshToken]);

  // ── SDK init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initPlayer = () => {
      const player = new window.Spotify.Player({
        name: 'Sonara Web Player',
        getOAuthToken: (cb) => { getFreshToken().then(cb); },
        volume,
      });
      player.addListener('ready', (data) => {
        const { device_id } = data as { device_id: string };
        deviceIdRef.current = device_id;
        transferPlayback(device_id, false);
        setReady(true);
      });
      player.addListener('not_ready', () => setReady(false));
      player.addListener('player_state_changed', (s) => {
        if (!s) return;
        setState(s as SpotifyPlayerState);
        setPosition((s as SpotifyPlayerState).position);
      });
      player.addListener('initialization_error', () => setError('Could not initialise the Spotify player.'));
      player.addListener('authentication_error',  () => setError('Spotify authentication failed. Try signing out and back in.'));
      player.addListener('account_error',         () => setError('Spotify Premium is required for in-browser playback.'));
      player.connect();
      playerRef.current = player;
      if (controlsRef) {
        controlsRef.current = {
          toggle: () => playerRef.current?.togglePlay(),
          next:   () => playerRef.current?.nextTrack(),
          prev:   () => playerRef.current?.previousTrack(),
        };
      }
    };
    if (window.Spotify) { initPlayer(); }
    else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }
    return () => { playerRef.current?.disconnect(); if (controlsRef) controlsRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-play on URI change ───────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !trackUri || !deviceIdRef.current) return;
    if (trackUri === prevUriRef.current) return;
    prevUriRef.current = trackUri;
    playUri(trackUri, deviceIdRef.current);
  }, [trackUri, ready, playUri]);

  // ── Position ticker ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!state || state.paused) return;
    const id = setInterval(() => setPosition((p) => Math.min(p + 1000, state.duration)), 1000);
    return () => clearInterval(id);
  }, [state]);

  // ── Volume handlers ───────────────────────────────────────────────────────
  const handleVolume = async (v: number) => {
    setVolume(v);
    setMuted(v === 0);
    await playerRef.current?.setVolume(v);
  };
  const toggleMute = async () => {
    const next = muted ? (volume || 0.6) : 0;
    setMuted(!muted);
    await playerRef.current?.setVolume(next);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const track    = state?.track_window?.current_track ?? null;
  const paused   = state?.paused ?? true;
  const duration = state?.duration ?? 0;

  // ── Ambient colour extraction ─────────────────────────────────────────────
  useEffect(() => {
    const url = track?.album.images[0]?.url;
    if (!url || !onColorChange) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 4; canvas.height = 4;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 4, 4);
      let r = 0, g = 0, b = 0;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          r += d[0]; g += d[1]; b += d[2];
        }
      }
      onColorChange(`${Math.round(r / 16)},${Math.round(g / 16)},${Math.round(b / 16)}`);
    };
    img.onerror = () => onColorChange(null);
    img.src = url;
  }, [track?.album.images[0]?.url, onColorChange]);

  // ── Notify parent of now-playing state ────────────────────────────────────
  useEffect(() => {
    if (!onTrackChange) return;
    if (!track) { onTrackChange(null); return; }
    onTrackChange({
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      albumArt: track.album.images[0]?.url ?? null,
      paused: paused,
    });
  }, [track?.name, paused, onTrackChange]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mt-4 p-[1.5px] bg-red-500/[0.06] border border-red-500/15 rounded-2xl">
          <div className="px-4 py-3 bg-[#0C0C0C] rounded-[calc(1rem-1.5px)] text-xs text-red-400/80 leading-relaxed">
            {error}
          </div>
        </div>
      )}

      {/* ── Connecting ─────────────────────────────────────────────────────── */}
      {!ready && !error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          {/* Spinner — double-bezel ring */}
          <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full">
            <div className="w-10 h-10 rounded-full bg-[#0A0A0A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-[1.5px] border-white/10 border-t-[#FF5500] animate-spin" />
            </div>
          </div>
          <p className="text-[10px] text-white/25 tracking-wider uppercase">Connecting…</p>
        </div>
      )}

      {/* ── Player UI ──────────────────────────────────────────────────────── */}
      {ready && (
        <div className="flex flex-col flex-1 px-5 py-5 gap-5">

          {/* ── Album art — double-bezel ──────────────────────────────────── */}
          <div className="flex justify-center">
            {track ? (
              <div className="p-2 bg-white/[0.025] border border-white/[0.06] rounded-[1.75rem] shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                <div className="relative w-[168px] h-[168px] rounded-[calc(1.75rem-0.5rem)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)]">
                  <img
                    src={track.album.images[0]?.url}
                    alt={track.album.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle playing shimmer overlay */}
                  {!paused && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
                  )}
                </div>
              </div>
            ) : (
              /* Empty state art */
              <div className="p-2 bg-white/[0.025] border border-white/[0.06] rounded-[1.75rem]">
                <div className="w-[168px] h-[168px] rounded-[calc(1.75rem-0.5rem)] bg-[#0C0C0C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] flex items-center justify-center">
                  <span className="text-4xl text-white/10 select-none">♪</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Waveform bars ─────────────────────────────────────────────── */}
          <div className={`flex items-end justify-center gap-[2.5px] h-8 ${!paused ? 'player-playing' : ''}`}>
            {BAR_HEIGHTS.map((_, i) => (
              <WaveformBar key={i} index={i} />
            ))}
          </div>

          {/* ── Track info ────────────────────────────────────────────────── */}
          <div className="text-center space-y-1 px-2">
            <p className="text-sm font-semibold text-white/90 tracking-tight truncate leading-tight">
              {track?.name ?? 'Nothing playing'}
            </p>
            <p className="text-[11px] text-white/35 truncate">
              {track
                ? track.artists.map((a) => a.name).join(', ')
                : 'Select a track from the dashboard'
              }
            </p>
          </div>

          {/* ── Progress ──────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <PlayerSlider
              min={0}
              max={duration || 100}
              value={position}
              onChange={async (ms) => {
                setPosition(ms);
                await playerRef.current?.seek(ms);
              }}
              label="Seek position"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/25 tabular-nums">
              <span>{formatMs(position)}</span>
              <span>{formatMs(duration)}</span>
            </div>
          </div>

          {/* ── Controls ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-6">

            {/* Skip back */}
            <button
              type="button"
              onClick={() => playerRef.current?.previousTrack()}
              aria-label="Previous track"
              className="
                text-white/30 hover:text-white/70
                active:scale-90
                transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
              "
            >
              <IcoSkipBack />
            </button>

            {/* Play / Pause — double-bezel */}
            <button
              type="button"
              onClick={() => playerRef.current?.togglePlay()}
              aria-label={paused ? 'Play' : 'Pause'}
              className="group active:scale-[0.93] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              {/* Outer shell */}
              <div className="p-[2px] bg-white/[0.04] border border-white/[0.08] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                {/* Inner core */}
                <div className="
                  w-12 h-12 rounded-full
                  bg-[#FF5500]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_20px_rgba(255,85,0,0.5)]
                  flex items-center justify-center text-white
                  group-hover:bg-[#FF6820]
                  transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                ">
                  <span className={paused ? 'translate-x-[1px]' : ''}>
                    {paused ? <IcoPlay /> : <IcoPause />}
                  </span>
                </div>
              </div>
            </button>

            {/* Skip forward */}
            <button
              type="button"
              onClick={() => playerRef.current?.nextTrack()}
              aria-label="Next track"
              className="
                text-white/30 hover:text-white/70
                active:scale-90
                transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
              "
            >
              <IcoSkipFwd />
            </button>
          </div>

          {/* ── Volume ────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pb-1">
            {/* Mute toggle */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="
                text-white/25 hover:text-white/60 shrink-0
                transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
              "
            >
              {muted ? <IcoMuted /> : <IcoVolume />}
            </button>

            {/* Volume slider — same inset-groove treatment as progress */}
            <div className="flex-1">
              <PlayerSlider
                min={0}
                max={1}
                step={0.02}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                label="Volume"
                showThumb={false}
              />
            </div>

            {/* Volume level badge */}
            <span className="text-[10px] font-mono text-white/20 w-7 text-right shrink-0 tabular-nums">
              {Math.round((muted ? 0 : volume) * 100)}
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
