import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { httpsFetch } from '@/lib/supabase/https-fetch';
import { createHmac, timingSafeEqual } from 'crypto';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: httpsFetch },
  },
);

function verifyState(state: string): boolean {
  try {
    const decoded = Buffer.from(state, 'base64url').toString();
    const parts   = decoded.split(':');
    if (parts.length < 3) return false;
    const sig     = parts[parts.length - 1];
    const payload = parts.slice(0, -1).join(':');
    const ts      = parseInt(parts[parts.length - 2], 10);
    if (Date.now() - ts > 10 * 60 * 1000) return false;
    const expected = createHmac('sha256', process.env.SPOTIFY_CLIENT_SECRET!)
      .update(payload)
      .digest('hex');
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch { return false; }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error || !code || !state || !verifyState(state)) {
    return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
  }

  // 1. Exchange code for Spotify tokens
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString('base64');

  const tokenRes = await httpsFetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type:   'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }).toString(),
  });

  if (!tokenRes.ok) {
    console.error('[connect/callback] token exchange failed:', await tokenRes.text());
    return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
  }

  const tokens = await tokenRes.json() as {
    access_token:  string;
    refresh_token: string;
    expires_in:    number;
  };

  // 2. Get Spotify user profile — retry up to 3× on 429
  let meRes: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    meRes = await httpsFetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (meRes.status !== 429) break;
    const retryAfter = parseInt(meRes.headers.get('retry-after') ?? '5', 10);
    console.warn(`[connect/callback] /me rate limited, retrying in ${retryAfter}s`);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
  }

  if (!meRes || !meRes.ok) {
    console.error('[connect/callback] /me failed:', await meRes?.text());
    return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
  }

  const me = await meRes.json() as {
    id:           string;
    email:        string;
    display_name: string;
  };

  if (!me.email) {
    return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
  }

  // 3. Find or create Supabase user
  let userId: string;

  // Try to create the user first; if they already exist, look them up instead.
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email:         me.email,
    email_confirm: true,
    user_metadata: { full_name: me.display_name, spotify_id: me.id },
  });

  if (created?.user) {
    userId = created.user.id;
  } else if (createErr?.code === 'email_exists') {
    // User already exists — fetch via Admin REST API (supabase-js has no getUserByEmail)
    const lookupRes = await httpsFetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(me.email)}`,
      { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}` } },
    );
    if (!lookupRes.ok) {
      console.error('[connect/callback] user lookup failed:', await lookupRes.text());
      return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
    }
    const { users: found } = await lookupRes.json() as { users: { id: string }[] };
    const match = found?.[0];
    if (!match) {
      console.error('[connect/callback] user lookup returned no results for', me.email);
      return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
    }
    userId = match.id;
  } else {
    console.error('[connect/callback] create user failed:', createErr);
    return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
  }

  // 4. Store Spotify tokens
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await db
    .insert(profiles)
    .values({
      id:                    userId,
      spotifyAccessToken:    tokens.access_token,
      spotifyRefreshToken:   tokens.refresh_token,
      spotifyTokenExpiresAt: expiresAt,
      updatedAt:             new Date(),
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        spotifyAccessToken:    tokens.access_token,
        spotifyRefreshToken:   tokens.refresh_token,
        spotifyTokenExpiresAt: expiresAt,
        updatedAt:             new Date(),
      },
    });

  // 5. Generate OTP token → verify server-side → skip Supabase-hosted redirect entirely
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type:  'magiclink',
    email: me.email,
  });

  if (linkErr || !linkData.properties?.hashed_token) {
    console.error('[connect/callback] generateLink failed:', linkErr);
    return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
  }

  console.log('[connect/callback] signing in user:', userId, me.email);
  // Redirect to our own server-side verifier — avoids the PKCE/implicit ambiguity
  // that arises when going through Supabase's hosted verify URL.
  const params = new URLSearchParams({
    token_hash: linkData.properties.hashed_token,
    type:       'magiclink',
  });
  return NextResponse.redirect(`${APP_URL}/api/auth/callback?${params}`);
}
