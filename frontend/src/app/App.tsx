import { LoginCard } from '@/app/components/LoginCard';
import { SignUpCard } from '@/app/components/SignUpCard';
import { GuestView } from '@/app/pages/GuestView';
import { HostView } from '@/app/pages/HostView';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SpotifyProvider, useSpotify } from '@/contexts/SpotifyContext';
import { SpotifyCallback } from '@/app/pages/SpotifyCallback';
import { SpotifyConnect } from '@/app/components/SpotifyConnect';
import { useState, useEffect } from 'react';
import { useParty } from '@/lib/useParty';
import { api } from '@/lib/api';

type View = 'login' | 'signup' | 'guest' | 'host';

function AppContent() {
  const { user, loading } = useAuth();
  const spotify = useSpotify();
  const [currentView, setCurrentView] = useState<View>('login');
  const party = useParty();

  // Handle Spotify OAuth callback
  if (window.location.pathname === '/callback') {
    return <SpotifyCallback />;
  }

  // Auto-switch to host/guest view when party is created/joined
  useEffect(() => {
    if (party.partyState) {
      const isHost = party.partyState.party.hostId === party.userId;
      setCurrentView(isHost ? 'host' : 'guest');
    }
  }, [party.partyState, party.userId]);

  // Logged in = Firebase user OR Spotify user
  const isLoggedIn = !!user || !!spotify.user;

  // Redirect to guest view if user is logged in (Firebase or Spotify)
  if (isLoggedIn && (currentView === 'login' || currentView === 'signup')) {
    return <GuestView partyState={party.partyState} partyId={party.partyId} userId={party.userId} onVote={party.vote} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050505]">
        <div className="text-[#00ff41]">Loading...</div>
      </div>
    );
  }

  const handleLogin = (email: string, password: string, roomCode?: string) => {
    console.log('Login:', { email, password, roomCode });
    // Firebase login is handled by LoginCard
    if (roomCode) {
      console.log('Joining party with code:', roomCode);
    }
    setCurrentView('guest');
  };

  const handleSignUp = (name: string, email: string, password: string, roomCode?: string) => {
    console.log('Sign up:', { name, email, password, roomCode });
    // Firebase signup is handled by SignUpCard
    setCurrentView('guest');
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
    setCurrentView('guest');
  };

  const handleGoogleSignUp = () => {
    console.log('Google sign up');
    setCurrentView('guest');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password');
  };

  const handleLogout = () => {
    setCurrentView('login');
  };

  // Create party (host)
  const handleCreateParty = async () => {
    const userId = user?.uid ?? `host_${Date.now()}`;
    await party.createParty(userId, 'chill');
  };

  // Join party (guest)
  const handleJoinParty = async () => {
    const joinCode = prompt('Enter Join Code:');
    if (joinCode) {
      try {
        const { partyId } = await api.resolveJoinCode(joinCode.toUpperCase());
        const userId = user?.uid ?? `guest_${Date.now()}`;
        await party.joinParty(partyId, userId);
      } catch (error) {
        alert('Invalid join code. Please check the code and try again.');
        console.error('Join error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050505] p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#00ff41] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#00ff41] rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00ff41] rounded-full blur-[120px]"></div>
      </div>
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* View Switcher (for demo purposes) */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 flex-wrap max-w-md">
        <SpotifyConnect />
        <button
          onClick={() => setCurrentView('login')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
            currentView === 'login'
              ? 'bg-[#00ff41] text-black'
              : 'bg-[#1a1a1a] text-[#9ca3af] border border-[#2a2a2a]'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setCurrentView('signup')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
            currentView === 'signup'
              ? 'bg-[#00ff41] text-black'
              : 'bg-[#1a1a1a] text-[#9ca3af] border border-[#2a2a2a]'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={handleCreateParty}
          disabled={party.loading}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#00ff41] text-black hover:bg-[#00e639] transition-all duration-200 disabled:opacity-50"
        >
          {party.loading ? 'Creating...' : '+ Create Party (Host)'}
        </button>
        <button
          onClick={handleJoinParty}
          disabled={party.loading}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#1a1a1a] text-[#00ff41] border border-[#00ff41]/30 hover:bg-[#00ff41]/10 transition-all duration-200 disabled:opacity-50"
        >
          {party.loading ? 'Joining...' : 'Join Party (Guest)'}
        </button>
        {party.partyId && (
          <div className="px-3 py-1.5 rounded-lg text-xs bg-[#2a2a2a] text-white border border-[#3a3a3a]">
            Party: {party.partyId.slice(0, 12)}... | Code: {party.joinCode || 'N/A'}
          </div>
        )}
      </div>

      {/* Render based on current view */}
      {currentView === 'guest' && <GuestView partyState={party.partyState} partyId={party.partyId} userId={party.userId} onVote={party.vote} />}
      {currentView === 'host' && (
        <HostView
          partyState={party.partyState}
          joinCode={party.joinCode}
          onStartParty={party.startParty}
          onUpdateSettings={party.updateSettings}
        />
      )}

      {/* Login or Sign Up Card */}
      {(currentView === 'login' || currentView === 'signup') && (
        <>
          {currentView === 'signup' ? (
            <SignUpCard
              onSignUp={handleSignUp}
              onGoogleSignUp={handleGoogleSignUp}
              onSpotifySignUp={spotify.isConfigured ? spotify.login : undefined}
              onLogin={() => setCurrentView('login')}
            />
          ) : (
            <LoginCard
              onLogin={handleLogin}
              onGoogleLogin={handleGoogleLogin}
              onSpotifyLogin={spotify.isConfigured ? spotify.login : undefined}
              onForgotPassword={handleForgotPassword}
              onSignUp={() => setCurrentView('signup')}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SpotifyProvider>
        <AppContent />
      </SpotifyProvider>
    </AuthProvider>
  );
}
