import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  getMe,
  isLoggedIn,
  isSpotifyConfigured,
  initiateSpotifyLogin,
  logout as spotifyLogout,
  type SpotifyUser,
} from '@/lib/spotify';

interface SpotifyContextType {
  user: SpotifyUser | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  isConfigured: boolean;
  login: () => void;
  logout: () => void;
  refetch: () => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!isLoggedIn()) {
      setUser(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const profile = await getMe();
      setUser(profile);
    } catch (err) {
      console.error('Failed to load Spotify profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Spotify profile');
      setUser(null);
      spotifyLogout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(() => {
    if (!isSpotifyConfigured()) {
      console.error('Spotify not configured. Add credentials to frontend/.env.local');
      return;
    }
    initiateSpotifyLogin();
  }, []);

  const logout = useCallback(() => {
    spotifyLogout();
    setUser(null);
    setError(null);
  }, []);

  const value: SpotifyContextType = {
    user,
    loading,
    error,
    isConnected: !!user,
    isConfigured: isSpotifyConfigured(),
    login,
    logout,
    refetch: loadUser,
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}
