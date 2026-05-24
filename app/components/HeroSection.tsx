'use client';

import { Soundwave } from './Soundwave';

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#080808]">

      {/* ── Ambient radial orbs (absolute — avoids overflow-x:hidden containing-block issue) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="hero-orb-primary absolute top-[-20%] left-[10%] w-[55vw] h-[55vw] rounded-full" />
        <div className="hero-orb-secondary absolute bottom-[-10%] right-[5%] w-[40vw] h-[40vw] rounded-full" />
      </div>

      {/* ── Canvas soundwave — pointer-events-none on wrapper so scroll events pass through;
              the canvas element itself is auto (HTML does NOT inherit pointer-events) ────── */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <Soundwave />
      </div>

      {/* ── Left-to-right gradient for text legibility ──────────────────── */}
      <div className="absolute inset-0 z-[2] pointer-events-none hero-gradient" />

      {/* ── Bottom fade into next section ───────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080808] to-transparent z-[3] pointer-events-none" />

      {/* ── Hero content ────────────────────────────────────────────────── */}
      <div className="relative z-[4] max-w-7xl mx-auto px-6 min-h-[100dvh] flex flex-col justify-center">
        <div className="max-w-[640px] w-full pt-28 pb-20">

          {/* Eyebrow pill — double-bezel */}
          <div className="inline-flex items-center gap-2 mb-10 animate-fade-up">
            <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.07] rounded-full">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0D0D0D] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse-dot" />
                <span className="text-[9px] font-semibold tracking-[0.28em] text-[#FF5500] uppercase">
                  Music Intelligence Platform
                </span>
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-display-xl font-bold tracking-tighter leading-[0.9] text-white mb-8 animate-fade-up-delay-1">
            Discover
            <br />
            <span className="text-shimmer inline-block">Sound.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-body-fluid text-white/40 leading-relaxed mb-12 max-w-[48ch] animate-fade-up-delay-2">
            Search by vibe, mood, or artist. Sonara maps the acoustic space
            between what you know and what you&apos;ll love.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-4 animate-fade-up-delay-2">

            {/* Primary — Button-in-Button */}
            <a
              href="/dashboard"
              className="
                group flex items-center gap-0 pl-6 pr-1.5 py-1.5
                bg-[#FF5500] text-white font-semibold text-sm rounded-full
                hover:bg-[#FF6820] active:scale-[0.97]
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                shadow-[0_4px_24px_rgba(255,85,0,0.28),inset_0_1px_0_rgba(255,255,255,0.15)]
              "
            >
              Open Dashboard
              <span className="
                ml-3 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center shrink-0
                group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
              ">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" />
                </svg>
              </span>
            </a>

            {/* Ghost link */}
            <a
              href="#features"
              className="
                group flex items-center gap-2 text-sm font-medium text-white/40
                hover:text-white
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
              "
            >
              See features
              <span className="
                inline-flex items-center justify-center
                group-hover:translate-x-1
                transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
              ">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6.5h8M7 3.5l3 3-3 3" />
                </svg>
              </span>
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 mt-12 animate-fade-up-delay-2">
            <div className="flex -space-x-2.5">
              {['3E2A', '6F4B', '9C7D', 'B82F'].map((seed) => (
                <div key={seed} className="p-[1.5px] bg-[#FF5500]/20 rounded-full">
                  <img
                    src={`https://picsum.photos/seed/${seed}/28/28`}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-white/30">
              <span className="text-white/70 font-semibold">84,200+</span>&nbsp;listeners this week
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
