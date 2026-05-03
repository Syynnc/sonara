export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyArtistSimple {
  id: string;
  name: string;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtistSimple[];
  album: SpotifyAlbum;
  duration_ms: number;
  preview_url: string | null;
  uri: string;
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  followers: { total: number };
  popularity: number;
  uri: string;
  external_urls: { spotify: string };
}

export interface SpotifySearchResult {
  tracks?: { items: SpotifyTrack[]; total: number };
  artists?: { items: SpotifyArtist[]; total: number };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  tracks: { total: number };
  external_urls: { spotify: string };
  uri: string;
}

// Local playlist stored in Supabase
export interface LocalPlaylist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  spotify_playlist_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalPlaylistTrack {
  id: string;
  playlist_id: string;
  spotify_track_id: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image_url: string | null;
  duration_ms: number;
  spotify_uri: string;
  position: number;
  added_at: string;
}
