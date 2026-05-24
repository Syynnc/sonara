'use client';

import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

// Bar opacity is derived from height index (static, matches BAR_HEIGHTS order)
const BAR_OPACITIES = [
  0.59, 0.78, 0.64, 0.93, 0.55, 0.87, 0.73, 1.00, 0.61, 0.85,
  0.69, 0.96, 0.57, 0.90, 0.67, 0.98, 0.56, 0.83, 0.74, 0.92,
  0.63, 0.88, 0.65, 0.95, 0.59, 0.81, 0.71, 0.91, 0.64, 0.97,
  0.57, 0.87,
];

const BARS = Array.from({ length: 32 }, (_, i) => ({
  hClass:     `bar-h-${i}`,
  dClass:     `bar-d-${i % 12}`,
  delayClass: `bar-delay-${i % 12}`,
  opacity:    BAR_OPACITIES[i],
}));

export function NowPlayingCard() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="bg-[#181818] border border-[#282828] rounded-3xl p-7 flex flex-col gap-6 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.55)] h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-[#FF5500]/55 uppercase mb-1">
            Now Playing
          </p>
          <h3 className="text-lg font-bold text-[#FFFFFF] tracking-tight leading-tight">North Tide</h3>
          <p className="text-sm text-[#B3B3B3]/60 mt-0.5">Folarin Osei — Quiet Signal</p>
        </div>
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#282828] shrink-0">
          <img src="https://picsum.photos/seed/NT8x2/48/48" alt="Album art" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Waveform bars */}
      <div className={`flex items-end justify-center gap-[3px] h-16 px-2 ${isPlaying ? 'waveform-playing' : ''}`}>
        {BARS.map(({ hClass, dClass, delayClass, opacity }, i) => (
          <div
            key={i}
            className={`waveform-bar ${hClass} ${dClass} ${delayClass}`}
            style={{ opacity }}
          />
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="h-0.5 bg-[#282828] rounded-full overflow-hidden">
          <div className={`h-full bg-[#FF5500] rounded-full ${isPlaying ? 'progress-bar-playing' : 'progress-bar-paused'}`} />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[#B3B3B3]/40">
          <span>1:23</span><span>3:47</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Volume"
          className="p-2 text-[#B3B3B3]/40 hover:text-[#B3B3B3] transition-colors"
        >
          <Volume2 size={16} strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Previous track"
            className="text-[#B3B3B3]/60 hover:text-[#FFFFFF] transition-colors active:scale-95"
          >
            <SkipBack size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-[#FF5500] flex items-center justify-center hover:bg-[#FF6820] transition-all duration-200 active:scale-95 shadow-[0_4px_16px_rgba(255,85,0,0.3)]"
          >
            {isPlaying
              ? <Pause size={16} fill="#fff" className="text-white" />
              : <Play  size={16} fill="#fff" className="text-white translate-x-[1px]" />
            }
          </button>
          <button
            type="button"
            aria-label="Next track"
            className="text-[#B3B3B3]/60 hover:text-[#FFFFFF] transition-colors active:scale-95"
          >
            <SkipForward size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="w-8" />
      </div>
    </div>
  );
}
