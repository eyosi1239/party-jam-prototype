import { MoreVertical, Plus } from 'lucide-react';
import { useState } from 'react';

interface SongCardProps {
  albumArt: string;
  title: string;
  artist: string;
  tags?: string[];
  onAdd?: () => void;
  onMenuClick?: () => void;
}

export function SongCard({ albumArt, title, artist, tags = [], onAdd, onMenuClick }: SongCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    onAdd?.();
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-2xl p-4 hover:border-[#00ff41]/30 transition-all duration-200 group">
      <div className="flex gap-4">
        {/* Album Art */}
        <div className="flex-shrink-0">
          <img 
            src={albumArt} 
            alt={`${title} album art`}
            className="w-16 h-16 rounded-xl object-cover"
          />
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{title}</h3>
          <p className="text-[#9ca3af] text-sm truncate">{artist}</p>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-0.5 rounded-md bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className={`p-2 rounded-xl border-2 transition-all duration-200 ${
              isAdding
                ? 'bg-[#00ff41] border-[#00ff41] text-black'
                : 'border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-[#6b7280] hover:text-[#00ff41] hover:bg-[#1a1a1a] transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
