import { NowPlayingCard } from './NowPlayingCard';
import { TrendingList } from './TrendingList';
import { ArtistTiltCard } from './ArtistTiltCard';
import { StatsCard } from './StatsCard';

export function BentoSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* Section header */}
      <div className="mb-12">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-[#FF5500]/50 uppercase mb-3">
          What's inside
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-[#FFFFFF] leading-tight max-w-[18ch]">
          Your sonic universe, always in motion.
        </h2>
      </div>

      {/* Bento grid — asymmetric 3-col */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Row 1: Now Playing (2fr) | Trending (1fr) */}
        <div className="md:col-span-2">
          <NowPlayingCard />
        </div>
        <div className="md:col-span-1">
          <TrendingList />
        </div>

        {/* Row 2: Stats (1fr) | Featured Artist (2fr) */}
        <div className="md:col-span-1">
          <StatsCard />
        </div>
        <div className="md:col-span-2">
          <ArtistTiltCard />
        </div>
      </div>
    </section>
  );
}
