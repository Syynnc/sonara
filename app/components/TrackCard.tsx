import type { SpotifyTrack } from '@/lib/spotify/types';

export function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface TrackCardProps {
  track: SpotifyTrack;
  rank?: number;
  /** If provided, clicking the + button calls this with the track */
  onAdd?: (track: SpotifyTrack) => void;
}

export function TrackCard({ track, rank, onAdd }: TrackCardProps) {
  const image = track.album.images[1]?.url ?? track.album.images[0]?.url;
  const artists = track.artists.map((a) => a.name).join(', ');

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#242424] transition-colors group">
      {rank !== undefined && (
        <span className="text-xs font-mono text-[#B3B3B3]/30 w-5 text-right shrink-0 tabular-nums">
          {rank}
        </span>
      )}

      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#282828]">
        {image && (
          <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#FFFFFF]/85 truncate leading-tight group-hover:text-[#FFFFFF] transition-colors">
          {track.name}
        </p>
        <p className="text-xs text-[#B3B3B3]/50 truncate mt-0.5">{artists}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-mono text-[#B3B3B3]/35 tabular-nums">
          {formatDuration(track.duration_ms)}
        </span>

        {onAdd && (
          <button
            onClick={() => onAdd(track)}
            className="w-6 h-6 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center text-[#1DB954] opacity-0 group-hover:opacity-100 hover:bg-[#1DB954]/20 transition-all duration-150 active:scale-90 text-xs font-bold"
            aria-label={`Add ${track.name} to playlist`}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
