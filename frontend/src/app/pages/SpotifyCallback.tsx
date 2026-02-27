/**
 * Spotify OAuth callback handler
 */

import { useEffect, useState } from 'react';
import { handleSpotifyCallback } from '@/lib/spotify';

export function SpotifyCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setError(`Spotify authorization failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received from Spotify');
        return;
      }

      try {
        await handleSpotifyCallback(code);
        setStatus('success');

        // Redirect back to main app after 1 second
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to complete Spotify login');
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050505]">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff41] mx-auto mb-4"></div>
            <p className="text-white">Connecting to Spotify...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-[#00ff41] text-5xl mb-4">✓</div>
            <p className="text-white mb-2">Successfully connected to Spotify!</p>
            <p className="text-[#9ca3af] text-sm">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <p className="text-white mb-2">Connection Failed</p>
            <p className="text-[#9ca3af] text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-[#00ff41] text-black rounded-lg hover:bg-[#00e639] transition-colors"
            >
              Return to App
            </button>
          </>
        )}
      </div>
    </div>
  );
}
