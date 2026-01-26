import { NavBar } from '@/app/components/NavBar';
import { QueueItemLarge } from '@/app/components/QueueItemLarge';
import { HostPlayerControls } from '@/app/components/HostPlayerControls';
import { Modal } from '@/app/components/Modal';
import { Lock, RefreshCw, Users, Activity } from 'lucide-react';
import { useState } from 'react';
import type { PartyState } from '@/lib/types';
import { getMusicProvider } from '@/lib/music';
import { api } from '@/lib/api';

interface HostViewProps {
  partyState: PartyState | null;
  joinCode: string | null;
  onStartParty: () => Promise<void>;
  onUpdateSettings: (settings: { mood?: string; kidFriendly?: boolean; allowSuggestions?: boolean }) => Promise<void>;
}

const mockQueue = [
  {
    id: 2,
    position: 1,
    albumArt: 'https://images.unsplash.com/photo-1703115015357-ba562d7dfd09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    upvotes: 8,
    trendingUp: true
  },
  {
    id: 3,
    position: 2,
    albumArt: 'https://images.unsplash.com/photo-1697238724753-60c0c31132d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    upvotes: 6
  },
  {
    id: 4,
    position: 3,
    albumArt: 'https://images.unsplash.com/photo-1601643157091-ce5c665179ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'Kill Bill',
    artist: 'SZA',
    upvotes: 5,
    isPinned: true
  },
  {
    id: 5,
    position: 4,
    albumArt: 'https://images.unsplash.com/photo-1510809393-728d340e4eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    title: 'Vampire',
    artist: 'Olivia Rodrigo',
    upvotes: 4
  }
];

const mockActivity = [
  { id: 1, user: 'Sam', action: 'added a song', time: '1m ago' },
  { id: 2, user: 'Mia', action: 'upvoted', time: '2m ago' },
  { id: 3, user: 'Alex', action: 'joined', time: '3m ago' },
  { id: 4, user: 'Jordan', action: 'added a song', time: '5m ago' }
];

const mockPeople = [
  { id: 1, name: 'Sam', avatar: 'S', color: '#00ff41' },
  { id: 2, name: 'Mia', avatar: 'M', color: '#00cc34' },
  { id: 3, name: 'Alex', avatar: 'A', color: '#00ff41' },
  { id: 4, name: 'Jordan', avatar: 'J', color: '#00cc34' }
];

