import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: text('username').unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  spotifyId: text('spotify_id'),
  spotifyAccessToken: text('spotify_access_token'),
  spotifyRefreshToken: text('spotify_refresh_token'),
  spotifyTokenExpiresAt: timestamp('spotify_token_expires_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const playlists = pgTable('playlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  spotifyPlaylistId: text('spotify_playlist_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const playlistTracks = pgTable('playlist_tracks', {
  id: uuid('id').defaultRandom().primaryKey(),
  playlistId: uuid('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  spotifyTrackId: text('spotify_track_id').notNull(),
  trackName: text('track_name'),
  artistName: text('artist_name'),
  albumName: text('album_name'),
  albumImageUrl: text('album_image_url'),
  durationMs: text('duration_ms'),
  spotifyUri: text('spotify_uri'),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
});
