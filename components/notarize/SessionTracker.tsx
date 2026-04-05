import * as React from 'react';
import {
  CheckCircle2, Clock, AlertCircle, XCircle, Loader2, Download, Video,
  RefreshCw, FileText, Calendar, Shield, ArrowLeft
} from 'lucide-react';
import {
  subscribeToSession, cancelSession, NotarizationSession, SessionStatus, STATUS_LABELS
} from '../../services/notarizeService';
import { DEMO_MODE } from '../../config/firebase';

interface SessionTrackerProps {
  sessionId: string;
  onBack: () => void;
}

const STATUS_CONFIG: Record<SessionStatus, {
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  pulse: boolean;
}> = {
  pending: {
    icon: <Clock size={24} />,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    pulse: true,
  },
  in_progress: {
    icon: <Loader2 size={24} className="animate-spin" />,
    color: 'text-[#185FA5]',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    pulse: true,
  },
  completed: {
    icon: <CheckCircle2 size={24} />,
    color: 'text-[#639922]',
    bg: 'bg-green-50',
    border: 'border-green-200',
    pulse: false,
  },
  failed: {
    icon: <AlertCircle size={24} />,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    pulse: false,
  },
  cancelled: {
    icon: <XCircle size={24} />,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    pulse: false,
  },
};

const TIMELINE_STEPS = [
  { key: 'created',    label: 'Session Created',      trigger: () => true },
  { key: 'pending',    label: 'Awaiting Payment',      trigger: (s: NotarizationSession) => ['pending','in_progress','completed'].includes(s.status) },
  { key: 'in_progress',label: 'Notarization Started', trigger: (s: NotarizationSession) => ['in_progress','completed'].includes(s.status) },
  { key: 'id_verified',label: 'Identity Verified',    trigger: (s: NotarizationSession) => s.identity_verified },
  { key: 'completed',  label: 'Document Notarized',   trigger: (s: NotarizationSession) => s.status === 'completed' },
];

export const SessionTracker: React.FC<SessionTrackerProps> = ({ sessionId, onBack }) => {
  const [session, setSession] = React.useState<NotarizationSession | null>(null);
  const [loading, setLoading]   = React.useState(true);
  const [cancelling, setCancelling] = React.useState(false);

  React.useEffect(() => {
    const unsub = subscribeToSession(sessionId, s => {
      setSession(s);
      setLoading(false);
    });
    return unsub;
  }, [sessionId]);

  const handleCancel = async () => {
    if (!session || !window.confirm('Cancel this notarization session?')) return;
    setCancelling(true);
    try { await cancelSession(session.id); } catch {}
    finally { setCancelling(false); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 size={36} className="animate-spin text-[#185FA5]" />
        <p className="text-slate-500 font-medium">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-slate-700 font-bold">Session not found</p>
        <button onClick={onBack} className="text-[#185FA5] underline text-sm font-medium">← Back to Dashboard</button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[session.status];

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8 px-5">

      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Status hero */}
      <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden`}>
        {cfg.pulse && (
          <div className={`absolute inset-0 ${cfg.bg} animate-pulse opacity-50`} />
        )}
        <div className={`relative w-16 h-16 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center ${cfg.color}`}>
          {cfg.icon}
        </div>
        <div className="relative">
          <p className={`text-2xl font-black ${cfg.color}`}>{STATUS_LABELS[session.status]}</p>
          <p className="text-slate-500 text-sm mt-1">
            {session.status === 'pending' && 'Complete payment to start your notarization session.'}
            {session.status === 'in_progress' && 'Your notarization is underway. Join the video call below.'}
            {session.status === 'completed' && 'Your document has been officially notarized and sealed.'}
            {session.status === 'failed' && (session.error_message || 'The session encountered an error. You have not been charged.')}
            {session.status === 'cancelled' && 'This session was cancelled. You have not been charged.'}
          </p>
        </div>

        {/* Actions */}
        {session.status === 'in_progress' && session.meeting_link && (
          <a
            href={session.meeting_link}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3 bg-[#185FA5] text-white font-black rounded-xl hover:-translate-y-0.5 transition-all shadow-md shadow-blue-500/20"
          >
            <Video size={18} /> Join Video Call
          </a>
        )}

        {session.status === 'completed' && session.notarized_document_url && (
          <a
            href={session.notarized_document_url}
            download
            className="flex items-center gap-2 px-8 py-3 bg-[#639922] text-white font-black rounded-xl hover:-translate-y-0.5 transition-all shadow-md shadow-green-500/20"
          >
            <Download size={18} /> Download Notarized PDF
          </a>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Session Progress</p>
        <div className="space-y-0">
          {TIMELINE_STEPS.map((step, i) => {
            const done = step.trigger(session);
            const isLast = i === TIMELINE_STEPS.length - 1;
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${done ? 'border-[#639922] bg-[#639922]' : 'border-slate-200 bg-white'}`}>
                    {done
                      ? <CheckCircle2 size={16} className="text-white" />
                      : <div className="w-2 h-2 bg-slate-200 rounded-full" />
                    }
                  </div>
                  {!isLast && <div className={`w-0.5 h-8 my-1 ${done ? 'bg-[#639922]' : 'bg-slate-200'}`} />}
                </div>
                <div className="pb-8 last:pb-0">
                  <p className={`text-sm font-bold mt-1 ${done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session details */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Session Details</p>
        <dl className="space-y-3">
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500 flex items-center gap-2"><FileText size={14} /> Session ID</dt>
            <dd className="font-mono text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">{session.id.slice(0, 16)}...</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500 flex items-center gap-2"><Shield size={14} /> Notary Type</dt>
            <dd className="font-bold text-slate-900 capitalize">{session.notary_type}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Created</dt>
            <dd className="font-bold text-slate-900">
              {session.created_at?.toDate ? session.created_at.toDate().toLocaleString() : 'Just now'}
            </dd>
          </div>
          {session.completed_at && (
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500 flex items-center gap-2"><CheckCircle2 size={14} /> Completed</dt>
              <dd className="font-bold text-[#639922]">
                {session.completed_at?.toDate ? session.completed_at.toDate().toLocaleString() : 'Just now'}
              </dd>
            </div>
          )}
          {session.video_recording_url && (
            <div className="flex justify-between text-sm items-center">
              <dt className="text-slate-500 flex items-center gap-2"><Video size={14} /> Video Recording</dt>
              <a href={session.video_recording_url} className="font-bold text-[#185FA5] underline underline-offset-2 text-xs">View Recording</a>
            </div>
          )}
        </dl>
      </div>

      {/* Demo mode info */}
      {DEMO_MODE && session.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <RefreshCw size={18} className="text-amber-600 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '3s' }} />
          <div>
            <p className="font-bold text-amber-800 text-sm">Demo Mode: Auto-completing in ~30s</p>
            <p className="text-xs text-amber-700 mt-0.5">The session status will automatically update to demonstrate the real-time flow.</p>
          </div>
        </div>
      )}

      {/* Cancel */}
      {['pending', 'in_progress'].includes(session.status) && (
        <div className="text-center">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm text-red-500 hover:text-red-700 font-medium underline underline-offset-2 disabled:opacity-50 transition-colors"
          >
            {cancelling ? 'Cancelling...' : 'Cancel this session'}
          </button>
        </div>
      )}
    </div>
  );
};
