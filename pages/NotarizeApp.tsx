import * as React from 'react';
import { NotarizationWizard } from '../components/notarize/NotarizationWizard';
import { SessionTracker } from '../components/notarize/SessionTracker';
import { UserDashboard } from '../components/notarize/UserDashboard';
import { NotarizePage } from './Notarize';
import { NotarizationSession } from '../services/notarizeService';
import { useAuth } from '../context/AuthContext';

type View = 'landing' | 'auth' | 'dashboard' | 'wizard' | 'session';

interface NotarizeAppProps {
  // e.g. 'dashboard', 'new', 'session/sess_abc123'
  subPath?: string;
}

export const NotarizeApp: React.FC<NotarizeAppProps> = ({ subPath = '' }) => {
  const { user, loading: authChecked, openAuthModal } = useAuth();
  const [view, setView]             = React.useState<View>('landing');
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [authIntent, setAuthIntent] = React.useState<'dashboard' | 'wizard'>('dashboard');

  // Handle initial sub-path routing
  React.useEffect(() => {
    if (!authChecked) return;

    if (subPath === 'new') {
      if (user) {
        setView('wizard');
      } else {
        setAuthIntent('wizard');
        setView('landing');
      }
    } else if (subPath === 'dashboard') {
      if (user) {
        setView('dashboard');
      } else {
        setAuthIntent('dashboard');
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
        setView('landing');
      }
    }
  }, [authChecked, subPath, user]);

  // Sync view on auth success if there was an intent
  React.useEffect(() => {
    if (user && authIntent) {
      if (authIntent === 'wizard') setView('wizard');
      else setView('dashboard');
      setAuthIntent('dashboard'); // reset
    }
  }, [user, authIntent]);

  const requestAuth = (intent: 'dashboard' | 'wizard') => {
    setAuthIntent(intent);
    openAuthModal('login');
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
          onLogout={() => { setView('landing'); }}
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
