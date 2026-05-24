'use client';

import { useReveal } from '@/lib/hooks/useReveal';

const STEPS = [
  {
    number: '01',
    title: 'Connect Spotify',
    body: 'Sign in with your Spotify account. Sonara reads your listening history and gets a playback token — nothing is stored beyond what you authorise.',
  },
  {
    number: '02',
    title: 'Explore your universe',
    body: 'Your dashboard surfaces top tracks, top artists, and fresh recommendations — all drawn from your real listening data, not editorial guesses.',
  },
  {
    number: '03',
    title: 'Play, build, export',
    body: 'Play songs directly in the browser, build playlists from search results, and push them back to Spotify with one click.',
  },
];

const STEP_DELAYS = ['[--reveal-delay:0ms]', '[--reveal-delay:120ms]', '[--reveal-delay:240ms]'];

function StepCard({
  number,
  title,
  body,
  delayClass,
}: {
  number: string;
  title: string;
  body: string;
  delayClass: string;
}) {
  const { ref, visible } = useReveal(0.1);

  return (
    <div
      ref={ref}
      data-reveal={visible ? 'visible' : 'hidden'}
      className={`${delayClass}`}
    >
      {/* Outer shell */}
      <div className="h-full p-2 bg-white/[0.025] border border-white/[0.06] rounded-[2rem]">
        {/* Inner core */}
        <div className="h-full bg-[#0C0C0C] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] p-8 flex flex-col gap-7">

          {/* Step number — double-bezel badge */}
          <div className="flex items-center gap-4">
            <div className="p-1.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl">
              <div className="w-11 h-11 rounded-[calc(1rem-0.375rem)] bg-[#0A0A0A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex items-center justify-center">
                <span className="text-[13px] font-bold font-mono text-[#FF5500] tracking-wider">{number}</span>
              </div>
            </div>
            {/* Connector tick */}
            <div className="flex-1 h-px bg-gradient-to-r from-[#FF5500]/20 to-transparent" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white tracking-tight mb-3 leading-tight">{title}</h3>
            <p className="text-sm text-white/35 leading-relaxed">{body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const header = useReveal();

  return (
    <section id="how-it-works" className="bg-[#060606] py-36 md:py-44">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          ref={header.ref}
          data-reveal={header.visible ? 'visible' : 'hidden'}
          className="mb-20"
        >
          <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.07] rounded-full w-fit mb-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#0D0D0D] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <span className="text-[9px] font-semibold tracking-[0.28em] text-[#FF5500]/70 uppercase">
                How it works
              </span>
            </div>
          </div>

          <h2 className="text-3xl md:text-[3.25rem] font-bold tracking-tighter text-white leading-[1.06] max-w-[18ch]">
            Three steps to your full sound.
          </h2>
        </div>

        {/* ── Steps grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STEPS.map(({ number, title, body }, i) => (
            <StepCard
              key={number}
              number={number}
              title={title}
              body={body}
              delayClass={STEP_DELAYS[i] ?? '[--reveal-delay:0ms]'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
