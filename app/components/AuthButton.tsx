'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { LogOut, LayoutDashboard } from 'lucide-react';

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return <div className="w-20 h-8 bg-[#2a2a2a] rounded-full animate-pulse" />;
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-[#141414] bg-[#d4af37] rounded-full hover:bg-[#debb4a] transition-all duration-300 active:scale-[0.98]"
      >
        Sign In
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/dashboard"
        className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#c8b87a] hover:text-[#f0e6c8] transition-colors"
      >
        <LayoutDashboard size={14} strokeWidth={1.5} />
        Dashboard
      </a>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#c8b87a]/60 border border-[#2a2a2a] rounded-full hover:border-[#d4af37]/30 hover:text-[#f0e6c8] transition-all duration-200 active:scale-[0.98]"
      >
        <LogOut size={13} strokeWidth={1.5} />
        <span className="hidden md:inline">Sign Out</span>
      </button>
    </div>
  );
}
