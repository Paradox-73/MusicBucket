import React from 'react';
import { Play, Pause, Music } from 'lucide-react';
import { UITrack, formatDuration } from './trackTypes';

interface TrackRowProps {
  track: UITrack;
  /** 1-based position label shown on the left (optional). */
  index?: number;
  isPlaying?: boolean;
  onTogglePlay?: (track: UITrack) => void;
  /** Optional action controls rendered on the right (remove, reorder, etc.). */
  actions?: React.ReactNode;
}

/**
 * Presentational row used to render a single track consistently across the
 * Daily Mix and Playlist Manager previews.
 */
const TrackRow: React.FC<TrackRowProps> = ({ track, index, isPlaying, onTogglePlay, actions }) => {
  const canPreview = Boolean(track.previewUrl);

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5 transition-colors hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 sm:gap-4 sm:p-3">
      {typeof index === 'number' && (
        <span className="w-5 shrink-0 text-right text-xs tabular-nums text-gray-400 sm:w-6 sm:text-sm">
          {index}
        </span>
      )}

      <div className="relative shrink-0">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt=""
            className="h-11 w-11 rounded-md object-cover sm:h-12 sm:w-12"
            loading="lazy"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-primary/30 to-secondary/30 sm:h-12 sm:w-12">
            <Music className="h-5 w-5 text-white/80" />
          </div>
        )}
        {onTogglePlay && (
          <button
            type="button"
            onClick={() => onTogglePlay(track)}
            disabled={!canPreview}
            title={canPreview ? 'Play 30s preview' : 'No preview available'}
            aria-label={canPreview ? 'Play preview' : 'No preview available'}
            className={`absolute inset-0 flex items-center justify-center rounded-md bg-black/50 text-white opacity-100 sm:opacity-0 transition-opacity focus:opacity-100 focus-visible:opacity-100 ${
              canPreview ? 'sm:hover:opacity-100' : 'cursor-not-allowed'
            } ${isPlaying ? 'opacity-100' : ''}`}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900 dark:text-white">{track.name}</p>
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">{track.artists}</p>
      </div>

      <span className="hidden shrink-0 text-sm tabular-nums text-gray-400 sm:inline">
        {formatDuration(track.durationMs)}
      </span>

      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
};

export default TrackRow;
