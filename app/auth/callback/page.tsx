'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const error    = searchParams.get('error');

    if (error) {
      router.replace(`/login?error=${error}`);
      return;
    }

    const code = searchParams.get('code');

    if (code) {
      // PKCE flow
      supabase.auth.exchangeCodeForSession(code).then(({ data, error: err }) => {
        if (err || !data.session) {
          console.error('[auth/callback] exchangeCodeForSession failed:', err);
          router.replace('/login?error=exchange_failed');
        } else {
          router.replace('/dashboard');
        }
      });
      return;
    }

    // Implicit flow — tokens arrive in the URL hash fragment.
    // onAuthStateChange fires as soon as the client parses the fragment.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        router.replace('/dashboard');
      }
    });

    // Fallback: if no auth event fires within 5 s, give up
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      // Last-ditch check in case the event already fired without us catching it
      supabase.auth.getSession().then(({ data: { session } }) => {
        router.replace(session ? '/dashboard' : '/login?error=no_session');
      });
    }, 5000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground animate-pulse">Signing you in…</p>
    </div>
  );
}
