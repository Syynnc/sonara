import type { SpotifySearchResult, SpotifyTrack, SpotifyArtist } from './types';
import { httpsFetch } from '@/lib/supabase/https-fetch';

const BASE = 'https://api.spotify.com/v1';

async function spotifyFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const res = await httpsFetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (res.status === 401) throw new Error('SPOTIFY_UNAUTHORIZED');
  if (!res.ok) throw new Error(`Spotify ${res.status}: ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Client Credentials (server-only, no user required) ─────────────────────

/** Module-level cache — survives across requests within the same server process. */
let _ccCache: { token: string; expiresAt: number } | null = null;

export async function getClientCredentialsToken(): Promise<string> {
  // Return cached token if it is still valid for at least 60 s
  if (_ccCache && Date.now() < _ccCache.expiresAt - 60_000) {
    return _ccCache.token;
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await httpsFetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error('Failed to obtain Spotify client credentials token');
  const data = await res.json() as { access_token: string; expires_in: number };

  _ccCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return _ccCache.token;
}

// ── Search (uses CC token — no user required) ───────────────────────────────

export async function searchSpotify(
  query: string,
  token: string,
  types = 'track,artist',
  limit = 5,
): Promise<SpotifySearchResult> {
  return spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=${types}&limit=${limit}`,
    token,
  );
}

export async function refreshSpotifyToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await httpsFetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  });

  if (!res.ok) throw new Error('Failed to refresh Spotify token');
  return res.json();
}

// ── User endpoints (require OAuth user token) ───────────────────────────────

export async function getUserTopTracks(
  token: string,
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'short_term',
  limit = 20,
): Promise<{ items: SpotifyTrack[] }> {
  return spotifyFetch(
    `/me/top/tracks?limit=${limit}&time_range=${timeRange}`,
    token,
  );
}

export async function getUserTopArtists(
  token: string,
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit = 12,
): Promise<{ items: SpotifyArtist[] }> {
  return spotifyFetch(
    `/me/top/artists?limit=${limit}&time_range=${timeRange}`,
    token,
  );
}

export async function getSpotifyCurrentUser(
  token: string,
): Promise<{ id: string; display_name: string; images: { url: string }[] }> {
  return spotifyFetch('/me', token);
}

// ── Playlist operations (require OAuth user token) ──────────────────────────

export async function createSpotifyPlaylist(
  token: string,
  userId: string,
  name: string,
  description: string,
): Promise<{ id: string; external_urls: { spotify: string } }> {
  return spotifyFetch(`/users/${userId}/playlists`, token, {
    method: 'POST',
    body: JSON.stringify({ name, description, public: false }),
  });
}

export async function addTracksToSpotifyPlaylist(
  token: string,
  playlistId: string,
  uris: string[],
): Promise<void> {
  // Spotify max 100 tracks per request
  for (let i = 0; i < uris.length; i += 100) {
    await spotifyFetch(`/playlists/${playlistId}/tracks`, token, {
      method: 'POST',
      body: JSON.stringify({ uris: uris.slice(i, i + 100) }),
    });
  }
}
