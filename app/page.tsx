'use client';

import { useState } from 'react';
import { Soundwave } from './components/Soundwave';
import { Search, Moon, Sun } from 'lucide-react';

export default function Home() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div
      className={`size-full overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-950'
      }`}
    >
      <div className="relative h-screen flex flex-col">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <Soundwave isDark={isDark} />
        </div>

        {/* Top Navbar */}
        <div className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-auto px-4">
          <header
            className={`flex items-center gap-6 md:gap-8 px-6 py-3 rounded-full backdrop-blur-md border transition-all ${
              isDark
                ? 'bg-slate-900/40 border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-slate-300'
                : 'bg-white/40 border-slate-300/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-slate-700'
            }`}
          >
            <div
              className={`font-bold tracking-widest text-lg transition-colors ${
                isDark ? 'text-slate-50' : 'text-slate-950'
              }`}
            >
              SONAR
            </div>

            <nav className="hidden md:flex gap-6 text-sm font-medium transition-colors">
              {['Trending', 'New Releases', 'Playlists', 'Artists'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`transition-colors ${
                    isDark
                      ? 'hover:text-slate-50'
                      : 'hover:text-slate-950'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            <div
              className={`w-[1px] h-6 hidden md:block transition-colors ${
                isDark ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            />

            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-all ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-50'
                  : 'hover:bg-slate-200 text-slate-950'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pointer-events-none">
          <h1
            className={`text-[clamp(4rem,15vw,10rem)] tracking-tight mb-2 transition-colors font-bold ${
              isDark ? 'text-slate-50' : 'text-slate-950'
            }`}
          >
            SONAR
          </h1>
          <p
            className={`text-lg md:text-xl mb-12 transition-colors ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Discover music through sound
          </p>

          <div className="w-full max-w-2xl relative pointer-events-auto">
            <div
              className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Search for artists, tracks, or genres..."
              className={`w-full backdrop-blur-md border rounded-full py-4 pl-14 pr-6 focus:outline-none transition-all shadow-lg ${
                isDark
                  ? 'bg-slate-900/40 border-slate-700 hover:border-slate-500 text-slate-50 placeholder:text-slate-400 focus:border-purple-500 focus:bg-slate-900/60'
                  : 'bg-white/40 border-slate-300 hover:border-slate-400 text-slate-950 placeholder:text-slate-600 focus:border-blue-500 focus:bg-white/60'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
