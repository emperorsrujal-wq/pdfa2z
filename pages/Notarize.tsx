import * as React from 'react';
import { SEO } from '../components/SEO';
import {
  Clock, Moon, ShieldCheck, Lock, DollarSign, Home,
  Upload, UserCheck, Video, CheckCircle2, ChevronDown,
  ChevronUp, Star, ArrowRight, FileText, Building2,
  Scale, ClipboardList, Award, Mail, Phone, Globe
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS } from '../App';

// ── Data ──────────────────────────────────────────────────────────────────────

const VALUE_PROPS = [
  { icon: Clock, color: 'bg-[#185FA5]/10 text-[#185FA5]', title: 'Done in 10 Minutes', copy: 'Most notarizations complete in under 10 minutes. No waiting rooms. No scheduling headaches. Start and finish on your schedule.' },
  { icon: Moon, color: 'bg-purple-100 text-purple-600', title: 'Available 24/7', copy: 'Nights, weekends, holidays—whenever you need a notary, we\'re here. No appointment required. Connect with a notary instantly.' },
  { icon: CheckCircle2, color: 'bg-[#639922]/10 text-[#639922]', title: 'Legally Recognized', copy: 'Our notarizations are legally valid in every U.S. state and accepted by courts, financial institutions, and government agencies.' },
  { icon: Lock, color: 'bg-slate-100 text-slate-700', title: 'Bank-Grade Encryption', copy: 'Your identity verification, documents, and personal data are encrypted and protected with the same security used by financial institutions.' },
  { icon: DollarSign, color: 'bg-amber-100 text-amber-600', title: 'Simple Pricing', copy: '$45 per document. No hidden fees. No surprises. One price, full service.' },
  { icon: Home, color: 'bg-rose-100 text-rose-500', title: 'Stay Home', copy: 'No driving. No parking. No travel time. Video call with a licensed notary from your laptop or phone—from anywhere.' },
];

const STEPS = [
  {
    num: '01', icon: Upload, color: 'bg-[#185FA5]',
    title: 'Upload Your Document',
    copy: 'Select your PDF document from your computer or drag and drop it here. We accept documents up to 10 MB. Takes 30 seconds.',
    time: '~30 seconds',
    details: ['PDF format accepted', 'Up to 10 MB file size', 'Instant secure upload'],
  },
  {
    num: '02', icon: UserCheck, color: 'bg-purple-600',
    title: 'Verify Your Identity',
    copy: 'Answer a few questions to confirm your identity, then upload a photo of your government-issued ID. AI-powered fraud detection keeps everything secure.',
    time: '~2 minutes',
    details: ['Knowledge-based questions', 'Government ID photo analysis', 'AI-powered fraud detection'],
  },
  {
    num: '03', icon: Video, color: 'bg-[#639922]',
    title: 'Meet with a Notary & Sign',
    copy: 'Join a secure video call with a licensed notary. They\'ll guide you through signing, witness your signature, and apply the official seal.',
    time: '~5–8 minutes',
    details: ['Licensed notary guides you', 'Official digital seal applied', 'Recorded session for compliance', 'Download instantly when done'],
  },
];

const DOCUMENT_TYPES = [
  { icon: '📋', title: 'Power of Attorney', copy: 'Grant someone authority to make financial or healthcare decisions on your behalf.' },
  { icon: '🏛️', title: 'Affidavit', copy: 'Sworn statement of facts, used in legal proceedings and government filings.' },
  { icon: '🏠', title: 'Mortgage Documents', copy: 'Loan documents, refinancing papers, and promissory notes.' },
  { icon: '📄', title: 'Contracts & Agreements', copy: 'Legal agreements between parties that require notarized signatures.' },
  { icon: '🪪', title: 'Identification Documents', copy: 'Passport applications, visa documentation, notarized copies of IDs.' },
  { icon: '✅', title: 'Other Documents', copy: 'Wills, trusts, travel consent forms, and more. If it requires notarization, we can do it.' },
];

