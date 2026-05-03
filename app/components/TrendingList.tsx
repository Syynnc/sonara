import { TrendingUp } from 'lucide-react';

const TRACKS = [
  { rank: 1, title: 'Midnight Frequency', artist: 'Nara Kessler', delta: '+3' },
  { rank: 2, title: 'Glass Cities', artist: 'Theo Vantis', delta: '+1' },
  { rank: 3, title: 'Saudade Drive', artist: 'Mireille Jacot', delta: '+7' },
  { rank: 4, title: 'North Tide', artist: 'Folarin Osei', delta: '—' },
  { rank: 5, title: 'Static Rain', artist: 'Cass Whitmore', delta: '+2' },
  { rank: 6, title: 'Rust & Gold', artist: 'Ines Barthel', delta: '+5' },
];

export function TrendingList() {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-7 flex flex-col gap-5 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.55)] h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp size={14} strokeWidth={1.5} className="text-[#d4af37]" />
        <p className="text-[10px] font-semibold tracking-[0.25em] text-[#d4af37]/55 uppercase">
          This Week
        </p>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-[#2a2a2a]">
        {TRACKS.map((track, i) => (
          <div
            key={track.rank}
            className="flex items-center gap-4 py-3 group cursor-pointer"
            style={{
              animation: `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
            }}
          >
            <span className="text-xs font-mono text-[#c8b87a]/30 w-4 text-right shrink-0">
              {track.rank}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f0e6c8]/80 group-hover:text-[#f0e6c8] transition-colors truncate leading-tight">
                {track.title}
              </p>
              <p className="text-xs text-[#c8b87a]/45 truncate mt-0.5">{track.artist}</p>
            </div>

            <span
              className={`text-[10px] font-mono shrink-0 ${
                track.delta === '—'
                  ? 'text-[#c8b87a]/30'
                  : 'text-emerald-500/70'
              }`}
            >
              {track.delta}
            </span>
          </div>
        ))}
      </div>

      <button className="text-xs font-medium text-[#c8b87a]/40 hover:text-[#d4af37] transition-colors text-left mt-auto">
        View full chart →
      </button>
    </div>
  );
}
