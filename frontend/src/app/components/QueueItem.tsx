import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface QueueItemProps {
  position: number;
  title: string;
  artist: string;
  upvotes: number;
  isNowPlaying?: boolean;
  hasUpvoted?: boolean;
  onUpvote?: () => void;
  onDownvote?: () => void;
  allowDownvotes?: boolean;
}

export function QueueItem({
  position,
  title,
  artist,
  upvotes,
  isNowPlaying = false,
  hasUpvoted = false,
  onUpvote,
  onDownvote,
  allowDownvotes = false
}: QueueItemProps) {
  const [voted, setVoted] = useState(hasUpvoted);

  const handleUpvote = () => {
    setVoted(!voted);
    onUpvote?.();
  };

  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
      isNowPlaying 
        ? 'bg-gradient-to-r from-[#00ff41]/10 to-transparent border border-[#00ff41]/30 shadow-lg shadow-[#00ff41]/10' 
        : 'hover:bg-[#0a0a0a]'
    }`}>
      {/* Position */}
      <div className={`w-6 text-center flex-shrink-0 ${
        isNowPlaying ? 'text-[#00ff41] font-medium' : 'text-[#6b7280]'
      }`}>
        {isNowPlaying ? '▶' : position}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        {isNowPlaying && (
          <div className="text-xs text-[#00ff41] mb-1 font-medium">NOW PLAYING</div>
        )}
        <h4 className="text-white text-sm font-medium truncate">{title}</h4>
        <p className="text-[#9ca3af] text-xs truncate">{artist}</p>
      </div>

      {/* Vote Buttons */}
      <div className="flex items-center gap-2">
        {allowDownvotes && (
          <button
            onClick={onDownvote}
            className="p-1 rounded-lg text-[#6b7280] hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleUpvote}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              voted
                ? 'bg-[#00ff41] text-black shadow-lg shadow-[#00ff41]/30'
                : 'text-[#6b7280] hover:text-[#00ff41] hover:bg-[#00ff41]/10'
            }`}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className={`text-xs font-medium ${
            voted ? 'text-[#00ff41]' : 'text-[#9ca3af]'
          }`}>
            {upvotes}
          </span>
        </div>
      </div>
    </div>
  );
}