const FAQS = [
  { q: 'Is a notarization done online legally valid?', a: 'Yes, absolutely. Remote Online Notarization (RON) is legal in most U.S. states and the documents are fully enforceable in courts and with government agencies. Our notarizations comply with all state and federal requirements.' },
  { q: 'What documents can be notarized?', a: 'Most documents that legally require notarization. However, a small number of states restrict certain documents like wills and trusts. We\'ll confirm your document\'s eligibility before you pay—no charge if we can\'t help.' },
  { q: 'How long does the whole process take?', a: 'From upload to completion, typically 10–15 minutes. After that, your notarized document is ready to download immediately.' },
  { q: 'What do I need for the video call?', a: 'Just a computer or smartphone with a working camera, microphone, and internet connection. No special software needed. Works on any modern browser.' },
  { q: 'What ID do you accept?', a: 'U.S. driver\'s licenses, passports, state ID cards, and some military IDs. We verify your ID photo using industry-standard technology that checks for fraud and forgeries.' },
  { q: 'How much does it cost?', a: '$45 per document. That\'s the only fee. No hidden charges, no platform fees, no subscription required. Additional documents in the same session are $35 each.' },
  { q: 'What if something goes wrong during the notarization?', a: 'If for any reason your notarization can\'t be completed, you won\'t be charged. If you\'ve already paid and want a refund, just contact us—we\'ll process it within 24 hours.' },
  { q: 'Can I use this for business documents?', a: 'Absolutely. Many of our users are lawyers and accountants who notarize documents for their clients. We also offer bulk pricing and white-label solutions for businesses. Contact our team to learn more.' },
];

