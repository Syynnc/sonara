const ROW1 = [
  { title: 'Gemini Rights', artist: 'Steve Lacy' },
  { title: 'Motomami', artist: 'Rosalía' },
  { title: 'The Melodic Blue', artist: 'Baby Keem' },
  { title: 'Dawn FM', artist: 'The Weeknd' },
  { title: 'Mr. Morale & the Big Steppers', artist: 'Kendrick Lamar' },
  { title: 'Sometimes I Might Be Introvert', artist: 'Little Simz' },
  { title: 'Promises', artist: 'Floating Points & Pharoah Sanders' },
  { title: 'Collapsed in Sunbeams', artist: 'Arlo Parks' },
];

const ROW2 = [
  { title: 'Javelin', artist: 'Sufjan Stevens' },
  { title: 'Desire, I Want to Turn Into You', artist: 'Caroline Polachek' },
  { title: 'The Record', artist: 'boygenius' },
  { title: 'Guts', artist: 'Olivia Rodrigo' },
  { title: 'Scaring the Hoes', artist: 'JPEGMAFIA & Danny Brown' },
  { title: 'Red Moon in Venus', artist: 'Kali Uchis' },
  { title: 'Orquídeas', artist: 'Kali Uchis' },
  { title: 'Radical Optimism', artist: 'Dua Lipa' },
];

// Duplicate each row for seamless looping
const DOUBLED_ROW1 = [...ROW1, ...ROW1];
const DOUBLED_ROW2 = [...ROW2, ...ROW2];

function TrackPill({ title, artist }: { title: string; artist: string }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="w-1 h-1 rounded-full bg-[#d4af37]/40" />
      <span className="text-sm font-medium text-[#f0e6c8]/70">{title}</span>
      <span className="text-xs text-[#c8b87a]/40">— {artist}</span>
    </div>
  );
}

export function TrendingMarquee() {
  return (
    <section className="py-8 overflow-hidden border-y border-[#2a2a2a]">
      {/* Label */}
      <div className="flex items-center gap-4 mb-5 px-6 max-w-7xl mx-auto">
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#d4af37]/50 uppercase whitespace-nowrap">
          Trending Now
        </span>
        <div className="flex-1 h-px bg-[#2a2a2a]" />
      </div>

      {/* Row 1 — forward */}
      <div className="relative flex overflow-hidden mb-3">
        <div
          className="flex gap-10"
          style={{ animation: 'marquee 32s linear infinite', width: 'max-content' }}
        >
          {DOUBLED_ROW1.map((track, i) => (
            <TrackPill key={i} {...track} />
          ))}
        </div>
      </div>

      {/* Row 2 — reverse */}
      <div className="relative flex overflow-hidden">
        <div
          className="flex gap-10"
          style={{ animation: 'marquee 26s linear infinite reverse', width: 'max-content' }}
        >
          {DOUBLED_ROW2.map((track, i) => (
            <TrackPill key={i} {...track} />
          ))}
        </div>
      </div>
    </section>
  );
}
