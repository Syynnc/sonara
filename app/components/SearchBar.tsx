'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

const PROMPTS = [
  'Search for Kendrick Lamar...',
  'Search for lo-fi jazz beats...',
  'Search for indie artists from Chicago...',
  'Search for something like Bon Iver...',
  'Search for 90s R&B classics...',
  'Search for ambient electronic...',
];

const GENRE_CHIPS = ['Hip-Hop', 'Indie', 'Jazz', 'Electronic', 'R&B', 'Alternative', 'Soul', 'Neo-Soul'];

export function SearchBar() {
  const [placeholder, setPlaceholder] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused) return;

    const currentPrompt = PROMPTS[promptIndex];

    if (isPaused) {
      const t = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(t);
    }

    const speed = isDeleting ? 35 : 65;
    const t = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentPrompt.length) {
          setPlaceholder(currentPrompt.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        } else {
          setIsPaused(true);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(currentPrompt.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        } else {
          setIsDeleting(false);
          setPromptIndex((i) => (i + 1) % PROMPTS.length);
        }
      }
    }, speed);

    return () => clearTimeout(t);
  }, [charIndex, isDeleting, isPaused, promptIndex, isFocused]);

  return (
    <div className="w-full max-w-xl">
      <div
        className={`relative transition-transform duration-300 ${
          isFocused ? 'scale-[1.015]' : 'scale-100'
        }`}
      >
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1DB954]/50 pointer-events-none z-10">
          <Search size={19} strokeWidth={1.5} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-[#181818]/80 backdrop-blur-md border border-[#282828] rounded-2xl py-4 pl-14 pr-6 text-[#FFFFFF] placeholder:text-[#B3B3B3]/40 focus:outline-none focus:border-[#1DB954]/40 focus:bg-[#181818] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.45)] text-[15px]"
        />

        {/* Blinking cursor after placeholder when not focused and not typing */}
        {!isFocused && !value && (
          <span
            className="absolute pointer-events-none"
            style={{
              left: `${56 + placeholder.length * 8.4}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.5px',
              height: '16px',
              backgroundColor: 'rgba(29,185,84,0.5)',
              animation: 'cursor-blink 1.1s step-end infinite',
            }}
          />
        )}

        {value && (
          <button
            onClick={() => {}}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#1DB954] text-[#121212] text-sm font-semibold rounded-xl hover:bg-[#1ed760] transition-colors active:scale-[0.97]"
          >
            Search
          </button>
        )}
      </div>

      {/* Genre chips — slide in on focus */}
      <div
        className="flex flex-wrap gap-2 mt-3 transition-all duration-300"
        style={{
          opacity: isFocused ? 1 : 0,
          transform: isFocused ? 'translateY(0)' : 'translateY(-6px)',
          pointerEvents: isFocused ? 'auto' : 'none',
        }}
      >
        {GENRE_CHIPS.map((genre) => (
          <button
            key={genre}
            onMouseDown={(e) => {
              e.preventDefault();
              setValue(genre);
            }}
            className="px-3 py-1 text-xs font-medium text-[#B3B3B3] bg-[#181818]/60 border border-[#282828] rounded-full hover:border-[#1DB954]/40 hover:text-[#1DB954] transition-all duration-200 backdrop-blur-sm"
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
