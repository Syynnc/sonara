'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthButton } from './AuthButton';

const LANDING_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About',        href: '#about' },
];

const APP_ROUTES = ['/dashboard', '/search', '/playlists', '/login'];

function HeadphonesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

export function Navbar() {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  if (APP_ROUTES.some((r) => pathname.startsWith(r))) return null;

  const isLanding = pathname === '/';
  const links     = isLanding ? LANDING_LINKS : [{ label: 'Dashboard', href: '/dashboard' }];

  // Lock body scroll when overlay open
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Floating island pill ──────────────────────────────────────────── */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-40 w-max">
        <div className="
          flex items-center gap-1 px-2 py-2
          bg-[#0A0A0A]/75 border border-white/[0.07]
          rounded-full backdrop-blur-2xl
          shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_8px_40px_rgba(0,0,0,0.7)]
        ">

          {/* Logo */}
          <a
            href="/"
            className="
              flex items-center gap-2.5 px-3.5 py-1.5 rounded-full
              hover:bg-white/[0.05]
              transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            "
          >
            <div className="w-6 h-6 rounded-full bg-[#FF5500]/15 flex items-center justify-center text-[#FF5500]">
              <HeadphonesIcon />
            </div>
            <span className="font-semibold tracking-[0.18em] text-[11px] text-white uppercase">
              Sonara
            </span>
          </a>

          {/* Pill divider */}
          <div className="w-px h-4 bg-white/[0.07] mx-0.5" />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="
                  px-4 py-1.5 text-[11px] font-medium text-white/45
                  hover:text-white rounded-full hover:bg-white/[0.05]
                  transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                "
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block w-px h-4 bg-white/[0.07] mx-0.5" />

          {/* Auth — desktop */}
          <div className="hidden md:flex px-1">
            <AuthButton />
          </div>

          {/* Hamburger — mobile */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="
              md:hidden relative w-9 h-9 flex items-center justify-center
              rounded-full hover:bg-white/[0.05]
              transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            "
          >
            {/* Line 1 */}
            <span
              className={`
                absolute w-[18px] h-[1.5px] bg-white rounded-full
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${open ? 'rotate-45 translate-y-0' : '-translate-y-[5px]'}
              `}
            />
            {/* Line 2 */}
            <span
              className={`
                absolute w-[18px] h-[1.5px] bg-white rounded-full
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${open ? '-rotate-45 translate-y-0' : 'translate-y-[5px]'}
              `}
            />
          </button>
        </div>
      </header>

      {/* ── Mobile fullscreen overlay ─────────────────────────────────────── */}
      <div
        className={`
          fixed inset-0 z-30 bg-[#030303]/96 backdrop-blur-3xl
          flex flex-col items-center justify-center md:hidden
          transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <nav className="flex flex-col items-center gap-2 w-full px-8">
          {links.map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${80 + i * 55}ms` : '0ms' }}
              className={`
                text-[2.8rem] font-bold tracking-tighter text-white/20
                hover:text-[#FF5500] w-full text-center py-2
                transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
              `}
            >
              {label}
            </a>
          ))}

          <div
            style={{ transitionDelay: open ? `${80 + links.length * 55}ms` : '0ms' }}
            className={`
              mt-10
              transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
              ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
            `}
          >
            <AuthButton />
          </div>
        </nav>

        {/* Ambient orb */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] rounded-full bg-[#FF5500]/[0.04] blur-3xl pointer-events-none" />
      </div>
    </>
  );
}
