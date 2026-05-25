import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const reconnect = searchParams.get('reconnect') === 'true';

  // Get user before signing out
  const { data: { user } } = await supabase.auth.getUser();

  // If reconnecting, wipe the stored Spotify tokens so the old scoped token
  // can't be used — forces a completely fresh OAuth grant on next login
  if (reconnect && user) {
    await db
      .update(profiles)
      .set({ spotifyAccessToken: null, spotifyRefreshToken: null, spotifyTokenExpiresAt: null })
      .where(eq(profiles.id, user.id));
  }

  await supabase.auth.signOut();

  const dest = reconnect ? '/login?reconnect=true' : '/';
  return NextResponse.redirect(new URL(dest, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'));
}
