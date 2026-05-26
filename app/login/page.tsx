'use client';

import { Headphones } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  no_code:        'Authentication was cancelled. Please try again.',
  exchange_failed:'Could not complete sign-in. Please try again.',
  token_expired:  'Your Spotify session expired. Please sign in again.',
  auth_failed:    'Something went wrong. Please try again.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const errorKey     = searchParams.get('error');
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : null;

  return (
    <div className="min-h-[100dvh] bg-[#121212] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,85,0,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center mb-5">
            <Headphones size={24} className="text-[#FF5500]" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF]">Welcome to Sonara</h1>
          <p className="text-sm text-[#B3B3B3]/55 mt-2 text-center max-w-[28ch]">
            Sign in with Spotify to discover your sound
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl shadow-sm">
          <p className="text-xs text-orange-200/90 text-center leading-relaxed">
            <span className="font-semibold text-orange-400">Beta Access:</span> This app is currently in development mode. To log in, please contact the developer to have your Spotify account email added to the access list.
          </p>
        </div>

        {/* Sign-in button — goes directly to our Spotify OAuth route */}
        <a
          href="/api/spotify/connect"
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#FF5500] hover:bg-[#FF6820] text-white font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_8px_24px_rgba(255,85,0,0.25)]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Continue with Spotify
        </a>

        <p className="text-center text-xs text-[#B3B3B3]/30 mt-6 leading-relaxed">
          By continuing you agree to our Terms and Privacy Policy.
          <br />
          We only request read access to your listening data.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
