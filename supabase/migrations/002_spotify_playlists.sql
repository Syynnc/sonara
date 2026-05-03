-- Extend profiles with Spotify token storage
alter table public.profiles
  add column if not exists spotify_id text,
  add column if not exists spotify_access_token text,
  add column if not exists spotify_refresh_token text,
  add column if not exists spotify_token_expires_at timestamptz;

-- Local playlists (built in Sonara, optionally exported to Spotify)
create table if not exists public.playlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  spotify_playlist_id text,          -- set after export
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.playlists enable row level security;

create policy "Users can manage own playlists"
  on public.playlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tracks stored inside each playlist
create table if not exists public.playlist_tracks (
  id               uuid primary key default gen_random_uuid(),
  playlist_id      uuid not null references public.playlists (id) on delete cascade,
  spotify_track_id text not null,
  track_name       text not null,
  artist_name      text not null,
  album_name       text not null,
  album_image_url  text,
  duration_ms      integer not null,
  spotify_uri      text not null,
  position         integer not null default 0,
  added_at         timestamptz default now()
);

alter table public.playlist_tracks enable row level security;

-- Users can only touch tracks that belong to their own playlists
create policy "Users can manage tracks in own playlists"
  on public.playlist_tracks for all
  using (
    exists (
      select 1 from public.playlists
      where playlists.id = playlist_tracks.playlist_id
        and playlists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.playlists
      where playlists.id = playlist_tracks.playlist_id
        and playlists.user_id = auth.uid()
    )
  );

-- Keep updated_at current on playlists
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger playlists_updated_at
  before update on public.playlists
  for each row execute procedure public.set_updated_at();
