import { NavBar } from '@/app/components/NavBar';
import { FilterChip } from '@/app/components/FilterChip';
import { SongCard } from '@/app/components/SongCard';
import { QueueItem } from '@/app/components/QueueItem';
import { PlayerBar } from '@/app/components/PlayerBar';
import { Toast } from '@/app/components/Toast';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { PartyState } from '@/lib/types';

interface GuestViewProps {
  partyState: PartyState | null;
  onVote: (trackId: string, vote: 'UP' | 'DOWN' | 'NONE', context: 'QUEUE' | 'TESTING') => Promise<void>;
}

const mockRecommendations = [
  {
    id: 1,
    albumArt: 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    tags: ['For You', 'Trending']
  },
  {
    id: 2,
    albumArt: 'https://images.unsplash.com/photo-1703115015357-ba562d7dfd09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'Levitating',
    artist: 'Dua Lipa',
    tags: ['Trending']
  },
  {
    id: 3,
    albumArt: 'https://images.unsplash.com/photo-1697238724753-60c0c31132d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'good 4 u',
    artist: 'Olivia Rodrigo',
    tags: ['For You']
  },
  {
    id: 4,
    albumArt: 'https://images.unsplash.com/photo-1601643157091-ce5c665179ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'STAY',
    artist: 'The Kid LAROI & Justin Bieber',
    tags: ['Trending']
  },
  {
    id: 5,
    albumArt: 'https://images.unsplash.com/photo-1510809393-728d340e4eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'Heat Waves',
    artist: 'Glass Animals',
    tags: ['For You']
  },
  {
    id: 6,
    albumArt: 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'Save Your Tears',
    artist: 'The Weeknd & Ariana Grande',
    tags: ['Trending']
  }
];

const mockQueue = [
  { id: 1, position: 1, title: 'As It Was', artist: 'Harry Styles', upvotes: 12, isNowPlaying: true },
  { id: 2, position: 2, title: 'Anti-Hero', artist: 'Taylor Swift', upvotes: 8 },
  { id: 3, position: 3, title: 'Flowers', artist: 'Miley Cyrus', upvotes: 6 },
  { id: 4, position: 4, title: 'Kill Bill', artist: 'SZA', upvotes: 5 },
  { id: 5, position: 5, title: 'Vampire', artist: 'Olivia Rodrigo', upvotes: 4 }
];

export function GuestView({ partyState, onVote }: GuestViewProps) {
  const [selectedFilter, setSelectedFilter] = useState('Recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'recs' | 'queue'>('recs');

  // Use real party state or show loading
  if (!partyState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050505] flex items-center justify-center">
        <div className="text-white text-xl">Loading party...</div>
      </div>
    );
  }

  const queue = partyState.queue || [];
  const nowPlaying = partyState.nowPlaying;
  const { party } = partyState;

  const handleAddSong = () => {
    setShowToast(true);
  };

  const handleUpvote = (trackId: string) => {
    onVote(trackId, 'UP', 'QUEUE');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050505] flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#00ff41] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#00ff41] rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation */}
      <NavBar
        roomName={party.mood ? `${party.mood} Party` : 'Party Jam'}
        roomCode={party.partyId.slice(0, 6).toUpperCase()}
        onLeaveRoom={() => console.log('Leave room')}
        onSettings={() => console.log('Settings')}
        onProfile={() => console.log('Profile')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden pb-20">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {/* Search & Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
              <input
                type="text"
                placeholder="Search songs, artists…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder-[#6b7280] transition-all duration-200 outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)]"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <FilterChip 
                label="Recommended" 
                selected={selectedFilter === 'Recommended'}
                onClick={() => setSelectedFilter('Recommended')}
              />
              <FilterChip 
                label="Trending" 
                selected={selectedFilter === 'Trending'}
                onClick={() => setSelectedFilter('Trending')}
              />
              <FilterChip 
                label="New" 
                selected={selectedFilter === 'New'}
                onClick={() => setSelectedFilter('New')}
              />
              <FilterChip 
                label="My adds" 
                selected={selectedFilter === 'My adds'}
                onClick={() => setSelectedFilter('My adds')}
              />
              <button className="px-4 py-2 rounded-xl bg-[#1a1a1a] text-[#9ca3af] border border-[#2a2a2a] hover:border-[#00ff41]/50 hover:text-[#00ff41] transition-all duration-200 whitespace-nowrap flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                More filters
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden mb-6">
            <div className="bg-[#1a1a1a] rounded-xl p-1 flex">
              <button
                onClick={() => setActiveTab('recs')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === 'recs'
                    ? 'bg-[#00ff41] text-black font-medium'
                    : 'text-[#9ca3af]'
                }`}
              >
                Recommendations
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === 'queue'
                    ? 'bg-[#00ff41] text-black font-medium'
                    : 'text-[#9ca3af]'
                }`}
              >
                Queue ({mockQueue.length})
              </button>
            </div>
          </div>

          {/* Two Column Layout (Desktop) / Single Column (Mobile) */}
          <div className="grid lg:grid-cols-[1fr,400px] gap-6">
            {/* Recommendations Column */}
            <div className={`${activeTab === 'queue' ? 'hidden lg:block' : ''}`}>
              <h2 className="text-xl text-white font-medium mb-4">Recommendations</h2>
              <div className="space-y-3">
                {mockRecommendations.map((song) => (
                  <SongCard
                    key={song.id}
                    albumArt={song.albumArt}
                    title={song.title}
                    artist={song.artist}
                    tags={song.tags}
                    onAdd={handleAddSong}
                    onMenuClick={() => console.log('Menu clicked')}
                  />
                ))}
              </div>

              {/* Empty State (when search returns no results) */}
              {searchQuery && mockRecommendations.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-[#6b7280] mb-2">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  </div>
                  <h3 className="text-white font-medium mb-2">No results found</h3>
                  <p className="text-[#9ca3af]">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Queue Column */}
            <div className={`${activeTab === 'recs' ? 'hidden lg:block' : ''}`}>
              <div className="lg:sticky lg:top-6">
                <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl text-white font-medium">Up Next</h2>
                    <span className="text-[#9ca3af] text-sm">{mockQueue.length} songs</span>
                  </div>

                  <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide">
                    {queue.map((song, index) => (
                      <QueueItem
                        key={song.trackId}
                        position={index + 1}
                        title={song.title}
                        artist={song.artist}
                        upvotes={song.upvotes}
                        isNowPlaying={nowPlaying?.trackId === song.trackId}
                        onUpvote={() => handleUpvote(song.trackId)}
                        allowDownvotes={true}
                      />
                    ))}
                    {queue.length === 0 && (
                      <div className="text-center py-8 text-[#9ca3af]">
                        Queue is empty
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Bar */}
      {nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <PlayerBar
            albumArt={nowPlaying.albumArtUrl || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'}
            title={nowPlaying.title}
            artist={nowPlaying.artist}
            isPlaying={true}
            progress={0}
            isHost={false}
            onPlayPause={() => console.log('Play/Pause')}
            onSkip={() => console.log('Skip')}
          />
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="Added to queue"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
