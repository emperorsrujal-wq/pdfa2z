import * as React from 'react';
import { X, Mail, Lock, User, MapPin, Eye, EyeOff, Loader2, Chrome, CheckCircle2 } from 'lucide-react';
import { signIn, signUp, signInWithGoogle, signInWithApple } from '../services/authService';
import { DEMO_MODE } from '../config/firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: 'login' | 'signup';
}

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, defaultTab = 'login' }) => {
  const [tab, setTab] = React.useState<'login' | 'signup'>(defaultTab);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Login form
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Signup extra fields
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName]   = React.useState('');
  const [state, setState]         = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName || !state) { setError('Please fill in all required fields.'); return; }
    setLoading(true);
    try {
      await signUp(email, password, firstName, lastName, state);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithApple();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Apple sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await signIn('demo@pdfa2z.com', 'demo');
    onSuccess();
  };

  const inputCls = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#185FA5] focus:bg-white focus:ring-2 focus:ring-[#185FA5]/10 outline-none transition-all';

  return (
    <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {tab === 'login' ? 'Sign in to manage your notarizations' : 'Start notarizing documents in minutes'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Demo mode banner - Only visible if real Firebase keys are missing */}
          {DEMO_MODE && mounted && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <span className="text-lg">🚀</span>
              <div>
                <p className="text-xs font-black text-amber-800">Demo Mode Active</p>
                <p className="text-xs text-amber-700">Firebase keys not configured. Using simulation mode.</p>
                <button onClick={handleDemoLogin} className="mt-1.5 text-xs font-bold text-amber-700 underline underline-offset-2">
                  Enter as Demo User →
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors mb-3 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <button
            onClick={handleApple}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-black border border-black rounded-xl text-sm font-semibold text-white hover:bg-zinc-800 transition-colors mb-5 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            Continue with Apple
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                  className={`${inputCls} pl-10`} required />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  className={`${inputCls} pl-10 pr-10`} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#185FA5] hover:bg-[#144e8a] text-white font-black rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20">
                {loading ? <Loader2 size={17} className="animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In & Continue'}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="First name *" value={firstName} onChange={e => setFirstName(e.target.value)}
                    className={`${inputCls} pl-9`} required />
                </div>
                <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" placeholder="Email address *" value={email} onChange={e => setEmail(e.target.value)}
                  className={`${inputCls} pl-10`} required />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} placeholder="Password (8+ characters) *" value={password} onChange={e => setPassword(e.target.value)}
                  className={`${inputCls} pl-10 pr-10`} required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={state} onChange={e => setState(e.target.value)}
                  className={`${inputCls} pl-10 appearance-none`} required>
                  <option value="">State of Residence *</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#185FA5] hover:bg-[#144e8a] text-white font-black rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20">
                {loading ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                {loading ? 'Creating account...' : 'Create Account & Continue'}
              </button>
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                By signing up, you agree to our{' '}
                <a href="/terms" className="text-[#185FA5] underline">Terms</a> and{' '}
                <a href="/privacy" className="text-[#185FA5] underline">Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
