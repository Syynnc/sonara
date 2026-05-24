'use client';

import { useReveal } from '@/lib/hooks/useReveal';

const STATS = [
  { value: '84K+',  label: 'Monthly listeners' },
  { value: '2.1M+', label: 'Tracks searched' },
  { value: '340K+', label: 'Playlists created' },
];

const STAT_DELAYS = ['[--reveal-delay:80ms]', '[--reveal-delay:180ms]', '[--reveal-delay:280ms]'];

function StatCard({
  value,
  label,
  delayClass,
  visible,
}: {
  value: string;
  label: string;
  delayClass: string;
  visible: boolean;
}) {
  return (
    <div
      data-reveal={visible ? 'visible' : 'hidden'}
      className={`${delayClass}`}
    >
      {/* Outer shell */}
      <div className="p-2 bg-white/[0.025] border border-white/[0.06] rounded-[2rem]">
        {/* Inner core */}
        <div className="bg-[#0C0C0C] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] px-8 py-7 flex flex-col gap-1.5">
          <p className="text-4xl font-bold tracking-tighter text-shimmer">{value}</p>
          <p className="text-sm text-white/35">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function AboutSection() {
  const copy        = useReveal();
  const statsReveal = useReveal(0.08);

  return (
    <section id="about" className="bg-[#080808] py-36 md:py-44">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* ── Left — copy ─────────────────────────────────────────────── */}
          <div
            ref={copy.ref}
            data-reveal={copy.visible ? 'visible' : 'hidden'}
          >
            {/* Eyebrow */}
            <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.07] rounded-full w-fit mb-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#0D0D0D] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <span className="text-[9px] font-semibold tracking-[0.28em] text-[#FF5500]/70 uppercase">
                  About Sonara
                </span>
              </div>
            </div>

            <h2 className="text-3xl md:text-[3rem] font-bold tracking-tighter text-white leading-[1.06] mb-7 max-w-[22ch]">
              Built for people who actually care about music.
            </h2>

            <p className="text-white/40 leading-relaxed mb-5 max-w-[52ch]">
              Sonara started as a frustration: streaming platforms are great at
              cataloguing music but poor at helping you understand your own taste.
              We built the analytics layer that was missing.
            </p>
            <p className="text-white/40 leading-relaxed max-w-[52ch]">
              We use the Spotify API to surface what you have been listening to,
              help you find new music through real search, and let you build and
              export playlists — all without leaving one interface.
            </p>

            {/* CTA — Button-in-Button */}
            <a
              href="/dashboard"
              className="
                group inline-flex items-center gap-0 pl-6 pr-1.5 py-1.5 mt-10
                bg-[#FF5500] text-white font-semibold text-sm rounded-full
                hover:bg-[#FF6820] active:scale-[0.97]
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                shadow-[0_4px_24px_rgba(255,85,0,0.28),inset_0_1px_0_rgba(255,255,255,0.15)]
              "
            >
              Open the dashboard
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
          </div>

          {/* ── Right — stat cards ──────────────────────────────────────── */}
          <div
            ref={statsReveal.ref}
            className="flex flex-col gap-3"
          >
            {STATS.map(({ value, label }, i) => (
              <StatCard
                key={label}
                value={value}
                label={label}
                visible={statsReveal.visible}
                delayClass={STAT_DELAYS[i] ?? '[--reveal-delay:0ms]'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
