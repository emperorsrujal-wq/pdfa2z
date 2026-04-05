import * as React from 'react';
import {
  CheckCircle2, Clock, AlertCircle, XCircle, Download, Video, Plus,
  FileText, User, LogOut, Loader2, ChevronRight, BarChart2, Shield
} from 'lucide-react';
import {
  subscribeToUserSessions, NotarizationSession, SessionStatus, STATUS_LABELS, DOCUMENT_TYPE_LABELS,
} from '../../services/notarizeService';
import { DEMO_MODE } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  onNewNotarization: () => void;
  onViewSession: (id: string) => void;
  onLogout: () => void;
}

const STATUS_BADGE: Record<SessionStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:     { label: 'Awaiting Payment', cls: 'bg-amber-100 text-amber-700 border border-amber-200',   icon: <Clock size={11} /> },
  in_progress: { label: 'In Progress',      cls: 'bg-blue-100 text-[#185FA5] border border-blue-200',     icon: <Loader2 size={11} className="animate-spin" /> },
  completed:   { label: 'Notarized ✓',      cls: 'bg-green-100 text-[#639922] border border-green-200',   icon: <CheckCircle2 size={11} /> },
  failed:      { label: 'Failed',           cls: 'bg-red-100 text-red-600 border border-red-200',          icon: <AlertCircle size={11} /> },
  cancelled:   { label: 'Cancelled',        cls: 'bg-slate-100 text-slate-500 border border-slate-200',   icon: <XCircle size={11} /> },
};

export const UserDashboard: React.FC<DashboardProps> = ({ onNewNotarization, onViewSession, onLogout }) => {
  const { user, signOut } = useAuth();
  const [sessions, setSessions]   = React.useState<NotarizationSession[]>([]);
  const [loading, setLoading]     = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    const unsub = subscribeToUserSessions(s => {
      setSessions(s);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    onLogout();
  };

  // Stats
  const total     = sessions.length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  const pending   = sessions.filter(s => ['pending', 'in_progress'].includes(s.status)).length;

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#185FA5] rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-black text-slate-900">Notarization Dashboard</p>
              <p className="text-[11px] text-slate-400 font-medium">{user?.email || 'Demo User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNewNotarization}
              className="flex items-center gap-2 bg-[#185FA5] hover:bg-[#144e8a] text-white text-sm font-black px-4 py-2 rounded-lg shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus size={15} /> New Notarization
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">

        {/* Demo mode banner */}
        {DEMO_MODE && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl">🚀</span>
            <div>
              <p className="font-black text-amber-800 text-sm">Demo Mode Active</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Firebase keys not configured — using simulation mode. All data is local and will reset on page refresh.
                Add <code className="bg-amber-100 px-1 rounded text-[10px]">VITE_FIREBASE_*</code> env vars to enable persistence.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: total, icon: <FileText size={18} />, color: 'text-slate-700 bg-slate-100' },
            { label: 'Notarized', value: completed, icon: <CheckCircle2 size={18} />, color: 'text-[#639922] bg-green-50' },
            { label: 'In Progress', value: pending, icon: <Clock size={18} />, color: 'text-[#185FA5] bg-blue-50' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
              <div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sessions list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-slate-400" />
              <p className="font-black text-slate-900 text-sm">Your Notarizations</p>
            </div>
            {sessions.length > 0 && (
              <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold">{sessions.length}</span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-[#185FA5]" />
              <span className="text-slate-500 font-medium text-sm">Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-5 text-center px-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FileText size={28} className="text-slate-400" />
              </div>
              <div>
                <p className="font-black text-slate-700 mb-1">No notarizations yet</p>
                <p className="text-slate-500 text-sm">Start your first notarization and have your document ready in minutes.</p>
              </div>
              <button
                onClick={onNewNotarization}
                className="flex items-center gap-2 px-6 py-3 bg-[#185FA5] text-white font-black rounded-xl shadow-md shadow-blue-500/20 text-sm hover:bg-[#144e8a] transition-all"
              >
                <Plus size={16} /> Start First Notarization
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map(sess => {
                const badge = STATUS_BADGE[sess.status];
                return (
                  <div key={sess.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onViewSession(sess.id)}>
                    {/* Doc icon */}
                    <div className="w-10 h-10 bg-[#185FA5]/10 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-[#185FA5]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {sess.document_name || `Notarization Session — ${sess.id.substring(0, 8)}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sess.created_at?.toDate
                          ? sess.created_at.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'Just created'
                        }
                        {' · '}
                        <span className="capitalize">{sess.notary_type}</span>
                      </p>
                    </div>

                    {/* Badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.cls}`}>
                      {badge.icon} {badge.label}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      {sess.status === 'in_progress' && sess.meeting_link && (
                        <a
                          href={sess.meeting_link}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#185FA5] text-white text-xs font-bold rounded-lg hover:bg-[#144e8a] transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          <Video size={13} /> Join
                        </a>
                      )}
                      {sess.status === 'completed' && sess.notarized_document_url && (
                        <a
                          href={sess.notarized_document_url}
                          download
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#639922] text-white text-xs font-bold rounded-lg hover:bg-[#528019] transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          <Download size={13} /> Download
                        </a>
                      )}
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Account card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Account</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#185FA5]/10 rounded-full flex items-center justify-center">
              <User size={22} className="text-[#185FA5]" />
            </div>
            <div className="flex-1">
              <p className="font-black text-slate-900">{user?.displayName || 'Demo User'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'demo@pdfa2z.com'}</p>
            </div>
            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
              <LogOut size={14} /> {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
