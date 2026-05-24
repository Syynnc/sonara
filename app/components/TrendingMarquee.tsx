const ROW1 = [
  { title: 'Gemini Rights',                          artist: 'Steve Lacy' },
  { title: 'Motomami',                               artist: 'Rosalía' },
  { title: 'The Melodic Blue',                       artist: 'Baby Keem' },
  { title: 'Dawn FM',                                artist: 'The Weeknd' },
  { title: 'Mr. Morale & the Big Steppers',          artist: 'Kendrick Lamar' },
  { title: 'Sometimes I Might Be Introvert',         artist: 'Little Simz' },
  { title: 'Promises',                               artist: 'Floating Points & Pharoah Sanders' },
  { title: 'Collapsed in Sunbeams',                  artist: 'Arlo Parks' },
];

const ROW2 = [
  { title: 'Javelin',                                artist: 'Sufjan Stevens' },
  { title: 'Desire, I Want to Turn Into You',        artist: 'Caroline Polachek' },
  { title: 'The Record',                             artist: 'boygenius' },
  { title: 'Guts',                                   artist: 'Olivia Rodrigo' },
  { title: 'Scaring the Hoes',                       artist: 'JPEGMAFIA & Danny Brown' },
  { title: 'Red Moon in Venus',                      artist: 'Kali Uchis' },
  { title: 'Orquídeas',                              artist: 'Kali Uchis' },
  { title: 'Radical Optimism',                       artist: 'Dua Lipa' },
];

const DOUBLED_ROW1 = [...ROW1, ...ROW1];
const DOUBLED_ROW2 = [...ROW2, ...ROW2];

function TrackPill({ title, artist }: { title: string; artist: string }) {
  return (
    <div className="flex items-center gap-3 shrink-0 group cursor-default">
      {/* Double-bezel dot */}
      <div className="p-[1px] bg-white/[0.06] rounded-full">
        <span className="block w-1 h-1 rounded-full bg-[#FF5500]/50 group-hover:bg-[#FF5500] transition-colors duration-300" />
      </div>
      <span className="text-sm font-medium text-white/50 group-hover:text-white/80 transition-colors duration-300">
        {title}
      </span>
      <span className="text-xs text-white/20 group-hover:text-white/40 transition-colors duration-300">
        — {artist}
      </span>
    </div>
  );
}

export function TrendingMarquee() {
  return (
    <section className="py-10 overflow-hidden bg-[#080808] border-y border-white/[0.05]">

      {/* Label */}
      <div className="flex items-center gap-5 mb-6 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#FF5500] animate-pulse-dot" />
          <span className="text-[9px] font-bold tracking-[0.32em] text-[#FF5500]/50 uppercase whitespace-nowrap">
            Trending Now
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
      </div>

      {/* Row 1 — forward */}
      <div className="relative flex overflow-hidden mb-3.5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="marquee-fwd flex gap-12 w-max">
          {DOUBLED_ROW1.map((track, i) => (
            <TrackPill key={i} {...track} />
          ))}
        </div>
      </div>

      {/* Row 2 — reverse */}
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="marquee-rev flex gap-12 w-max">
          {DOUBLED_ROW2.map((track, i) => (
            <TrackPill key={i} {...track} />
          ))}
        </div>
      </div>
    </section>
  );
}
