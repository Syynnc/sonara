import type { SpotifyArtist } from '@/lib/spotify/types';

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

export function SearchArtistCard({ artist }: { artist: SpotifyArtist }) {
  const image = artist.images?.[0]?.url;
  const primaryGenre = artist.genres?.[0];

  return (
    <a
      href={artist.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-[#242424] transition-colors group text-center cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-[#282828] border-2 border-[#282828] group-hover:border-[#FF5500]/30 transition-colors shrink-0">
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#B3B3B3]/30 text-xl font-bold">
            {artist.name[0]}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-[#FFFFFF]/85 leading-tight truncate max-w-[100px] group-hover:text-[#FFFFFF] transition-colors">
          {artist.name}
        </p>
        <p className="text-xs text-[#B3B3B3]/40 mt-0.5 tabular-nums">
          {artist.followers?.total != null ? formatFollowers(artist.followers.total) : ''}
        </p>
      </div>

      {primaryGenre && (
        <span className="text-[9px] font-semibold text-[#FF5500]/55 bg-[#FF5500]/8 border border-[#FF5500]/15 px-2 py-0.5 rounded-full uppercase tracking-widest truncate max-w-[110px]">
          {primaryGenre}
        </span>
      )}
    </a>
  );
}
