const STATS = [
  { value: '3.1M', label: 'Tracks indexed', sub: 'across 94 genres' },
  { value: '184K', label: 'Artists catalogued', sub: 'from 61 countries' },
  { value: '47ms', label: 'Avg. search latency', sub: 'p95 response time' },
  { value: '98.3%', label: 'Match accuracy', sub: 'on acoustic search' },
];

export function StatsCard() {
  return (
    <div className="bg-[#181818] border border-[#282828] rounded-3xl p-7 flex flex-col gap-6 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.55)] h-full">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.25em] text-[#FF5500]/55 uppercase mb-1">
          Platform Stats
        </p>
        <h3 className="text-lg font-bold text-[#FFFFFF] tracking-tight">By the numbers</h3>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              animation: `count-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
            }}
          >
            <p className="text-2xl font-bold font-mono text-[#FFFFFF]/90 tracking-tighter leading-none">
              {stat.value}
            </p>
            <p className="text-xs font-medium text-[#B3B3B3]/65 mt-1 leading-tight">
              {stat.label}
            </p>
            <p className="text-[10px] text-[#B3B3B3]/35 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Decorative separator */}
      <div className="mt-auto pt-4 border-t border-[#282828]">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-orange-500/70"
            style={{ animation: 'pulse-dot 2.5s ease-in-out infinite' }}
          />
          <p className="text-[10px] text-[#B3B3B3]/40">
            Index updated <span className="text-[#FFFFFF]/50">3 minutes ago</span>
          </p>
        </div>
      </div>
    </div>
  );
}
