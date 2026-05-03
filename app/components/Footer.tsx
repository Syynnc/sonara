import { Headphones } from 'lucide-react';

const LINKS = {
  Discover: ['Trending', 'New Releases', 'Playlists', 'Artists', 'Genres'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Settings'],
};

const SOCIAL = [
  {
    label: 'X / Twitter',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.021C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#282828] bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top row: brand + links */}
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12 mb-14">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#1DB954]/10 border border-[#1DB954]/25 flex items-center justify-center">
                <Headphones size={15} className="text-[#1DB954]" strokeWidth={1.5} />
              </div>
              <span className="font-bold tracking-[0.2em] text-sm text-[#FFFFFF] uppercase">
                Sonara
              </span>
            </div>
            <p className="text-sm text-[#B3B3B3]/55 leading-relaxed max-w-[30ch]">
              Mapping the acoustic space between what you know and what you&apos;ll love.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-7">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-[#181818] border border-[#282828] flex items-center justify-center text-[#B3B3B3]/40 hover:text-[#1DB954] hover:border-[#1DB954]/30 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-[#1DB954]/50 uppercase mb-5">
                {heading}
              </p>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[#B3B3B3]/55 hover:text-[#FFFFFF] transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-[#282828] pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-[#B3B3B3]/30">
            &copy; {new Date().getFullYear()} Sonara. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"
              style={{ animation: 'pulse-dot 2.5s ease-in-out infinite' }}
            />
            <p className="text-xs text-[#B3B3B3]/30">
              All systems operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