const TRUST_POINTS = [
  { icon: Award, color: 'text-amber-500 bg-amber-50', title: 'Licensed Notaries', copy: 'All notaries are properly commissioned, bonded, and insured by their state. We vet every notary before they can perform notarizations.' },
  { icon: Lock, color: 'text-[#185FA5] bg-blue-50', title: 'AES-256 Encryption', copy: 'Your data is encrypted using AES-256 (the same standard used by banks). All video sessions are recorded and securely archived for compliance.' },
  { icon: ClipboardList, color: 'text-[#639922] bg-green-50', title: 'Complete Audit Trail', copy: 'Full record of every notarization including signer identity, date, time, notary information, and video recording.' },
  { icon: Scale, color: 'text-purple-600 bg-purple-50', title: 'RON Compliant in 40+ States', copy: 'We comply with Remote Online Notarization laws in 40+ states. Each notarization follows the specific legal requirements of the signer\'s state.' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', location: 'California', quote: 'I needed to notarize my power of attorney while traveling internationally. This made it so easy. Completed in 10 minutes. Would definitely recommend.' },
  { name: 'Michael T.', location: 'Texas', quote: 'As a real estate agent, I recommend this to all my clients now. No more waiting in notary offices. Perfect solution.' },
  { name: 'Jennifer L.', location: 'New York', quote: 'Our law firm tried several platforms. This one is the easiest, most reliable, and our clients love it.' },
];

const CERTS = ['SOC 2 Type II', 'MISMO', 'NIST IAL2', 'GDPR', 'CCPA'];

// ── Components ────────────────────────────────────────────────────────────────

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        className="w-full text-left flex items-center justify-between py-5 gap-4 group"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold text-slate-800 group-hover:text-[#185FA5] transition-colors text-[15px] leading-snug">{q}</span>
        <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#185FA5] group-hover:text-white transition-all">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>
      {open && (
        <p className="pb-5 text-slate-600 text-[14px] leading-relaxed -mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {a}
        </p>
      )}
    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
    <CheckCircle2 size={15} className="text-[#639922] shrink-0" /> {children}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

interface NotarizePageProps {
  onStartNotarization?: () => void;
  onGoToDashboard?: () => void;
}

export const NotarizePage: React.FC<NotarizePageProps> = ({ onStartNotarization, onGoToDashboard }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];
  const displayLang = SUPPORTED_LANGS.includes(currentLang) ? currentLang : 'en';

  const handleStart = () => {
    if (onStartNotarization) {
      onStartNotarization();
    } else {
      window.alert('Notarization flow coming soon! This feature will be available at notarize.pdfa2z.com');
    }
  };

  return (
    <Layout currentLang={displayLang}>
      <SEO
        title="Online Notarization — Get Documents Notarized in 10 Minutes | pdfa2z"
        description="Legally valid remote online notarization. Available 24/7, from anywhere. Upload your document, verify your identity, and meet with a licensed notary via video call. $45 per document."
        canonical="/notarize"
        currentLang={i18n.language}
      />

      <div className="font-sans text-slate-900 bg-white overflow-x-hidden pt-10">



        {/* ── HERO ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pt-20 pb-24 px-5">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/60 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-green-100/40 to-transparent rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="relative max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left: copy */}
              <div>
                <div className="inline-flex items-center gap-2 bg-[#185FA5]/10 text-[#185FA5] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                  <CheckCircle2 size={13} /> Now Available Nationwide
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-5 tracking-tight">
                  Get Your Documents Notarized in{' '}
                  <span className="text-[#185FA5]">10 Minutes.</span>
                  <br />No Office Visit Required.
                </h1>
                <p className="text-lg text-slate-600 mb-3 font-medium leading-relaxed max-w-lg">
                  Legally valid remote notarization. Available 24/7. From anywhere. Secure and affordable.
                </p>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed max-w-lg">
                  Whether you need to notarize a power of attorney, affidavit, contract, or mortgage document — upload, verify, sign, and done.
                </p>

                <div className="flex flex-wrap gap-3 mb-10">
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 bg-[#185FA5] hover:bg-[#144e8a] text-white font-black px-7 py-4 rounded-xl shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 text-[15px]"
                  >
                    Start Your Notarization Today <ArrowRight size={18} />
                  </button>
                  <a
                    href="#how-it-works"
                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-7 py-4 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-[15px]"
                  >
                    See How It Works
                  </a>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge>Licensed Notaries</Badge>
                  <Badge>24/7 Available</Badge>
                  <Badge>Legally Valid</Badge>
                  <Badge>Bank-Grade Security</Badge>
                </div>
              </div>

              {/* Right: visual split card */}
              <div className="hidden lg:grid grid-cols-2 gap-4">
                {/* Left card: customer side */}
                <div className="bg-slate-900 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#185FA5]/30 to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                      <Video size={24} className="text-white" />
                    </div>
                    <p className="text-white font-black text-lg leading-tight">Video Call with Notary</p>
                    <p className="text-white/60 text-xs mt-1 font-medium">Secure connection</p>
                  </div>
                  {/* Fake video grid */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="aspect-video bg-[#185FA5]/30 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">YOU</div>
                    </div>
                    <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">NTR</div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="inline-flex items-center gap-1.5 bg-[#639922]/20 text-[#639922] px-3 py-1.5 rounded-full text-xs font-black">
                      <div className="w-2 h-2 bg-[#639922] rounded-full animate-pulse" /> Live Session Active
                    </div>
                  </div>
                </div>

                {/* Right card: document side */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                        <div className="flex items-center gap-1.5 text-[#639922] font-black text-sm">
                          <CheckCircle2 size={16} /> Notarized
                        </div>
                      </div>
                      <div className="text-3xl">✅</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-100 rounded-full w-full" />
                      <div className="h-2 bg-slate-100 rounded-full w-4/5" />
                      <div className="h-2 bg-slate-100 rounded-full w-3/5" />
                    </div>
                    <div className="mt-4 p-3 bg-[#639922]/10 rounded-xl flex items-center gap-2">
                      <Award size={16} className="text-[#639922]" />
                      <span className="text-xs font-bold text-[#639922]">Official Seal Applied</span>
                    </div>
                  </div>
                  <div className="bg-[#185FA5] rounded-2xl p-5 shadow-lg text-white">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-1">Total Time</p>
                    <p className="text-3xl font-black">~10 min</p>
                    <p className="text-blue-200 text-xs mt-1">From upload to download</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUE PROPS ──────────────────────────────────────────── */}
        <section className="py-20 px-5 bg-slate-50/70">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black text-slate-900 mb-3">Why Notarize with Us</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-[15px]">Everything you need, nothing you don't. Simple, fast, legally sound.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {VALUE_PROPS.map(({ icon: Icon, color, title, copy }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-black text-slate-900 mb-2 text-[15px]">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 px-5 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-3">Get Notarized in 3 Simple Steps</h2>
              <p className="text-slate-500">No appointments. No travel. Just a few clicks and a short video call.</p>
            </div>

            {/* Timeline */}
            <div className="hidden md:flex items-center justify-center gap-0 mb-16 max-w-2xl mx-auto">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 ${s.color} text-white rounded-full flex items-center justify-center text-xs font-black shadow-md`}>{s.num}</div>
                    <span className="text-[10px] font-bold text-slate-500">{s.time}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 flex flex-col items-center gap-1 mx-2">
                      <div className="w-full h-0.5 bg-gradient-to-r from-slate-200 to-slate-200 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#185FA5]/30 to-[#639922]/30" />
                      </div>
                      <span className="text-[10px] text-slate-400">→</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-[#639922] text-white rounded-full flex items-center justify-center text-xs font-black shadow-md">✓</div>
                <span className="text-[10px] font-bold text-[#639922]">Done!</span>
              </div>
            </div>

            <div className="space-y-8">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.num} className={`flex flex-col md:flex-row gap-8 items-start ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="md:w-1/3 flex flex-col items-center md:items-start gap-3">
                      <div className={`w-16 h-16 ${s.color} rounded-2xl flex items-center justify-center shadow-xl shadow-current/20`}>
                        <Icon size={32} className="text-white" />
                      </div>
                      <div className="bg-slate-100 text-slate-500 text-xs font-black px-3 py-1.5 rounded-full">
                        {s.time}
                      </div>
                    </div>
                    <div className="md:flex-1 bg-slate-50 rounded-2xl p-8 border border-slate-100">
                      <div className="text-5xl font-black text-slate-100 mb-3 leading-none">{s.num}</div>
                      <h3 className="text-xl font-black text-slate-900 mb-3">{s.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-5">{s.copy}</p>
                      <ul className="space-y-2">
                        {s.details.map(d => (
                          <li key={d} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 size={15} className="text-[#639922] shrink-0" /> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={handleStart}
                className="bg-[#185FA5] hover:bg-[#144e8a] text-white font-black px-10 py-4 rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-0.5 text-[15px] inline-flex items-center gap-2"
              >
                Start Your Notarization <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* ── DOCUMENT TYPES ───────────────────────────────────────── */}
        <section id="documents" className="py-20 px-5 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black text-slate-900 mb-2">We Can Notarize These Documents</h2>
              <p className="text-slate-500 text-[15px] max-w-lg mx-auto">Nearly any document that legally requires notarization. Here are the most common:</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {DOCUMENT_TYPES.map(({ icon, title, copy }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-[#185FA5]/30 hover:shadow-md transition-all group cursor-pointer">
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="font-black text-slate-900 mb-2 group-hover:text-[#185FA5] transition-colors">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{copy}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <p className="font-bold text-amber-800 mb-1">State Restrictions Notice</p>
                <p className="text-amber-700 text-sm leading-relaxed">Some states have restrictions on certain documents (like wills and trusts). We'll verify before your notarization session. If a document can't be notarized remotely, we'll let you know upfront—no charge.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
        <section className="py-20 px-5 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Trusted by Thousands</h2>
              <div className="flex items-center justify-center gap-1 mt-3">
                {[1,2,3,4,5].map(s => <Star key={s} size={20} className="text-amber-400 fill-amber-400" />)}
                <span className="ml-2 text-sm font-bold text-slate-500">4.9/5 · 2,400+ reviews</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(({ name, location, quote }) => (
                <div key={name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{name}</p>
                    <p className="text-slate-400 text-xs font-medium">{location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────── */}
        <section id="pricing" className="py-20 px-5 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Simple, Transparent Pricing</h2>
              <p className="text-slate-500">No hidden fees. No surprises. Only pay after successful notarization.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Individual */}
              <div className="bg-white rounded-2xl border-2 border-[#185FA5] p-8 shadow-xl shadow-blue-500/10 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#185FA5] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                <p className="font-black text-slate-400 text-xs uppercase tracking-widest mb-3">Individual</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-slate-900">$45</span>
                  <span className="text-slate-400 text-sm mb-2">/document</span>
                </div>
                <p className="text-slate-500 text-xs mb-6">First document in a session</p>
                <ul className="space-y-3 mb-8">
                  {['Video call with notary', 'Official digital seal', 'Download instantly', '7-year secure storage', 'Up to 10 MB file size'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 size={15} className="text-[#639922] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleStart} className="w-full bg-[#185FA5] hover:bg-[#144e8a] text-white font-black py-3 rounded-xl transition-colors shadow-md shadow-blue-500/20">
                  Start Now
                </button>
              </div>

              {/* Additional docs */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <p className="font-black text-slate-400 text-xs uppercase tracking-widest mb-3">Additional Docs</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-slate-900">$35</span>
                  <span className="text-slate-400 text-sm mb-2">/document</span>
                </div>
                <p className="text-slate-500 text-xs mb-6">In the same session (up to 5 total)</p>
                <ul className="space-y-3 mb-8">
                  {['Everything in Individual', 'Same notary session', 'Bulk discount applied', 'Separate notarized files'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 size={15} className="text-[#639922] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={handleStart} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-xl transition-colors">
                  Get Started
                </button>
              </div>

              {/* Business */}
              <div className="bg-slate-900 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#185FA5]/40 to-transparent pointer-events-none" />
                <div className="relative">
                  <p className="font-black text-slate-300 text-xs uppercase tracking-widest mb-3">Business / White-Label</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-white">Custom</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-6">Tailored for your volume</p>
                  <ul className="space-y-3 mb-8">
                    {['Bulk discounts', 'API integration', 'Custom branding', 'Dedicated support', 'Law firm & title company ready'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/80 font-medium">
                        <CheckCircle2 size={15} className="text-[#639922] shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-xl transition-colors border border-white/20">
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>

            {/* Money-back guarantee */}
            <div className="mt-8 text-center bg-[#639922]/10 border border-[#639922]/30 rounded-2xl p-5">
              <p className="font-black text-[#639922] mb-1">💚 Money-Back Guarantee</p>
              <p className="text-slate-600 text-sm">If your notarization doesn't complete for any reason, you won't be charged. We only charge after successful notarization.</p>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq" className="py-20 px-5 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-slate-500">Everything you need to know about online notarization.</p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 px-6 divide-y divide-slate-100">
              {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
            </div>
          </div>
        </section>

        {/* ── TRUST & COMPLIANCE ───────────────────────────────────── */}
        <section className="py-20 px-5 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black mb-2">Trusted. Secure. Compliant.</h2>
              <p className="text-slate-400 max-w-lg mx-auto text-[15px]">We take the legal requirements of notarization seriously. Every session is protected and verifiable.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {TRUST_POINTS.map(({ icon: Icon, color, title, copy }) => (
                <div key={title} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-black text-white mb-2 text-[14px]">{title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{copy}</p>
                </div>
              ))}
            </div>

            {/* Cert badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {CERTS.map(cert => (
                <div key={cert} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs font-black text-white/80">
                  <ShieldCheck size={13} className="text-[#639922]" /> {cert} Compliant
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ──────────────────────────────────────────── */}
        <section className="py-24 px-5 bg-gradient-to-br from-[#185FA5] to-[#0d3d6b] text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-4xl font-black mb-3 leading-tight">Ready to Get Started?</h2>
            <p className="text-blue-100 text-lg mb-10 font-medium">Your documents can be notarized in minutes. No office visit required.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleStart}
                className="flex items-center gap-2 bg-white text-[#185FA5] font-black px-10 py-4 rounded-xl shadow-2xl hover:-translate-y-0.5 transition-all text-[15px]"
              >
                Start Notarization Now <ArrowRight size={18} />
              </button>
              <a
                href="#pricing"
                className="flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-[15px]"
              >
                View Pricing
              </a>
            </div>
            <p className="mt-8 text-blue-200 text-sm font-medium">
              Businesses & law firms: <a href="mailto:sales@pdfa2z.com" className="underline underline-offset-2 hover:text-white transition-colors">Contact us for custom pricing →</a>
            </p>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="bg-slate-900 border-t border-white/10 text-white/60 py-14 px-5">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-10 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#185FA5] rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-white" />
                  </div>
                  <span className="font-black text-white text-sm">pdfa2z Notarize</span>
                </div>
                <p className="text-xs leading-relaxed mb-4">Legally valid remote online notarization. Available 24/7. Secure and affordable.</p>
                <div className="flex gap-3">
                  {['LinkedIn', 'Twitter', 'Facebook'].map(s => (
                    <div key={s} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-bold hover:bg-white/20 cursor-pointer transition-colors text-white">{s[0]}</div>
                  ))}
                </div>
              </div>

              {/* Product */}
              <div>
                <p className="font-black text-white text-xs uppercase tracking-widest mb-4">Product</p>
                <ul className="space-y-2.5 text-xs">
                  {['How It Works', 'Pricing', 'Document Types', 'FAQ', 'Blog'].map(l => (
                    <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <p className="font-black text-white text-xs uppercase tracking-widest mb-4">Company</p>
                <ul className="space-y-2.5 text-xs">
                  {['About', 'Contact', 'Privacy Policy', 'Terms of Service', 'Security'].map(l => (
                    <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <p className="font-black text-white text-xs uppercase tracking-widest mb-4">Stay Updated</p>
                <p className="text-xs mb-3">Get notarization tips and legal updates.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40"
                  />
                  <button className="bg-[#185FA5] hover:bg-[#144e8a] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs">© 2026 pdfa2z.com. All rights reserved.</p>
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <Badge>Licensed Notaries</Badge>
                <Badge>24/7 Available</Badge>
                <Badge>Secure Encryption</Badge>
                <Badge>Money-Back Guarantee</Badge>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};
