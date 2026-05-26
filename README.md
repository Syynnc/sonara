# 🎵 Sonar — Music Discovery + Playlist Builder

Sonar is a personalized music discovery and playlist creation tool powered by the [Spotify Web API](https://developer.spotify.com/documentation/web-api). It allows users to discover new music, view their top artists or tracks, analyze their taste profile, and build/export playlists seamlessly.

---

## � Beta Access / How to Access

Because this application uses the Spotify API in **Development Mode**, login access is restricted by Spotify to approved users only. 

If you would like to test the site, you must be added to the whitelist. Please reach out to the developer with the email address linked to your Spotify account so you can be granted access to log in.

---

## �🚀 Features

- **Spotify Integration:** Connect your Spotify account securely.
- **Advanced Discovery:** Search for tracks and artists with personalized recommendations based on mood and audio features (e.g., danceability, valence).
- **Playlist Builder:** Create new playlists or modify existing ones and export them directly to your Spotify account.
- **Taste DNA:** Analyze your music taste profile with dynamic visual cards.
- **Modern Dashboard:** Built on an elegant, responsive UI.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Database & Auth:** [Supabase](https://supabase.com/) & [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Integrations:** [Spotify Web API](https://developer.spotify.com/documentation/web-api)

---

## ⚙️ Getting Started

### Prerequisites

1. **Node.js** (v18+ recommended)
2. A **[Supabase](https://supabase.com/)** project
3. A **[Spotify Developer Dashboard](https://developer.spotify.com/dashboard)** App

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sonar.git
   cd sonar
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or pnpm install / yarn install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your application secrets:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Spotify App Configuration
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/connect/callback
   ```

4. **Database Setup**
   Apply the database migrations to your Supabase project using Drizzle:
   ```bash
   npx drizzle-kit push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to start using Sonar.

---

## 📡 Internal API Routes

Sonar wraps the Spotify API with its own internal Next.js routes (`/app/api/`) to handle authentication securely and format data for the frontend:

| Route | Description |
|---|---|
| `GET /api/auth/callback` | Supabase OAuth callback handler. |
| `POST /api/auth/signout` | Signs the user out of the application securely. |
| `GET /api/spotify/connect` | Initiates the Spotify authorization flow. |
| `GET /api/spotify/connect/callback`| Handles the Spotify OAuth callback and securely saves tokens. |
| `GET /api/spotify/top` | Fetches the user's top artists or tracks. |
| `GET /api/spotify/search` | Performs a search against the Spotify catalog. |
| `GET /api/spotify/playlists/[id]` | Retrieves detailed information for a specific playlist. |
| `POST /api/spotify/playlists/export` | Exports a custom-built playlist directly to Spotify. |
| `GET /api/spotify/audio-features` | Retrieves audio features (energy, valence, etc.) for tracks. |

---

## 📖 Spotify API Reference

> Powered by the [Spotify Web API](https://developer.spotify.com/documentation/web-api). All endpoints require a valid Bearer token via OAuth 2.0.

---

## Authentication

All requests must include an `Authorization` header:

```
Authorization: Bearer {access_token}
```

| Flow | Use Case |
|---|---|
| Authorization Code | User-facing features (playlists, personalization) |
| Client Credentials | Public data only (search, catalog browsing) |

---

## Base URL

```
https://api.spotify.com/v1
```

---

## 🔍 Discover Music

Endpoints for surfacing personalized recommendations and trending content.

---

### Get Personalized Recommendations

Returns a list of recommended tracks based on seed artists, tracks, or genres.

```
GET /recommendations
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `seed_artists` | string | conditional | Comma-separated Spotify artist IDs (max 5 seeds total) |
| `seed_tracks` | string | conditional | Comma-separated Spotify track IDs (max 5 seeds total) |
| `seed_genres` | string | conditional | Comma-separated genre names (max 5 seeds total) |
| `limit` | integer | no | Number of results to return. Default: `20`. Max: `100` |
| `market` | string | no | ISO 3166-1 alpha-2 country code (e.g. `US`, `PH`) |
| `min_energy` | float | no | Minimum energy value `0.0–1.0` |
| `max_energy` | float | no | Maximum energy value `0.0–1.0` |
| `target_valence` | float | no | Target "happiness" of tracks `0.0–1.0` |
| `target_danceability` | float | no | Target danceability `0.0–1.0` |

> At least one of `seed_artists`, `seed_tracks`, or `seed_genres` is required. Combined seeds must not exceed 5.

**Example Request**

```http
GET /recommendations?seed_genres=indie,chill&target_valence=0.6&limit=10&market=US
Authorization: Bearer {access_token}
```

**Example Response**

```json
{
  "tracks": [
    {
      "id": "3n3Ppam7vgaVa1iaRUIOKE",
      "name": "Mr. Brightside",
      "artists": [{ "id": "0C0XlULifJtAgn6ZNCW2eu", "name": "The Killers" }],
      "album": {
        "name": "Hot Fuss",
        "images": [{ "url": "https://i.scdn.co/image/...", "width": 640, "height": 640 }]
      },
      "duration_ms": 222973,
      "preview_url": "https://p.scdn.co/mp3-preview/...",
      "external_urls": { "spotify": "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUIOKE" }
    }
  ],
  "seeds": [
    { "id": "indie", "type": "GENRE", "initialPoolSize": 500 }
  ]
}
```

---

### Get User's Top Artists

Returns the current user's top artists based on listening history.

```
GET /me/top/artists
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `time_range` | string | no | `short_term` (4 weeks), `medium_term` (6 months), `long_term` (all time). Default: `medium_term` |
| `limit` | integer | no | Number of results. Default: `20`. Max: `50` |
| `offset` | integer | no | Pagination offset. Default: `0` |

**Example Request**

```http
GET /me/top/artists?time_range=short_term&limit=5
Authorization: Bearer {access_token}
```

**Example Response**

```json
{
  "items": [
    {
      "id": "0C0XlULifJtAgn6ZNCW2eu",
      "name": "The Killers",
      "genres": ["indie rock", "new wave"],
      "popularity": 78,
      "followers": { "total": 9823412 },
      "images": [{ "url": "https://i.scdn.co/image/...", "width": 640, "height": 640 }]
    }
  ],
  "total": 50,
  "limit": 5,
  "offset": 0
}
```

---

### Get User's Top Tracks

Returns the current user's most-played tracks.

```
GET /me/top/tracks
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `time_range` | string | no | `short_term`, `medium_term`, or `long_term`. Default: `medium_term` |
| `limit` | integer | no | Default: `20`. Max: `50` |
| `offset` | integer | no | Default: `0` |

**Example Request**

```http
GET /me/top/tracks?time_range=long_term&limit=10
Authorization: Bearer {access_token}
```

---

### Get New Releases

Returns new album releases featured in a specific market.

```
GET /browse/new-releases
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `country` | string | no | ISO 3166-1 alpha-2 country code |
| `limit` | integer | no | Default: `20`. Max: `50` |
| `offset` | integer | no | Default: `0` |

**Example Request**

```http
GET /browse/new-releases?country=PH&limit=6
Authorization: Bearer {access_token}
```

---

### Get Featured Playlists

Returns Spotify-curated playlists for a given moment or locale.

```
GET /browse/featured-playlists
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `locale` | string | no | BCP 47 locale tag (e.g. `en_US`, `fil_PH`) |
| `country` | string | no | ISO 3166-1 alpha-2 country code |
| `timestamp` | string | no | ISO 8601 datetime — tailors results to time of day |
| `limit` | integer | no | Default: `20`. Max: `50` |

**Example Request**

```http
GET /browse/featured-playlists?country=US&timestamp=2025-04-19T08:00:00
Authorization: Bearer {access_token}
```

---

## 🔎 Search Songs

Endpoints for finding tracks, artists, albums, and playlists by keyword.

---

### Search Catalog

Search Spotify's catalog across multiple content types in one request.

```
GET /search
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | string | yes | Search query. Supports field filters: `artist:`, `album:`, `track:`, `year:`, `genre:` |
| `type` | string | yes | Comma-separated types: `track`, `artist`, `album`, `playlist`, `show`, `episode` |
| `market` | string | no | ISO 3166-1 alpha-2 country code |
| `limit` | integer | no | Default: `20`. Max: `50` |
| `offset` | integer | no | Default: `0` |
| `include_external` | string | no | Pass `audio` to include externally hosted audio |

**Search Query Syntax**

| Example | Description |
|---|---|
| `q=bohemian rhapsody` | Full-text keyword search |
| `q=artist:queen` | Filter by artist name |
| `q=artist:queen album:news of the world` | Compound field filter |
| `q=year:2020-2024 genre:lo-fi` | Date range + genre filter |
| `q=track:blinding lights artist:weeknd` | Exact track + artist |

**Example Request**

```http
GET /search?q=artist%3Atayor+swift&type=track&market=US&limit=5
Authorization: Bearer {access_token}
```

**Example Response**

```json
{
  "tracks": {
    "items": [
      {
        "id": "44AyOl4qWZxNFlnOhxKTQB",
        "name": "Anti-Hero",
        "artists": [{ "id": "06HL4z0CvFAxyc27GXpf02", "name": "Taylor Swift" }],
        "album": { "name": "Midnights", "release_date": "2022-10-21" },
        "popularity": 91,
        "duration_ms": 200690,
        "explicit": false,
        "preview_url": "https://p.scdn.co/mp3-preview/..."
      }
    ],
    "total": 847,
    "limit": 5,
    "offset": 0,
    "next": "https://api.spotify.com/v1/search?offset=5&..."
  }
}
```

---

### Get Track Details

Returns full metadata for a single track by its Spotify ID.

```
GET /tracks/{id}
```

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Spotify track ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `market` | string | no | ISO 3166-1 alpha-2 country code |

**Example Request**

```http
GET /tracks/44AyOl4qWZxNFlnOhxKTQB?market=US
Authorization: Bearer {access_token}
```

---

### Get Track Audio Features

Returns acoustic attributes for a track — useful for Sonar's mood-based discovery filters.

```
GET /audio-features/{id}
```

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Spotify track ID |

**Example Request**

```http
GET /audio-features/44AyOl4qWZxNFlnOhxKTQB
Authorization: Bearer {access_token}
```

**Example Response**

```json
{
  "id": "44AyOl4qWZxNFlnOhxKTQB",
  "danceability": 0.585,
  "energy": 0.73,
  "key": 7,
  "loudness": -5.883,
  "mode": 1,
  "speechiness": 0.0293,
  "acousticness": 0.292,
  "instrumentalness": 0.0,
  "liveness": 0.0985,
  "valence": 0.536,
  "tempo": 97.006,
  "duration_ms": 200690,
  "time_signature": 4
}
```

**Audio Feature Reference**

| Feature | Range | Description |
|---|---|---|
| `danceability` | 0.0–1.0 | How suitable for dancing |
| `energy` | 0.0–1.0 | Intensity and activity |
| `valence` | 0.0–1.0 | Musical positivity (high = happy) |
| `acousticness` | 0.0–1.0 | Confidence of acoustic sound |
| `instrumentalness` | 0.0–1.0 | Predicts absence of vocals |
| `tempo` | BPM | Estimated beats per minute |
| `loudness` | dB | Overall loudness |

---

### Get Artist

Returns full details for an artist.

```
GET /artists/{id}
```

**Example Request**

```http
GET /artists/06HL4z0CvFAxyc27GXpf02
Authorization: Bearer {access_token}
```

---

### Get Artist's Top Tracks

Returns an artist's most popular tracks in a given market.

```
GET /artists/{id}/top-tracks
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `market` | string | yes | ISO 3166-1 alpha-2 country code |

**Example Request**

```http
GET /artists/06HL4z0CvFAxyc27GXpf02/top-tracks?market=US
Authorization: Bearer {access_token}
```

---

### Get Related Artists

Returns artists similar to a given artist — great for building discovery chains.

```
GET /artists/{id}/related-artists
```

**Example Request**

```http
GET /artists/06HL4z0CvFAxyc27GXpf02/related-artists
Authorization: Bearer {access_token}
```

---

## 🎵 Manage Playlists

Endpoints for creating, reading, updating, and populating user playlists.

---

### Get Current User's Playlists

Returns a list of playlists owned or followed by the current user.

```
GET /me/playlists
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | no | Default: `20`. Max: `50` |
| `offset` | integer | no | Default: `0` |

**Example Request**

```http
GET /me/playlists?limit=10
Authorization: Bearer {access_token}
```

**Example Response**

```json
{
  "items": [
    {
      "id": "3cEYpjA9oz9GiPac4AsH4n",
      "name": "Late Night Drives",
      "description": "For long roads and quiet nights.",
      "public": false,
      "tracks": { "total": 34 },
      "images": [{ "url": "https://i.scdn.co/image/..." }],
      "owner": { "id": "spotify_user_id", "display_name": "yourname" }
    }
  ],
  "total": 12,
  "limit": 10,
  "offset": 0
}
```

---

### Get Playlist

Returns full details for a single playlist including tracks.

```
GET /playlists/{playlist_id}
```

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `playlist_id` | string | yes | Spotify playlist ID |

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `market` | string | no | ISO 3166-1 alpha-2 country code |
| `fields` | string | no | Comma-separated list of fields to return (supports dot-notation) |

**Example Request**

```http
GET /playlists/3cEYpjA9oz9GiPac4AsH4n?market=US&fields=name,description,tracks.items(track(name,artists))
Authorization: Bearer {access_token}
```

---

### Create Playlist

Creates a new empty playlist for the current user.

```
POST /users/{user_id}/playlists
```

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user_id` | string | yes | Spotify user ID |

**Request Body**

```json
{
  "name": "Late Night Drives",
  "public": false,
  "collaborative": false,
  "description": "For long roads and quiet nights."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Name of the playlist |
| `public` | boolean | no | If `true`, playlist is public. Default: `true` |
| `collaborative` | boolean | no | If `true`, other users can modify. Requires `public: false` |
| `description` | string | no | Playlist description visible on Spotify |

**Example Request**

```http
POST /users/spotify_user_id/playlists
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Late Night Drives",
  "public": false,
  "description": "For long roads and quiet nights."
}
```

**Example Response**

```json
{
  "id": "3cEYpjA9oz9GiPac4AsH4n",
  "name": "Late Night Drives",
  "description": "For long roads and quiet nights.",
  "public": false,
  "tracks": { "total": 0 },
  "external_urls": { "spotify": "https://open.spotify.com/playlist/3cEYpjA9oz9GiPac4AsH4n" }
}
```

---

### Add Tracks to Playlist

Adds one or more tracks to a playlist. Tracks are appended to the end by default.

```
POST /playlists/{playlist_id}/tracks
```

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `playlist_id` | string | yes | Spotify playlist ID |

**Request Body**

```json
{
  "uris": [
    "spotify:track:44AyOl4qWZxNFlnOhxKTQB",
    "spotify:track:3n3Ppam7vgaVa1iaRUIOKE"
  ],
  "position": 0
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `uris` | array | yes | List of Spotify track URIs. Max: `100` per request |
| `position` | integer | no | Zero-based position to insert tracks. Omit to append |

**Example Request**

```http
POST /playlists/3cEYpjA9oz9GiPac4AsH4n/tracks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "uris": ["spotify:track:44AyOl4qWZxNFlnOhxKTQB"],
  "position": 0
}
```

**Example Response**

```json
{
  "snapshot_id": "abc123xyz..."
}
```

> The `snapshot_id` identifies the playlist version after modification and is used for safe reordering/removal operations.

---

### Remove Tracks from Playlist

Removes one or more tracks from a playlist.

```
DELETE /playlists/{playlist_id}/tracks
```

**Request Body**

```json
{
  "tracks": [
    { "uri": "spotify:track:44AyOl4qWZxNFlnOhxKTQB" }
  ],
  "snapshot_id": "abc123xyz..."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `tracks` | array | yes | Array of objects with `uri` keys. Max: `100` per request |
| `snapshot_id` | string | no | Playlist snapshot ID for safe concurrent edits |

---

### Reorder Playlist Tracks

Moves a block of tracks to a new position within the playlist.

```
PUT /playlists/{playlist_id}/tracks
```

**Request Body**

```json
{
  "range_start": 2,
  "insert_before": 0,
  "range_length": 1,
  "snapshot_id": "abc123xyz..."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `range_start` | integer | yes | Index of the first track to move |
| `insert_before` | integer | yes | Index position to insert the moved tracks before |
| `range_length` | integer | no | Number of tracks to move. Default: `1` |
| `snapshot_id` | string | no | Playlist snapshot ID |

---

### Update Playlist Details

Updates the name, description, or visibility of a playlist.

```
PUT /playlists/{playlist_id}
```

**Request Body**

```json
{
  "name": "Late Night Drives ✨",
  "description": "Updated vibes for the road.",
  "public": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | no | New playlist name |
| `description` | string | no | New playlist description |
| `public` | boolean | no | Playlist visibility |
| `collaborative` | boolean | no | Allow collaborators |

---

### Get Playlist Tracks

Returns all tracks in a playlist with full metadata.

```
GET /playlists/{playlist_id}/tracks
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `market` | string | no | ISO 3166-1 alpha-2 country code |
| `fields` | string | no | Field filter using dot-notation |
| `limit` | integer | no | Default: `100`. Max: `100` |
| `offset` | integer | no | Default: `0` |

**Example Request**

```http
GET /playlists/3cEYpjA9oz9GiPac4AsH4n/tracks?market=US&limit=20&offset=0
Authorization: Bearer {access_token}
```

---

## Error Responses

All endpoints follow standard HTTP status codes with a consistent error body.

```json
{
  "error": {
    "status": 401,
    "message": "No token provided"
  }
}
```

| Status | Meaning |
|---|---|
| `400` | Bad Request — malformed query or missing required parameters |
| `401` | Unauthorized — missing or expired access token |
| `403` | Forbidden — insufficient OAuth scopes for this action |
| `404` | Not Found — resource ID does not exist |
| `429` | Too Many Requests — rate limit exceeded; check `Retry-After` header |
| `500` | Internal Server Error — Spotify-side error |

---

## OAuth Scopes Reference

| Scope | Required For |
|---|---|
| `user-top-read` | `/me/top/artists`, `/me/top/tracks` |
| `playlist-read-private` | Reading private playlists |
| `playlist-modify-public` | Creating/editing public playlists |
| `playlist-modify-private` | Creating/editing private playlists |
| `user-read-private` | Reading user profile and country |

---

*Sonar uses the [Spotify Web API](https://developer.spotify.com/documentation/web-api). All data is subject to [Spotify's Terms of Service](https://developer.spotify.com/terms).*