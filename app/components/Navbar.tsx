'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Headphones } from 'lucide-react';
import { AuthButton } from './AuthButton';

const NAV_LINKS = [
  { label: 'Search', href: '/search' },
  { label: 'Playlists', href: '/playlists' },
  { label: 'Dashboard', href: '/dashboard' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-4">
        {/* Separate background element — only opacity is transitioned to avoid discrete-property jumps */}
        <div
          className="absolute inset-0 bg-[#141414]/95 backdrop-blur-xl border-b border-[#2a2a2a] transition-opacity duration-300"
          style={{ opacity: scrolled ? 1 : 0 }}
        />

        <div className="relative max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center">
              <Headphones size={15} className="text-[#d4af37]" strokeWidth={1.5} />
            </div>
            <span className="font-bold tracking-[0.2em] text-sm text-[#f0e6c8] uppercase">
              Sonara
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="relative px-4 py-2 text-sm font-medium text-[#c8b87a] hover:text-[#f0e6c8] transition-colors duration-200 group"
              >
                {label}
                <span className="absolute bottom-1 left-4 right-4 h-px bg-[#d4af37] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex">
              <AuthButton />
            </div>
            <button
              className="md:hidden p-2 text-[#c8b87a] hover:text-[#f0e6c8] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#141414]/98 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col items-center gap-7">
          {NAV_LINKS.map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              style={{
                animation: mobileOpen
                  ? `fade-up 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`
                  : 'none',
              }}
              className="text-3xl font-bold text-[#c8b87a] hover:text-[#d4af37] transition-colors tracking-tight"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <div
            className="mt-4"
            style={{
              animation: mobileOpen
                ? `fade-up 0.4s cubic-bezier(0.16,1,0.3,1) ${NAV_LINKS.length * 60}ms both`
                : 'none',
            }}
          >
            <AuthButton />
          </div>
        </nav>
      </div>
    </>
  );
}
