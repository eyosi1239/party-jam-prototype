import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { useState } from 'react';

interface PlayerBarProps {
  albumArt?: string;
  title: string;
  artist: string;
  isPlaying?: boolean;
  progress?: number;
  isHost?: boolean;
  onPlayPause?: () => void;
  onSkip?: () => void;
}

export function PlayerBar({ 
  albumArt,
  title, 
  artist, 
  isPlaying = false,
  progress = 0,
  isHost = false,
  onPlayPause,
  onSkip
}: PlayerBarProps) {
  const [showHostTooltip, setShowHostTooltip] = useState(false);

  return (
    <div className="bg-gradient-to-t from-[#0a0a0a] to-[#050505] border-t border-[#1a1a1a] px-4 py-3">
      <div className="max-w-[1400px] mx-auto">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-[#1a1a1a] rounded-full mb-3 overflow-hidden">
          <div 
            className="h-full bg-[#00ff41] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-4">
          {/* Album Art & Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {albumArt && (
              <img 
                src={albumArt} 
                alt={`${title} album art`}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <h4 className="text-white text-sm font-medium truncate">{title}</h4>
              <p className="text-[#9ca3af] text-xs truncate">{artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPlayPause}
              className="p-2 rounded-xl bg-[#00ff41] text-black hover:bg-[#00e639] transition-all duration-200"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={isHost ? onSkip : undefined}
                onMouseEnter={() => !isHost && setShowHostTooltip(true)}
                onMouseLeave={() => setShowHostTooltip(false)}
                disabled={!isHost}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isHost
                    ? 'text-[#00ff41] hover:bg-[#00ff41]/10'
                    : 'text-[#6b7280] cursor-not-allowed'
                }`}
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {showHostTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs text-[#9ca3af] whitespace-nowrap">
                  Host only
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#1a1a1a] border-r border-b border-[#2a2a2a] rotate-45" />
                </div>
              )}
            </div>

            <button className="p-2 rounded-xl text-[#9ca3af] hover:text-[#00ff41] hover:bg-[#1a1a1a] transition-all duration-200 hidden sm:block">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
