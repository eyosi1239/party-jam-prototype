import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { useState } from 'react';

interface HostPlayerControlsProps {
  albumArt: string;
  title: string;
  artist: string;
  isPlaying?: boolean;
  currentTime?: string;
  totalTime?: string;
  progress?: number;
  volume?: number;
  onPlayPause?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  onVolumeChange?: (volume: number) => void;
}

export function HostPlayerControls({ 
  albumArt,
  title, 
  artist,
  isPlaying = false,
  currentTime = '0:00',
  totalTime = '3:45',
  progress = 0,
  volume = 70,
  onPlayPause,
  onSkip,
  onBack,
  onVolumeChange
}: HostPlayerControlsProps) {
  const [currentVolume, setCurrentVolume] = useState(volume);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setCurrentVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl p-8">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Album Art */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-[#00ff41] blur-2xl opacity-20"></div>
          <img 
            src={albumArt} 
            alt={`${title} album art`}
            className="relative w-48 h-48 rounded-3xl object-cover shadow-2xl"
          />
        </div>

        {/* Player Info & Controls */}
        <div className="flex-1 w-full">
          {/* Song Info */}
          <div className="mb-6">
            <div className="text-xs text-[#00ff41] mb-2 font-medium tracking-wider">NOW PLAYING</div>
            <h2 className="text-3xl text-white font-medium mb-2">{title}</h2>
            <p className="text-xl text-[#9ca3af]">{artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-[#00ff41] rounded-full transition-all duration-300 shadow-lg shadow-[#00ff41]/50"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-[#9ca3af]">
              <span>{currentTime}</span>
              <span>{totalTime}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-3 rounded-2xl text-[#00ff41] hover:bg-[#00ff41]/10 transition-all duration-200"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={onPlayPause}
              className="p-5 rounded-2xl bg-[#00ff41] text-black hover:bg-[#00e639] transition-all duration-200 shadow-lg shadow-[#00ff41]/30"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>

            <button
              onClick={onSkip}
              className="p-3 rounded-2xl text-[#00ff41] hover:bg-[#00ff41]/10 transition-all duration-200"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4">
            <Volume2 className="w-5 h-5 text-[#9ca3af]" />
            <input
              type="range"
              min="0"
              max="100"
              value={currentVolume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-[#1a1a1a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00ff41] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#00ff41]/50"
            />
            <span className="text-[#9ca3af] text-sm w-12 text-right">{currentVolume}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
