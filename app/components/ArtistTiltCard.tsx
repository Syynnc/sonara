'use client';

import { useRef } from 'react';
import { Music } from 'lucide-react';

const GENRE_TAGS = ['Neo-Soul', 'Electronic', 'Ambient'];
const STATS = [
  { label: 'Monthly listeners', value: '2.4M' },
  { label: 'Tracks indexed', value: '84' },
  { label: 'Avg. BPM', value: '91.3' },
];

export function ArtistTiltCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -5;
    const rotY = ((x - cx) / cx) * 5;
    card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`;
    card.style.transition = 'transform 0.08s ease-out';
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-[#181818] border border-[#282828] rounded-3xl overflow-hidden shadow-[0_20px_48px_-12px_rgba(0,0,0,0.55)] h-full cursor-default"
      style={{ willChange: 'transform' }}
    >
      {/* Image banner */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="https://picsum.photos/seed/NaraK9/800/320"
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.55) saturate(0.7)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#181818]" />

        {/* Float badge */}
        <div
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-[#121212]/70 backdrop-blur-md border border-[#1DB954]/20 rounded-full"
          style={{ animation: 'float 3.5s ease-in-out infinite' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#1DB954]"
            style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
          />
          <span className="text-[10px] font-semibold tracking-widest text-[#1DB954] uppercase">
            Featured
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-7 pt-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#FFFFFF] tracking-tight leading-tight">
              Nara Kessler
            </h3>
            <p className="text-sm text-[#B3B3B3]/55 mt-1 leading-snug max-w-[42ch]">
              Lagos-born composer and producer blending West African polyrhythms with synthesized textures.
            </p>
          </div>
          <button className="shrink-0 w-10 h-10 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center hover:bg-[#1DB954]/20 transition-colors">
            <Music size={15} className="text-[#1DB954]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Genre tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {GENRE_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-[10px] font-medium tracking-wide text-[#B3B3B3]/60 bg-[#121212] border border-[#282828] rounded-full uppercase"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 border-t border-[#282828] pt-5">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-base font-bold font-mono text-[#FFFFFF]/85 tracking-tight">
                {stat.value}
              </p>
              <p className="text-[10px] text-[#B3B3B3]/40 mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
