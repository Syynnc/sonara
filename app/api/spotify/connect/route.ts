import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const SCOPES = [
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-top-read',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email',
].join(' ');

export function signState(nonce: string): string {
  const payload = `${nonce}:${Date.now()}`;
  const sig = createHmac('sha256', process.env.SPOTIFY_CLIENT_SECRET!)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

// GET /api/spotify/connect — primary login entry point, no session required
export async function GET() {
  const state = signState(crypto.randomUUID());

  const params = new URLSearchParams({
    client_id:     process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri:  process.env.SPOTIFY_REDIRECT_URI!,
    scope:         SCOPES,
    state,
    show_dialog:   'true',
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`,
  );
}
