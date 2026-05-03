'use client';

import { Soundwave } from './components/Soundwave';
import { Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="size-full overflow-hidden bg-[#141414] text-[#f0e6c8]">
      <div className="relative h-screen flex flex-col">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <Soundwave />
        </div>

        {/* Top Navbar */}
        <div className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-auto px-4">
          <header className="flex items-center gap-6 md:gap-8 px-6 py-3 rounded-full backdrop-blur-md border transition-all bg-[#1e1e1e]/60 border-[#2e2e2e] shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-[#c8b87a]">
            <div className="font-bold tracking-widest text-lg text-[#f0e6c8]">
              SONAR
            </div>

            <nav className="hidden md:flex gap-6 text-sm font-medium">
              {['Trending', 'New Releases', 'Playlists', 'Artists'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="transition-colors hover:text-[#f0e6c8]"
                >
                  {item}
                </button>
              ))}
            </nav>
          </header>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pointer-events-none">
          <h1 className="text-[clamp(4rem,15vw,10rem)] tracking-tight mb-2 font-bold text-[#f0e6c8]">
            SONAR
          </h1>
          <p className="text-lg md:text-xl mb-12 text-[#d4af37]/70">
            Discover music through sound
          </p>

          <div className="w-full max-w-2xl relative pointer-events-auto">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#d4af37]/60">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Search for artists, tracks, or genres..."
              className="w-full backdrop-blur-md border rounded-full py-4 pl-14 pr-6 focus:outline-none transition-all shadow-lg bg-[#1e1e1e]/60 border-[#2e2e2e] hover:border-[#d4af37]/40 text-[#f0e6c8] placeholder:text-[#c8b87a]/50 focus:border-[#d4af37] focus:bg-[#1e1e1e]/80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
