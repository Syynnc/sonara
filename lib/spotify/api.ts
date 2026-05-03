import type { SpotifySearchResult, SpotifyTrack, SpotifyArtist } from './types';

const BASE = 'https://api.spotify.com/v1';

async function spotifyFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
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

export async function getClientCredentialsToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
    // Cache the CC token for ~55 minutes (tokens are valid for 1 hour)
    next: { revalidate: 3300 },
  });

  if (!res.ok) throw new Error('Failed to obtain Spotify client credentials token');
  const data = await res.json();
  return data.access_token as string;
}

// ── Search (uses CC token — no user required) ───────────────────────────────

export async function searchSpotify(
  query: string,
  token: string,
  types = 'track,artist',
  limit = 20,
): Promise<SpotifySearchResult> {
  return spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=${types}&limit=${limit}`,
    token,
  );
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
  spotifyUserId: string,
  name: string,
  description: string,
): Promise<{ id: string; external_urls: { spotify: string } }> {
  return spotifyFetch(`/users/${spotifyUserId}/playlists`, token, {
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
