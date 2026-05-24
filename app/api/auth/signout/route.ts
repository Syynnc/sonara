import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const reconnect = searchParams.get('reconnect') === 'true';

  await supabase.auth.signOut();

  const dest = reconnect ? '/login?reconnect=true' : '/';
  return NextResponse.redirect(new URL(dest, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'));
}
