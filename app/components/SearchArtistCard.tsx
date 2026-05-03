import type { SpotifyArtist } from '@/lib/spotify/types';

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

export function SearchArtistCard({ artist }: { artist: SpotifyArtist }) {
  const image = artist.images[0]?.url;
  const primaryGenre = artist.genres[0];

  return (
    <a
      href={artist.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-[#1e1e1e] transition-colors group text-center cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-[#2a2a2a] border-2 border-[#2a2a2a] group-hover:border-[#d4af37]/30 transition-colors shrink-0">
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#c8b87a]/30 text-xl font-bold">
            {artist.name[0]}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-[#f0e6c8]/85 leading-tight truncate max-w-[100px] group-hover:text-[#f0e6c8] transition-colors">
          {artist.name}
        </p>
        <p className="text-xs text-[#c8b87a]/40 mt-0.5 tabular-nums">
          {formatFollowers(artist.followers.total)}
        </p>
      </div>

      {primaryGenre && (
        <span className="text-[9px] font-semibold text-[#d4af37]/55 bg-[#d4af37]/8 border border-[#d4af37]/15 px-2 py-0.5 rounded-full uppercase tracking-widest truncate max-w-[110px]">
          {primaryGenre}
        </span>
      )}
    </a>
  );
}
