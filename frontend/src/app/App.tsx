import { LoginCard } from '@/app/components/LoginCard';
import { SignUpCard } from '@/app/components/SignUpCard';
import { GuestView } from '@/app/pages/GuestView';
import { HostView } from '@/app/pages/HostView';
import { SpotifyCallback } from '@/app/pages/SpotifyCallback';
import { SpotifyConnect } from '@/app/components/SpotifyConnect';
import { useState, useEffect } from 'react';
import { useParty } from '@/lib/useParty';

type View = 'login' | 'signup' | 'guest' | 'host';

export default function App() {
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

  const handleLogin = (email: string, password: string, roomCode?: string) => {
    console.log('Login:', { email, password, roomCode });

    // For demo: generate userId from email
    const userId = `user_${email.split('@')[0]}`;

    if (roomCode) {
      // Join party with room code (would need to lookup partyId from roomCode in real app)
      console.log('Joining party with code:', roomCode);
      setCurrentView('guest');
    } else {
      setCurrentView('guest');
    }
  };

  const handleSignUp = (name: string, email: string, password: string, roomCode?: string) => {
    console.log('Sign up:', { name, email, password, roomCode });
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

  // Demo: Create party (host)
  const handleCreateParty = async () => {
    const userId = `host_${Date.now()}`;
    await party.createParty(userId, 'chill');
  };

  // Demo: Join party (guest)
  const handleJoinParty = async () => {
    // For demo, prompt for party ID
    const partyId = prompt('Enter Party ID:');
    if (partyId) {
      const userId = `guest_${Date.now()}`;
      await party.joinParty(partyId, userId);
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
      {currentView === 'guest' && <GuestView partyState={party.partyState} onVote={party.vote} />}
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
              onLogin={() => setCurrentView('login')}
            />
          ) : (
            <LoginCard
              onLogin={handleLogin}
              onGoogleLogin={handleGoogleLogin}
              onForgotPassword={handleForgotPassword}
              onSignUp={() => setCurrentView('signup')}
            />
          )}
        </>
      )}
    </div>
  );
}