export function HostView({ partyState, joinCode, onStartParty, onUpdateSettings }: HostViewProps) {
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [showNewCodeModal, setShowNewCodeModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedSongToRemove, setSelectedSongToRemove] = useState<string | null>(null);
  const [isSeedingQueue, setIsSeedingQueue] = useState(false);

  // Use real party state or show loading
  if (!partyState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050505] flex items-center justify-center">
        <div className="text-white text-xl">Loading party...</div>
      </div>
    );
  }

  const queue = partyState.queue || [];
  const members = partyState.members || [];
  const nowPlaying = partyState.nowPlaying;
  const { party } = partyState;

  const handleGenerateNewCode = () => {
    setShowNewCodeModal(false);
    console.log('Generate new code');
  };

  const handleRemoveSong = () => {
    setShowRemoveModal(false);
    console.log('Remove song:', selectedSongToRemove);
  };

  const handleSeedQueue = async () => {
    if (!partyState) return;

    setIsSeedingQueue(true);
    try {
      const musicProvider = getMusicProvider();
      const tracks = await musicProvider.getRecommendations(party.mood, 10);

      await api.seedQueue(party.partyId, party.hostId, tracks);
      console.log('Queue seeded with 10 tracks');
    } catch (error) {
      console.error('Failed to seed queue:', error);
    } finally {
      setIsSeedingQueue(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050505]">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#00ff41] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00ff41] rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <NavBar
        roomName={party.mood ? `${party.mood} Party` : 'Party Jam'}
        roomCode={joinCode || party.partyId.slice(0, 6).toUpperCase()}
        onSettings={() => console.log('Settings')}
        onProfile={() => console.log('Profile')}
      />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[1fr,360px] gap-6">
          {/* Left Column - Player & Queue */}
          <div className="space-y-6">
            {/* Now Playing Section */}
            {nowPlaying ? (
              <HostPlayerControls
                albumArt={nowPlaying.albumArtUrl || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'}
                title={nowPlaying.title}
                artist={nowPlaying.artist}
                isPlaying={true}
                currentTime="0:00"
                totalTime="3:00"
                progress={0}
                volume={70}
                onPlayPause={() => console.log('Play/Pause')}
                onSkip={() => console.log('Skip')}
                onBack={() => console.log('Back')}
                onVolumeChange={(vol) => console.log('Volume:', vol)}
              />
            ) : (
              <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl p-8 text-center">
                <p className="text-[#9ca3af]">No song playing</p>
                {party.status === 'CREATED' && (
                  <button
                    onClick={onStartParty}
                    className="mt-4 px-6 py-3 bg-[#00ff41] text-black rounded-xl font-medium hover:bg-[#00e639] transition-all duration-200"
                  >
                    Start Party
                  </button>
                )}
              </div>
            )}

            {/* Queue Section */}
            <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white font-medium">Queue</h2>
                <div className="flex items-center gap-3">
                  <span className="text-[#9ca3af]">{queue.length} songs</span>
                  {party.status === 'LIVE' && queue.length === 0 && (
                    <button
                      onClick={handleSeedQueue}
                      disabled={isSeedingQueue}
                      className="px-4 py-2 bg-[#00ff41] text-black rounded-xl font-medium hover:bg-[#00e639] transition-all duration-200 disabled:opacity-50 text-sm"
                    >
                      {isSeedingQueue ? 'Seeding...' : 'Seed Queue'}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {queue.map((song, index) => (
                  <QueueItemLarge
                    key={song.trackId}
                    position={index + 1}
                    albumArt={song.albumArtUrl || 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'}
                    title={song.title}
                    artist={song.artist}
                    upvotes={song.upvotes}
                    trendingUp={false}
                    isPinned={false}
                    onSkipNext={() => console.log('Skip next:', song.trackId)}
                    onRemove={() => {
                      setSelectedSongToRemove(song.title);
                      setShowRemoveModal(true);
                    }}
                    onPin={() => console.log('Pin:', song.trackId)}
                  />
                ))}
              </div>

              {/* Empty Queue State */}
              {queue.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-[#6b7280] mb-4">
                    <svg className="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Queue is empty</h3>
                  <p className="text-[#9ca3af]">Ask guests to add songs</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Room Info & Controls */}
          <div className="space-y-6">
            {/* Room Code & QR */}
            <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl p-6">
              <h3 className="text-white font-medium mb-4">Room Code</h3>
              
              {/* Large Room Code */}
              <div className="bg-[#00ff41] rounded-2xl p-6 mb-4 text-center">
                <div className="text-5xl font-bold text-black tracking-widest mb-2">
                  {joinCode || party.partyId.slice(0, 6).toUpperCase()}
                </div>
                <div className="text-black text-sm opacity-70">Share this code to invite guests</div>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-center">
                <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center">
                  <div className="text-white text-xs text-center">
                    QR Code<br/>Placeholder
                  </div>
                </div>
              </div>

              {/* Room Controls */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsRoomLocked(!isRoomLocked)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isRoomLocked
                      ? 'bg-[#00ff41] text-black'
                      : 'bg-[#1a1a1a] text-[#9ca3af] hover:border-[#00ff41]/50'
                  } border border-transparent`}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">Lock Room</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    isRoomLocked ? 'bg-black' : 'bg-[#2a2a2a]'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-all duration-200 ${
                      isRoomLocked ? 'translate-x-6' : 'translate-x-0.5'
                    } mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowNewCodeModal(true)}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1a1a1a] text-[#00ff41] border border-[#00ff41]/30 hover:bg-[#00ff41]/10 transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="font-medium">Generate New Code</span>
                </button>
              </div>
            </div>

            {/* People in Room */}
            <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00ff41]" />
                  People in room
                </h3>
                <span className="text-[#9ca3af] text-sm">{members.length} ({partyState.activeMembersCount} active)</span>
              </div>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-medium bg-[#00ff41] text-black"
                    >
                      {member.userId.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white">
                      {member.userId} {member.role === 'HOST' && '(Host)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl p-6">
              <h3 className="text-white font-medium mb-4">Settings</h3>

              <div className="space-y-3">
                <button
                  onClick={() => onUpdateSettings({ allowSuggestions: !party.allowSuggestions })}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a1a1a] text-[#9ca3af] hover:border-[#00ff41]/50 border border-transparent transition-all duration-200"
                >
                  <span>Allow suggestions</span>
                  <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    party.allowSuggestions ? 'bg-[#00ff41]' : 'bg-[#2a2a2a]'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-all duration-200 ${
                      party.allowSuggestions ? 'translate-x-6' : 'translate-x-0.5'
                    } mt-0.5`} />
                  </div>
                </button>

                <button
                  onClick={() => onUpdateSettings({ kidFriendly: !party.kidFriendly })}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a1a1a] text-[#9ca3af] hover:border-[#00ff41]/50 border border-transparent transition-all duration-200"
                >
                  <span>Kid-friendly mode</span>
                  <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                    party.kidFriendly ? 'bg-[#00ff41]' : 'bg-[#2a2a2a]'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-all duration-200 ${
                      party.kidFriendly ? 'translate-x-6' : 'translate-x-0.5'
                    } mt-0.5`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00ff41]" />
                Activity
              </h3>
              
              <div className="space-y-3">
                {mockActivity.map((item) => (
                  <div key={item.id} className="flex items-start justify-between">
                    <div>
                      <span className="text-white font-medium">{item.user}</span>
                      <span className="text-[#9ca3af]"> {item.action}</span>
                    </div>
                    <span className="text-[#6b7280] text-xs">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate New Code Modal */}
      <Modal
        isOpen={showNewCodeModal}
        onClose={() => setShowNewCodeModal(false)}
        title="Generate New Code?"
        actions={
          <>
            <button
              onClick={() => setShowNewCodeModal(false)}
              className="px-6 py-2.5 rounded-xl bg-[#1a1a1a] text-[#9ca3af] hover:bg-[#2a2a2a] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateNewCode}
              className="px-6 py-2.5 rounded-xl bg-[#00ff41] text-black hover:bg-[#00e639] transition-all duration-200 font-medium"
            >
              Generate
            </button>
          </>
        }
      >
        <p>This will create a new room code and invalidate the current one. All current guests will remain in the room, but new guests will need the new code to join.</p>
      </Modal>

      {/* Remove Song Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Song?"
        actions={
          <>
            <button
              onClick={() => setShowRemoveModal(false)}
              className="px-6 py-2.5 rounded-xl bg-[#1a1a1a] text-[#9ca3af] hover:bg-[#2a2a2a] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveSong}
              className="px-6 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 font-medium"
            >
              Remove
            </button>
          </>
        }
      >
        <p>Are you sure you want to remove "{selectedSongToRemove}" from the queue?</p>
      </Modal>
    </div>
  );
}
