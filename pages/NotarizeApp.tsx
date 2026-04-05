import * as React from 'react';
import { AuthModal } from '../components/notarize/AuthModal';
import { NotarizationWizard } from '../components/notarize/NotarizationWizard';
import { SessionTracker } from '../components/notarize/SessionTracker';
import { UserDashboard } from '../components/notarize/UserDashboard';
import { NotarizePage } from './Notarize';
import { onAuthStateChanged, getCurrentUser } from '../services/authService';
import { NotarizationSession } from '../services/notarizeService';
import type { User } from 'firebase/auth';

type View = 'landing' | 'auth' | 'dashboard' | 'wizard' | 'session';

interface NotarizeAppProps {
  // e.g. 'dashboard', 'new', 'session/sess_abc123'
  subPath?: string;
}

export const NotarizeApp: React.FC<NotarizeAppProps> = ({ subPath = '' }) => {
  const [user, setUser]             = React.useState<User | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);
  const [view, setView]             = React.useState<View>('landing');
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authIntent, setAuthIntent] = React.useState<'dashboard' | 'wizard'>('dashboard');

  // Watch auth state
  React.useEffect(() => {
    const unsub = onAuthStateChanged(u => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  // Handle initial sub-path routing
  React.useEffect(() => {
    if (!authChecked) return;

    if (subPath === 'new') {
      if (user) {
        setView('wizard');
      } else {
        setAuthIntent('wizard');
        setShowAuthModal(true);
        setView('landing');
      }
    } else if (subPath === 'dashboard') {
      if (user) {
        setView('dashboard');
      } else {
        setAuthIntent('dashboard');
        setShowAuthModal(true);
        setView('landing');
      }
    } else if (subPath.startsWith('session/')) {
      const sid = subPath.split('session/')[1];
      if (sid && user) {
        setActiveSessionId(sid);
        setView('session');
      } else if (sid) {
        setActiveSessionId(sid);
        setAuthIntent('dashboard');
        setShowAuthModal(true);
        setView('landing');
      }
    }
  }, [authChecked, subPath, user]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setUser(getCurrentUser());
    if (authIntent === 'wizard') setView('wizard');
    else setView('dashboard');
  };

  const requestAuth = (intent: 'dashboard' | 'wizard') => {
    setAuthIntent(intent);
    setShowAuthModal(true);
  };

  const handleSessionComplete = (session: NotarizationSession) => {
    setActiveSessionId(session.id);
    setView('session');
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#185FA5]/20 border-t-[#185FA5] animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Views */}
      {view === 'landing' && (
        <NotarizePage
          onStartNotarization={() => {
            if (user) setView('wizard');
            else requestAuth('wizard');
          }}
          onGoToDashboard={() => {
            if (user) setView('dashboard');
            else requestAuth('dashboard');
          }}
        />
      )}

      {view === 'dashboard' && user && (
        <UserDashboard
          onNewNotarization={() => setView('wizard')}
          onViewSession={id => { setActiveSessionId(id); setView('session'); }}
          onLogout={() => { setUser(null); setView('landing'); }}
        />
      )}

      {view === 'wizard' && user && (
        <NotarizationWizard
          onComplete={handleSessionComplete}
          onCancel={() => setView('dashboard')}
        />
      )}

      {view === 'session' && activeSessionId && (
        <div className="min-h-screen bg-[#f1f5f9]">
          <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-5 h-14 flex items-center">
              <button
                onClick={() => setView('dashboard')}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center gap-1.5"
              >
                ← Dashboard
              </button>
            </div>
          </div>
          <SessionTracker
            sessionId={activeSessionId}
            onBack={() => setView('dashboard')}
          />
        </div>
      )}
    </>
  );
};
