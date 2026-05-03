'use client';

import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const BAR_HEIGHTS = [38, 62, 44, 80, 32, 72, 54, 90, 40, 68, 50, 84, 36, 74, 48, 88, 34, 66, 56, 78, 42, 70, 46, 82, 38, 64, 52, 76, 44, 86, 36, 72];
const BAR_DURATIONS = [0.75, 1.05, 0.88, 1.25, 0.68, 1.12, 0.95, 1.35, 0.8, 1.0, 0.9, 1.2];
const BAR_DELAYS = [0, 0.28, 0.12, 0.44, 0.06, 0.38, 0.2, 0.52, 0.1, 0.34, 0.16, 0.48];

export function NowPlayingCard() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="bg-[#181818] border border-[#282828] rounded-3xl p-7 flex flex-col gap-6 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.55)] h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-[#1DB954]/55 uppercase mb-1">
            Now Playing
          </p>
          <h3 className="text-lg font-bold text-[#FFFFFF] tracking-tight leading-tight">
            North Tide
          </h3>
          <p className="text-sm text-[#B3B3B3]/60 mt-0.5">Folarin Osei — Quiet Signal</p>
        </div>
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#282828] shrink-0">
          <img
            src="https://picsum.photos/seed/NT8x2/48/48"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Waveform bars */}
      <div className="flex items-end justify-center gap-[3px] h-16 px-2">
        {BAR_HEIGHTS.map((maxH, i) => (
          <div
            key={i}
            className="rounded-full bg-[#1DB954]"
            style={{
              width: '3px',
              height: `${maxH}%`,
              transformOrigin: 'bottom',
              animationName: 'bar-dance',
              animationDuration: `${BAR_DURATIONS[i % BAR_DURATIONS.length]}s`,
              animationDelay: `${BAR_DELAYS[i % BAR_DELAYS.length]}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationPlayState: isPlaying ? 'running' : 'paused',
              opacity: 0.3 + (maxH / 90) * 0.7,
            }}
          />
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="h-0.5 bg-[#282828] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1DB954] rounded-full"
            style={{
              animation: isPlaying
                ? 'progress-fill 227s linear forwards'
                : 'none',
              width: isPlaying ? undefined : '36.8%',
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[#B3B3B3]/40">
          <span>1:23</span>
          <span>3:47</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button className="p-2 text-[#B3B3B3]/40 hover:text-[#B3B3B3] transition-colors">
          <Volume2 size={16} strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-4">
          <button className="text-[#B3B3B3]/60 hover:text-[#FFFFFF] transition-colors active:scale-95">
            <SkipBack size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center hover:bg-[#1ed760] transition-all duration-200 active:scale-95 shadow-[0_4px_16px_rgba(29,185,84,0.3)]"
          >
            {isPlaying ? (
              <Pause size={16} fill="#121212" className="text-[#121212]" />
            ) : (
              <Play size={16} fill="#121212" className="text-[#121212] translate-x-[1px]" />
            )}
          </button>
          <button className="text-[#B3B3B3]/60 hover:text-[#FFFFFF] transition-colors active:scale-95">
            <SkipForward size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="w-8" />
      </div>
    </div>
  );
}
