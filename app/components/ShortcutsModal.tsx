'use client';

const SHORTCUTS = [
  { keys: ['Space'],    action: 'Play / Pause'      },
  { keys: ['→'],        action: 'Next track'         },
  { keys: ['←'],        action: 'Previous track'     },
  { keys: ['K'],        action: 'Focus search'       },
  { keys: ['P'],        action: 'Toggle player'      },
  { keys: ['?'],        action: 'Show shortcuts'     },
  { keys: ['Esc'],      action: 'Close / dismiss'    },
];

export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />

      {/* Card */}
      <div
        className="relative p-2 bg-white/[0.04] border border-white/[0.08] rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.8)] w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0D0D0D] rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.05]">
            <div className="p-[1.5px] bg-white/[0.03] border border-white/[0.05] rounded-full">
              <div className="px-3 py-1 bg-[#0A0A0A] rounded-full">
                <span className="text-[9px] font-bold tracking-[0.28em] text-[#FF5500]/60 uppercase">Keyboard Shortcuts</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close shortcuts"
              className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/25 hover:text-white/60 transition-colors duration-300"
            >
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
              </svg>
            </button>
          </div>

          {/* Shortcut list */}
          <div className="px-5 py-4 space-y-2.5">
            {SHORTCUTS.map((s) => (
              <div key={s.action} className="flex items-center justify-between gap-4">
                <span className="text-xs text-white/40">{s.action}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd key={k} className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.09] rounded-lg text-[10px] font-mono text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="px-5 pb-5 pt-1">
            <p className="text-[9px] text-white/15 text-center">Press <kbd className="font-mono text-white/25">?</kbd> anytime to show this</p>
          </div>
        </div>
      </div>
    </div>
  );
}
