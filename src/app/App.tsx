import { LoginCard } from '@/app/components/LoginCard';
import { SignUpCard } from '@/app/components/SignUpCard';
import { GuestView } from '@/app/pages/GuestView';
import { HostView } from '@/app/pages/HostView';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

type View = 'login' | 'signup' | 'guest' | 'host';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('login');

  // Redirect to guest view if user is logged in
  if (user && (currentView === 'login' || currentView === 'signup')) {
    return <GuestView />;
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
      <div className="fixed top-4 right-4 z-50 flex gap-2">
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
          onClick={() => setCurrentView('guest')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
            currentView === 'guest'
              ? 'bg-[#00ff41] text-black'
              : 'bg-[#1a1a1a] text-[#9ca3af] border border-[#2a2a2a]'
          }`}
        >
          Guest View
        </button>
        <button
          onClick={() => setCurrentView('host')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
            currentView === 'host'
              ? 'bg-[#00ff41] text-black'
              : 'bg-[#1a1a1a] text-[#9ca3af] border border-[#2a2a2a]'
          }`}
        >
          Host View
        </button>
      </div>

      {/* Render based on current view */}
      {currentView === 'guest' && <GuestView />}
      {currentView === 'host' && <HostView />}

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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
