'use client';

import { useReveal } from '@/lib/hooks/useReveal';

/* ── Ultra-thin custom icons (no Lucide) ─────────────────────────────────── */
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18M7 20V10M12 20V4M17 20v-7" />
    </svg>
  );
}
function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5V8.5z" />
    </svg>
  );
}
function IconSparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
function IconShuffle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: IconSearch,
    title: 'Search by vibe',
    body: 'Find music by mood, genre, artist, or anything in between. Sonara speaks your language.',
    span: 'md:col-span-7',
  },
  {
    icon: IconChart,
    title: 'Listening analytics',
    body: 'See your top tracks and artists across time ranges. Understand what your ears actually love.',
    span: 'md:col-span-5',
  },
  {
    icon: IconList,
    title: 'Playlist builder',
    body: 'Create playlists, add tracks from search, then export them directly to your Spotify account.',
    span: 'md:col-span-5',
  },
  {
    icon: IconPlay,
    title: 'In-browser playback',
    body: 'Play any track right inside Sonara. No app switching — full Spotify playback in the dashboard.',
    span: 'md:col-span-7',
  },
  {
    icon: IconSparkle,
    title: 'Personalized picks',
    body: 'Recommendations shaped by your recent listening — not a generic chart, your actual taste.',
    span: 'md:col-span-6',
  },
  {
    icon: IconShuffle,
    title: 'Discover the edges',
    body: "The acoustic space between what you know and what you'll love — Sonara maps the gap.",
    span: 'md:col-span-6',
  },
];

/* ── CSS custom-prop stagger delay classes ───────────────────────────────── */
const DELAY_CLASSES = [
  '[--reveal-delay:0ms]',
  '[--reveal-delay:70ms]',
  '[--reveal-delay:140ms]',
  '[--reveal-delay:210ms]',
  '[--reveal-delay:280ms]',
  '[--reveal-delay:350ms]',
];

/* ── Double-bezel feature card ───────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  body,
  span,
  delayClass,
}: {
  icon: React.FC;
  title: string;
  body: string;
  span: string;
  delayClass: string;
}) {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      data-reveal={visible ? 'visible' : 'hidden'}
      className={`col-span-12 ${span} ${delayClass}`}
    >
      {/* Outer shell */}
      <div className="h-full p-2 bg-white/[0.025] border border-white/[0.06] rounded-[2rem] group">
        {/* Inner core */}
        <div className="
          h-full bg-[#0C0C0C] rounded-[calc(2rem-0.5rem)]
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)]
          p-8 flex flex-col gap-6
          hover:bg-[#101010]
          transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ">
          {/* Icon — double-bezel */}
          <div className="p-1.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl w-fit">
            <div className="
              w-10 h-10 rounded-[calc(1rem-0.375rem)]
              bg-[#0A0A0A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]
              flex items-center justify-center text-[#FF5500]
              group-hover:text-[#FF7733]
              transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ">
              <Icon />
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white tracking-tight mb-2.5">{title}</h3>
            <p className="text-sm text-white/35 leading-relaxed">{body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const header = useReveal();

  return (
    <section id="features" className="bg-[#080808] py-36 md:py-44">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section header ──────────────────────────────────────────────── */}
        <div
          ref={header.ref}
          data-reveal={header.visible ? 'visible' : 'hidden'}
          className="mb-20"
        >
          {/* Eyebrow — double-bezel pill */}
          <div className="p-[1.5px] bg-white/[0.04] border border-white/[0.07] rounded-full w-fit mb-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#0D0D0D] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <span className="text-[9px] font-semibold tracking-[0.28em] text-[#FF5500]/70 uppercase">
                What Sonara does
              </span>
            </div>
          </div>

          <h2 className="text-3xl md:text-[3.25rem] font-bold tracking-tighter text-white leading-[1.06] max-w-[20ch] mb-5">
            Everything your music life needs.
          </h2>
          <p className="text-white/35 max-w-[52ch] leading-relaxed">
            One platform for discovery, analytics, playlist curation, and
            real-time playback — all connected to Spotify.
          </p>
        </div>

        {/* ── Asymmetric bento grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-3">
          {FEATURES.map(({ icon, title, body, span }, i) => (
            <FeatureCard
              key={title}
              icon={icon}
              title={title}
              body={body}
              span={span}
              delayClass={DELAY_CLASSES[i] ?? '[--reveal-delay:0ms]'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
