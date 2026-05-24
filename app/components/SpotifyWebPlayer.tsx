'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

// ── Spotify SDK types ────────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatMs(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const BAR_HEIGHTS = [38, 62, 44, 80, 32, 72, 54, 90, 40, 68, 50, 84, 36, 74, 48, 88, 34, 66, 56, 78, 42, 70, 46, 82];
const BAR_DURATIONS = [0.75, 1.05, 0.88, 1.25, 0.68, 1.12, 0.95, 1.35];
const BAR_DELAYS    = [0, 0.28, 0.12, 0.44, 0.06, 0.38, 0.2, 0.52];

// ── Props ────────────────────────────────────────────────────────────────────
interface SpotifyWebPlayerProps {
  accessToken: string;
  /** Optional URI to play immediately once the player is ready */
  trackUri?: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────
export function SpotifyWebPlayer({ accessToken, trackUri }: SpotifyWebPlayerProps) {
  const playerRef   = useRef<SpotifyPlayer | null>(null);
  const deviceIdRef = useRef<string | null>(null);

  const [ready, setReady]         = useState(false);
  const [state, setState]         = useState<SpotifyPlayerState | null>(null);
  const [volume, setVolume]       = useState(0.6);
  const [muted, setMuted]         = useState(false);
  const [position, setPosition]   = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const prevUriRef = useRef<string | null>(null);

  // ── Transfer playback to this device ──────────────────────────────────────
  const transferPlayback = useCallback(async (deviceId: string, shouldPlay = false) => {
    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_ids: [deviceId], play: shouldPlay }),
    });
  }, [accessToken]);

  // ── Play a specific URI on this device ────────────────────────────────────
  const playUri = useCallback(async (uri: string, deviceId: string) => {
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [uri] }),
    });
  }, [accessToken]);

  // ── Load the Spotify Web Playback SDK script once ─────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initPlayer = () => {
      const player = new window.Spotify.Player({
        name: 'Sonara Web Player',
        getOAuthToken: (cb) => cb(accessToken),
        volume,
      });

      player.addListener('ready', (data) => {
        const { device_id } = data as { device_id: string };
        deviceIdRef.current = device_id;
        transferPlayback(device_id, false);
        setReady(true);
      });

      player.addListener('not_ready', () => {
        setReady(false);
      });

      player.addListener('player_state_changed', (s) => {
        if (!s) return;
        setState(s as SpotifyPlayerState);
        setPosition((s as SpotifyPlayerState).position);
      });

      player.addListener('initialization_error', () => {
        setError('Could not initialise the Spotify player.');
      });

      player.addListener('authentication_error', () => {
        setError('Spotify authentication failed. Try signing out and back in.');
      });

      player.addListener('account_error', () => {
        setError('Spotify Premium is required for in-browser playback.');
      });

      player.connect();
      playerRef.current = player;
    };

    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      playerRef.current?.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // ── Auto-play when trackUri prop changes ──────────────────────────────────
  useEffect(() => {
    if (!ready || !trackUri || !deviceIdRef.current) return;
    if (trackUri === prevUriRef.current) return;
    prevUriRef.current = trackUri;
    playUri(trackUri, deviceIdRef.current);
  }, [trackUri, ready, playUri]);

  // ── Position ticker ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!state || state.paused) return;
    const interval = setInterval(() => {
      setPosition((p) => Math.min(p + 1000, state.duration));
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // ── Volume ────────────────────────────────────────────────────────────────
  const handleVolume = async (v: number) => {
    setVolume(v);
    setMuted(v === 0);
    await playerRef.current?.setVolume(v);
  };

  const toggleMute = async () => {
    const next = muted ? volume || 0.6 : 0;
    setMuted(!muted);
    await playerRef.current?.setVolume(next);
  };

  // ── Seek ──────────────────────────────────────────────────────────────────
  const handleSeek = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ms = Number(e.target.value);
    setPosition(ms);
    await playerRef.current?.seek(ms);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const track   = state?.track_window?.current_track ?? null;
  const paused  = state?.paused ?? true;
  const duration = state?.duration ?? 0;
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 leading-relaxed">
          {error}
        </div>
      )}

      {/* Not-ready state */}
      {!ready && !error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF5500]/30 border-t-[#FF5500] animate-spin" />
          <p className="text-xs text-[#B3B3B3]/40">Connecting to Spotify…</p>
        </div>
      )}

      {/* Player UI */}
      {ready && (
        <div className="flex flex-col flex-1 gap-0">
          {/* Album art + waveform */}
          <div className="relative flex items-center justify-center py-8 px-6">
            {track ? (
              <div className="relative">
                <img
                  src={track.album.images[0]?.url}
                  alt={track.album.name}
                  className="w-36 h-36 rounded-2xl object-cover shadow-[0_20px_48px_rgba(0,0,0,0.6)]"
                />
                {/* Spinning vinyl effect when playing */}
                {!paused && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#FF5500]/20 animate-spin-slow pointer-events-none" />
                )}
              </div>
            ) : (
              <div className="w-36 h-36 rounded-2xl bg-[#242424] border border-[#282828] flex items-center justify-center">
                <span className="text-3xl text-[#B3B3B3]/20 font-mono">♪</span>
              </div>
            )}
          </div>

          {/* Waveform bars */}
          <div className="flex items-end justify-center gap-[2.5px] h-10 px-6 mb-2">
            {BAR_HEIGHTS.map((maxH, i) => (
              <div
                key={i}
                className="rounded-full bg-[#FF5500]"
                style={{
                  width: '2.5px',
                  height: `${maxH}%`,
                  transformOrigin: 'bottom',
                  animationName: 'bar-dance',
                  animationDuration: `${BAR_DURATIONS[i % BAR_DURATIONS.length]}s`,
                  animationDelay: `${BAR_DELAYS[i % BAR_DELAYS.length]}s`,
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationPlayState: !paused ? 'running' : 'paused',
                  opacity: 0.25 + (maxH / 90) * 0.65,
                }}
              />
            ))}
          </div>

          {/* Track info */}
          <div className="px-6 text-center mb-5">
            <p className="text-base font-bold text-[#FFFFFF] tracking-tight truncate leading-tight">
              {track?.name ?? 'Nothing playing'}
            </p>
            <p className="text-xs text-[#B3B3B3]/55 mt-1 truncate">
              {track ? track.artists.map((a) => a.name).join(', ') : 'Start a track from the dashboard'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="px-6 mb-4">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={position}
              onChange={handleSeek}
              className="w-full h-1 accent-[#FF5500] cursor-pointer"
              aria-label="Seek position"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#B3B3B3]/35 mt-1">
              <span>{formatMs(position)}</span>
              <span>{formatMs(duration)}</span>
            </div>
          </div>

          {/* Progress fill visual (decorative, behind input) */}
          <div className="relative mx-6 -mt-8 h-1 bg-[#282828] rounded-full pointer-events-none mb-4">
            <div
              className="absolute inset-y-0 left-0 bg-[#FF5500] rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-5 px-6 mb-5">
            <button
              type="button"
              onClick={() => playerRef.current?.previousTrack()}
              className="text-[#B3B3B3]/50 hover:text-[#FFFFFF] transition-colors active:scale-95"
              aria-label="Previous track"
            >
              <SkipBack size={20} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={() => playerRef.current?.togglePlay()}
              className="w-12 h-12 rounded-full bg-[#FF5500] flex items-center justify-center hover:bg-[#FF6820] transition-all duration-200 active:scale-95 shadow-[0_4px_20px_rgba(255,85,0,0.35)]"
              aria-label={paused ? 'Play' : 'Pause'}
            >
              {paused
                ? <Play size={18} fill="#fff" className="text-white translate-x-[1px]" />
                : <Pause size={18} fill="#fff" className="text-white" />
              }
            </button>

            <button
              type="button"
              onClick={() => playerRef.current?.nextTrack()}
              className="text-[#B3B3B3]/50 hover:text-[#FFFFFF] transition-colors active:scale-95"
              aria-label="Next track"
            >
              <SkipForward size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2.5 px-6 pb-6">
            <button
              type="button"
              onClick={toggleMute}
              className="text-[#B3B3B3]/40 hover:text-[#B3B3B3] transition-colors shrink-0"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX size={15} strokeWidth={1.5} /> : <Volume2 size={15} strokeWidth={1.5} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={muted ? 0 : volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="flex-1 h-0.5 accent-[#FF5500] cursor-pointer"
              aria-label="Volume"
            />
          </div>
        </div>
      )}
    </div>
  );
}
