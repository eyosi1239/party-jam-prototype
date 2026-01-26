/**
 * Spotify Connect Button Component
 */

import { useState, useEffect } from 'react';
import { initiateSpotifyLogin, isLoggedIn, logout, getMe, type SpotifyUser } from '@/lib/spotify';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const isSpotifyEnabled = !!SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_ID !== 'your_spotify_client_id_here';

export function SpotifyConnect() {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in and fetch profile
    if (isSpotifyEnabled && isLoggedIn()) {
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getMe();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load Spotify profile:', error);
      // If profile fetch fails, clear tokens
      logout();
    }
  };

  const handleConnect = () => {
    setLoading(true);
    initiateSpotifyLogin();
  };

  const handleDisconnect = () => {
    logout();
    setUser(null);
  };

  // If Spotify integration is disabled, show a note
  if (!isSpotifyEnabled) {
    return (
      <div className="px-3 py-1.5 rounded-lg text-xs bg-[#1a1a1a] text-[#9ca3af] border border-[#2a2a2a]">
        Spotify integration paused
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
        {user.images?.[0]?.url && (
          <img
            src={user.images[0].url}
            alt={user.display_name}
            className="w-6 h-6 rounded-full"
          />
        )}
        <span className="text-white text-sm">{user.display_name}</span>
        <button
          onClick={handleDisconnect}
          className="ml-2 text-[#9ca3af] hover:text-white text-xs transition-colors"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg text-xs bg-[#1DB954] text-white hover:bg-[#1ed760] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        'Connecting...'
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Connect Spotify
        </>
      )}
    </button>
  );
}
