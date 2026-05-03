'use client';

import { ChevronRight, Play } from 'lucide-react';
import { Soundwave } from './Soundwave';
import { SearchBar } from './SearchBar';

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      {/* Canvas background — full bleed */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Soundwave />
      </div>

      {/* Left gradient overlay for text legibility */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, #141414 0%, #141414 38%, rgba(20,20,20,0.82) 58%, rgba(20,20,20,0.3) 75%, transparent 100%)',
        }}
      />

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#141414] to-transparent z-20 pointer-events-none" />

      {/* Content — left-aligned */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 min-h-[100dvh] flex flex-col justify-center">
        <div className="max-w-[600px] w-full pt-24 pb-16">
          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#d4af37]/8 border border-[#d4af37]/18 rounded-full mb-8"
            style={{ animation: 'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"
              style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
            />
            <span className="text-[10px] font-semibold tracking-[0.25em] text-[#d4af37] uppercase">
              Music Intelligence Platform
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-bold tracking-tighter leading-[0.92] text-[#f0e6c8] mb-6"
            style={{
              fontSize: 'clamp(3.2rem, 9vw, 6.5rem)',
              animation: 'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.12s both',
            }}
          >
            Discover
            <br />
            <span className="text-[#d4af37]">Sound.</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-[#c8b87a]/75 leading-relaxed mb-10 max-w-[52ch]"
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
              animation: 'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.2s both',
            }}
          >
            Search by vibe, mood, or artist. Sonara maps the acoustic space between what you know and what you&apos;ll love.
          </p>

          {/* Search bar */}
          <div
            style={{ animation: 'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.28s both' }}
          >
            <SearchBar />
          </div>

          {/* CTA row */}
          <div
            className="flex items-center gap-5 mt-9"
            style={{ animation: 'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.36s both' }}
          >
            <button className="flex items-center gap-2.5 px-6 py-3 bg-[#d4af37] text-[#141414] font-semibold rounded-full text-sm hover:bg-[#debb4a] transition-all duration-300 active:scale-[0.97] active:-translate-y-[1px] shadow-[0_4px_20px_rgba(212,175,55,0.25)]">
              <Play size={15} fill="currentColor" />
              Explore Trending
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-[#c8b87a] hover:text-[#f0e6c8] transition-colors group">
              How it works
              <ChevronRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* Trust line */}
          <div
            className="flex items-center gap-4 mt-10"
            style={{ animation: 'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.44s both' }}
          >
            <div className="flex -space-x-2">
              {['3E2A', '6F4B', '9C7D', 'B82F'].map((seed) => (
                <img
                  key={seed}
                  src={`https://picsum.photos/seed/${seed}/32/32`}
                  alt=""
                  className="w-7 h-7 rounded-full border-2 border-[#141414] object-cover"
                />
              ))}
            </div>
            <p className="text-xs text-[#c8b87a]/55">
              <span className="text-[#f0e6c8]/80 font-medium">84,200+</span> listeners this week
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
