import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type       = (searchParams.get('type') ?? 'magiclink') as 'magiclink' | 'email';
  const error      = searchParams.get('error');

  if (error) return NextResponse.redirect(`${APP_URL}/login?error=${error}`);
  if (!token_hash) return NextResponse.redirect(`${APP_URL}/login?error=no_token`);

  const supabase = await createClient();

  const { data, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  });

  if (verifyError || !data.session) {
    console.error('[api/auth/callback] verifyOtp failed:', verifyError);
    return NextResponse.redirect(`${APP_URL}/login?error=exchange_failed`);
  }

  // Ensure profile row exists
  try {
    await db
      .insert(profiles)
      .values({ id: data.session.user.id, updatedAt: new Date() })
      .onConflictDoNothing();
  } catch (e) {
    console.error('[api/auth/callback] profile insert failed:', e);
  }

  return NextResponse.redirect(`${APP_URL}/dashboard`);
}
