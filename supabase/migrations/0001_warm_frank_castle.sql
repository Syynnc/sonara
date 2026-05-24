ALTER TABLE "playlist_tracks" ADD COLUMN "track_name" text;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD COLUMN "artist_name" text;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD COLUMN "album_name" text;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD COLUMN "album_image_url" text;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD COLUMN "duration_ms" integer;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD COLUMN "spotify_uri" text;