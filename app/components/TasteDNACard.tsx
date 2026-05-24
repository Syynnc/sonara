'use client';

import { useEffect, useRef } from 'react';

export interface AudioFeatureSet {
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
}

export interface GenreEntry {
  name: string;
  count: number;
  pct: number;
}

// ── Radar Chart (hexagon grid, 6 axes) ────────────────────────────────────────
function RadarChart({ f }: { f: AudioFeatureSet }) {
  const DIMS = [
    { key: 'energy',           label: 'Energy'    },
    { key: 'danceability',     label: 'Dance'     },
    { key: 'valence',          label: 'Mood'      },
    { key: 'acousticness',     label: 'Acoustic'  },
    { key: 'instrumentalness', label: 'Instru.'   },
    { key: 'speechiness',      label: 'Speech'    },
  ] as const;

  const n = DIMS.length, cx = 110, cy = 110, r = 82;

  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const axisX = (i: number, pct = 1) => cx + Math.cos(angle(i)) * r * pct;
  const axisY = (i: number, pct = 1) => cy + Math.sin(angle(i)) * r * pct;

  const pts = DIMS.map((d, i) => ({
    vx: axisX(i, f[d.key]),
    vy: axisY(i, f[d.key]),
    lx: axisX(i, 1.27),
    ly: axisY(i, 1.27),
    label: d.label,
  }));

  return (
    <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden>
      {/* Grid polygons at 25/50/75/100% */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <polygon
          key={pct}
          points={DIMS.map((_, i) => `${axisX(i, pct)},${axisY(i, pct)}`).join(' ')}
          fill="none"
          stroke={pct === 1 ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)'}
          strokeWidth="1"
        />
      ))}
      {/* Axis spokes */}
      {DIMS.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={axisX(i)} y2={axisY(i)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      {/* Data polygon */}
      <polygon
        points={pts.map((p) => `${p.vx},${p.vy}`).join(' ')}
        fill="rgba(255,85,0,0.13)"
        stroke="#FF5500"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Vertex dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.vx} cy={p.vy} r="3" fill="#FF5500" />
      ))}
      {/* Axis labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.32)" fontSize="8.5" fontFamily="inherit">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// ── Genre Donut ───────────────────────────────────────────────────────────────
const DONUT_COLORS = ['#FF5500','#FF7A3D','#CC4400','#FF9966','#E84400','#B84000'];

function GenreDonut({ genres }: { genres: GenreEntry[] }) {
  const cx = 70, cy = 70, r = 56, ir = 34;
  const total = genres.reduce((s, g) => s + g.count, 0);
  let a = -Math.PI / 2;

  const slices = genres.map((g, i) => {
    const pct = g.count / total;
    const sa = a; a += pct * 2 * Math.PI; const ea = a;
    const x1 = cx + Math.cos(sa) * r, y1 = cy + Math.sin(sa) * r;
    const x2 = cx + Math.cos(ea) * r, y2 = cy + Math.sin(ea) * r;
    const xi1 = cx + Math.cos(sa) * ir, yi1 = cy + Math.sin(sa) * ir;
    const xi2 = cx + Math.cos(ea) * ir, yi2 = cy + Math.sin(ea) * ir;
    const lg = pct > 0.5 ? 1 : 0;
    return {
      d: `M${xi1} ${yi1}L${x1} ${y1}A${r} ${r} 0 ${lg} 1 ${x2} ${y2}L${xi2} ${yi2}A${ir} ${ir} 0 ${lg} 0 ${xi1} ${yi1}Z`,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
      name: g.name, pct,
    };
  });

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden>
      {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
      <text x={cx} y={cy - 5} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="11" fontWeight="700">{genres.length}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="7.5">genres</text>
    </svg>
  );
}

// ── Trait Bar ─────────────────────────────────────────────────────────────────
function TraitBar({ label, value }: { label: string; value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.style.setProperty('--tw', `${Math.round(value * 100)}%`); }, [value]);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-white/30 w-[72px] shrink-0">{label}</span>
      <div className="flex-1 h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
        <div ref={ref} className="taste-trait-bar h-full rounded-full bg-gradient-to-r from-[#E84800] to-[#FF6A2A]" />
      </div>
      <span className="text-[10px] font-mono text-white/25 w-7 text-right tabular-nums">{Math.round(value * 100)}</span>
    </div>
  );
}

// ── Exported component ────────────────────────────────────────────────────────
export interface TasteDNACardProps {
  features: AudioFeatureSet | null;
  genres: GenreEntry[];
  loading?: boolean;
}

const TRAITS: { label: string; key: keyof AudioFeatureSet }[] = [
  { label: 'Energy',       key: 'energy'           },
  { label: 'Danceability', key: 'danceability'      },
  { label: 'Mood',         key: 'valence'           },
  { label: 'Acoustic',     key: 'acousticness'      },
  { label: 'Instru.',      key: 'instrumentalness'  },
];

export function TasteDNACard({ features, genres, loading }: TasteDNACardProps) {
  if (loading) {
    return (
      <div className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-[2rem]">
        <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] p-6">
          <div className="h-[180px] bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }
  if (!features) return null;

  return (
    <div className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-[2rem]">
      <div className="bg-[#0B0B0B] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-6">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Left — Radar */}
          <div className="flex items-center justify-center shrink-0">
            <RadarChart f={features} />
          </div>

          {/* Right — Traits + Donut */}
          <div className="flex-1 flex flex-col gap-5 justify-center">
            <div className="space-y-3">
              {TRAITS.map((t) => (
                <TraitBar key={t.key} label={t.label} value={features[t.key]} />
              ))}
            </div>

            {genres.length > 0 && (
              <div className="flex items-center gap-4 pt-4 border-t border-white/[0.04]">
                <GenreDonut genres={genres.slice(0, 6)} />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  {genres.slice(0, 5).map((g, i) => (
                    <div key={g.name} className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: DONUT_COLORS[i] }}
                      />
                      <span className="text-[10px] text-white/38 truncate capitalize flex-1">{g.name}</span>
                      <span className="text-[10px] font-mono text-white/20 shrink-0">{Math.round(g.pct * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
