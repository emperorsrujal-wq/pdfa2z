import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { validateField, FieldValidationConfig, getFormatHint, getFieldError } from "../utils/journeyFieldValidation";
import { saveJourneyLead, getLeadsForOwner, JourneyLead, updateLeadStatus, addToSyncQueue, processSyncQueue, deleteLead } from "../services/leadService";
import { getCurrentUser } from "../services/authService";
import { downloadJourneyQR } from "../utils/journeyQR";
import { trackJourneyEvent, getJourneyStats, JourneyStats } from "../services/analyticsService";
import { uploadFile } from "../services/storageService";
import { sendLeadNotification } from "../services/emailService";
import { triggerJourneyWebhook, constructWebhookPayload } from "../services/webhookService";
import { getGeoData, maskIp } from "../services/geoService";
import { TemplateGallery } from "./TemplateGallery";
import { JourneyBrandConfig } from "./JourneyBrandConfig";
import { getVisibleFields, ConditionGroup } from "../utils/journeyConditionals";
import { JourneyFileUpload, FileData } from "./JourneyFileUpload";
import { JourneyReviewStep } from "./JourneyReviewStep";
import { BrandConfig, DEFAULT_BRAND_CONFIG, mergeBrandConfig, loadBrandConfig, applyBrandConfig, autoDetectRegionalSettings } from "../utils/journeyBranding";
import { generateJourneyWorkflow, translateJourneyContent } from "../services/geminiService";
import { extractTextFromPdf } from "../utils/pdfHelpers";
import { 
  Settings, Sparkles, Plus, Trash2, ChevronUp, ChevronDown, Eye, PenTool, Download,
  Layout as LayoutIcon, Type, CheckCircle, CheckCircle2, BarChart2, Share2, Globe, Copy, Check, Info, X, AlertTriangle 
} from "lucide-react";
import { JOURNEY_TRANSLATIONS, Language } from "../utils/journeyTranslations";
import { SecurityTrust } from "./SecurityTrust";
import { WorldMap } from "./WorldMap";
import { JourneyShareModal } from "./JourneyShareModal";

// --- Types -------------------------------------------------------------------

export interface Field {
  id: string;
  name: string;
  label: string;
  type: string;
  options: string[];
  required?: boolean;
  validationType?: 'email' | 'phone' | 'ssn' | 'zip' | 'date' | 'url' | 'currency' | 'text' | 'number';
  minLength?: number;
  maxLength?: number;
  helpText?: string;
  example?: string;
  conditions?: ConditionGroup[];
  acceptedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
}

interface FormData {
  [key: string]: any;
}

// --- Utilities ---------------------------------------------------------------

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });

const formatLabel = (name: string) =>
  name
    .replace(/([A-Z])/g, " $1")
    .replace(/[_.\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

const mapFieldType = (type: string) =>
  ({ Tx: "text", Btn: "checkbox", Ch: "select", Sig: "signature" }[type] || "text");

const autoStepTitle = (fields: Field[], n: number) => {
  const ns = fields.map((f) => f.label.toLowerCase());
  if (ns.some((x) => /name|first|last/.test(x))) return "Personal Info";
  if (ns.some((x) => /address|city|state|zip/.test(x))) return "Address";
  if (ns.some((x) => /sign/.test(x))) return "Sign & Submit";
  if (ns.some((x) => /email|phone|contact/.test(x))) return "Contact Info";
  if (ns.some((x) => /date/.test(x))) return "Date & Confirmation";
  return `Section ${n}`;
};

const FALLBACK_STEPS: Step[] = [
  {
    id: "s0",
    title: "Personal Info",
    fields: [
      { id: "full_name", name: "full_name", label: "Full Name", type: "text", options: [] },
      { id: "email", name: "email", label: "Email Address", type: "email", options: [] },
      { id: "phone", name: "phone", label: "Phone Number", type: "text", options: [] },
    ],
  },
  {
    id: "s1",
    title: "Sign & Submit",
    fields: [
      { id: "date", name: "date", label: "Today's Date", type: "date", options: [] },
      { id: "signature", name: "signature", label: "Signature", type: "signature", options: [] },
    ],
  },
];

// --- Signature Canvas --------------------------------------------------------

function SignatureModal({ onSign, onCancel, allowType }: { onSign: (v: string) => void; onCancel: () => void; allowType?: boolean }) {
  const [tab, setTab] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (tab === 'draw') {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.lineCap = "round"; ctx.lineWidth = 2.5; ctx.strokeStyle = "#000";
        }
      }
    }
  }, [tab]);

  const getPos = (e: any) => {
    const c = canvasRef.current; if (!c) return null;
    const r = c.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const start = (e: any) => { drawing.current = true; last.current = getPos(e); };
  const move = (e: any) => {
    if (!drawing.current || !last.current) return;
    const c = canvasRef.current; const ctx = c?.getContext("2d");
    const pos = getPos(e);
    if (ctx && pos) {
      ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      last.current = pos;
    }
    e.preventDefault();
  };
  const stop = () => { drawing.current = false; };
  const clear = () => { const c = canvasRef.current; c?.getContext("2d")?.clearRect(0, 0, c.width, c.height); };

  const handleAdopt = () => {
    if (tab === 'draw') {
      const c = canvasRef.current; if (c) onSign(c.toDataURL());
    } else {
      const c = document.createElement('canvas'); c.width = 400; c.height = 100;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.font = 'italic 48px "Brush Script MT", cursive';
        ctx.fillText(typedName || 'Signature', 20, 60);
        onSign(c.toDataURL());
      }
    }
  };

  return (
    <div className="jb-modal-overlay" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="jb-modal" style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Sign Document</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Draw or type your legal signature</p>
            </div>
            <X size={20} onClick={onCancel} style={{ cursor: 'pointer', color: '#64748b' }} />
          </div>

          <div className="jb-toggle-group" style={{ marginBottom: 20 }}>
            <button className={`jb-toggle-btn ${tab === 'draw' ? 'active' : ''}`} onClick={() => setTab('draw')}>Draw</button>
            {allowType && <button className={`jb-toggle-btn ${tab === 'type' ? 'active' : ''}`} onClick={() => setTab('type')}>Type</button>}
          </div>

          {tab === 'draw' ? (
            <div style={{ position: 'relative' }}>
              <canvas ref={canvasRef} width={450} height={160} onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop} onTouchStart={start} onTouchMove={move} onTouchEnd={stop} style={{ width: '100%', height: 160, background: '#fff', borderRadius: 12, border: '2px dashed #e2e8f0', cursor: 'crosshair', touchAction: 'none' }} />
              <button onClick={clear} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 11, color: '#64748b', cursor: 'pointer' }}>Clear</button>
            </div>
          ) : (
            <input type="text" placeholder="Type your name..." value={typedName} onChange={e => setTypedName(e.target.value)} style={{ width: '100%', height: 60, fontSize: 24, padding: 16, background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, outline: 'none', fontFamily: '"Brush Script MT", cursive' }} />
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="jb-btn jb-btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
            <button className="jb-btn jb-btn-gold" onClick={handleAdopt} style={{ flex: 2 }}>Adopt & Sign</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field Renderer ───────────────────────────────────────────────────────────

function FieldInput({ field, value, onChange, error }: { field: Field; value: any; onChange: (v: any) => void; error?: string | null }) {
  const base: React.CSSProperties = {
    width: "100%",
    background: "rgba(15,23,42,0.9)",
    border: error ? "1.5px solid #f87171" : "1.5px solid rgba(71,85,105,0.45)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#e2e8f0",
    fontFamily: "inherit",
    fontSize: 15,
    outline: "none",
    boxShadow: error ? "0 0 0 3px rgba(248, 113, 113, 0.1)" : "none",
  };

  if (field.type === "checkbox") {
    return (
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", color: "#cbd5e1", fontSize: 15 }}>
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#f59e0b", cursor: "pointer", flexShrink: 0 }} />
          {field.label} {field.required && <span style={{ color: "#f87171" }}>*</span>}
        </label>
        {field.helpText && <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{field.helpText}</p>}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={{ ...base, cursor: "pointer" }}>
        <option value="">- Select -</option>
        {field.options.map((o) => ( <option key={o} value={o}>{o}</option> ))}
      </select>
    );
  }
  if (field.type === "signature") {
    return (
      <div 
        onClick={() => onChange('OPEN_SIGN_MODAL')}
        style={{ ...base, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderStyle: value ? 'solid' : 'dashed', borderColor: value ? 'var(--brand-primary)' : 'rgba(71,85,105,0.45)' }}
      >
        {value ? (
          <img src={value} style={{ maxHeight: '100%', maxWidth: '100%' }} />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <PenTool size={20} style={{ color: 'var(--brand-primary)', marginBottom: 4 }} />
            <div style={{ fontSize: 12, color: '#64748b' }}>Click to Sign</div>
          </div>
        )}
      </div>
    );
  }
  if (field.type === "date") return <input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} style={base} />;
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={value || ""} 
          placeholder={field.example || `Enter ${field.label.toLowerCase()}`} 
          onChange={(e) => onChange(e.target.value)} 
          style={base} 
          maxLength={field.maxLength} 
        />
        {field.maxLength && (
          <div style={{ position: 'absolute', bottom: -18, right: 0, fontSize: 9, fontWeight: 700, color: (value?.length || 0) > field.maxLength * 0.9 ? 'var(--brand-error)' : '#64748b' }}>
            {value?.length || 0} / {field.maxLength}
          </div>
        )}
      </div>
      {(field.helpText || field.validationType) && (
        <p style={{ fontSize: 11, color: "#64748b", marginTop: field.maxLength ? 12 : 6, display: 'flex', justifyContent: 'space-between' }}>
          <span>{field.helpText}</span>
          {field.validationType && <span style={{ opacity: 0.7, fontStyle: 'italic' }}>{getFormatHint(field.validationType)}</span>}
        </p>
      )}
      {error && <p style={{ fontSize: 11, color: "#f87171", marginTop: 4, fontWeight: 700 }}>{error}</p>}
    </div>
  );
}

// --- CSS ----------------------------------------------------------------------

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;500;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  :root {
    --brand-primary: #f59e0b;
    --brand-accent: #fbbf24;
    --brand-success: #10b981;
    --brand-error: #f87171;
    --brand-bg: #0f172a;
    --brand-text: #e2e8f0;
    --brand-text-secondary: #94a3b8;
    --brand-font-family: Inter, sans-serif;
    --brand-heading-font: Bricolage Grotesque, sans-serif;
  }
  .jb-root { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--brand-bg); font-family: var(--brand-font-family); color: var(--brand-text); padding: 24px; position: relative; overflow: hidden; }
  .jb-card { background: rgba(10,15,28,0.95); border: 1px solid rgba(245,158,11,0.15); border-radius: 24px; padding: 44px 40px; max-width: 560px; width: 100%; position: relative; z-index: 1; box-shadow: 0 30px 80px rgba(0,0,0,0.5); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .jb-brand { display: flex; align-items: center; gap: 8px; font-family: var(--brand-heading-font); font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--brand-primary); margin-bottom: 30px; }
  .jb-brand-pip { width: 6px; height: 6px; background: var(--brand-primary); border-radius: 50%; }
  .jb-title { font-family: var(--brand-heading-font); font-size: 32px; font-weight: 800; line-height: 1.1; margin-bottom: 12px; transition: all 0.3s; }
  .jb-title em { font-style: normal; color: var(--brand-primary); }
  .jb-sub { color: var(--brand-text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 30px; }
  .jb-dropzone { border: 2px dashed rgba(245,158,11,0.2); border-radius: 16px; padding: 50px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(245,158,11,0.01); }
  .jb-dropzone:hover { border-color: var(--brand-primary); background: rgba(245,158,11,0.03); }
  .jb-btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px 28px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; font-family: var(--brand-font-family); min-height: 54px; gap: 8px; user-select: none; }
  .jb-btn-gold { background: var(--brand-primary); color: #000; margin-top: 16px; }
  .jb-btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(245,158,11,0.3); opacity: 0.95; }
  .jb-btn-gold:active { transform: translateY(0); }
  .jb-btn-ghost { background: transparent; color: var(--brand-text-secondary); border: 1.5px solid rgba(71,85,105,0.3); margin-top: 12px; }
  .jb-btn-ghost:hover { border-color: var(--brand-primary); color: var(--brand-text); }
  .jb-spinner { width: 40px; height: 40px; border: 3px solid rgba(245,158,11,0.1); border-top-color: var(--brand-primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* RTL Support */
  .jb-root[dir="rtl"] { text-align: right; }
  .jb-root[dir="rtl"] .jb-brand { flex-direction: row-reverse; }
  .jb-root[dir="rtl"] .jb-side-item { flex-direction: row-reverse; text-align: right; }
  .jb-root[dir="rtl"] .jb-btn { flex-direction: row-reverse; }
  
  /* Mobile Optimizations */
  @media (max-width: 640px) {
    .jb-root { padding: 16px; background: #05080f; }
    .jb-card { padding: 32px 24px; border-radius: 0; position: fixed; inset: 0; max-width: none; border: none; overflow-y: auto; }
    .jb-title { font-size: 26px; }
    .jb-btn { padding: 18px 24px; font-size: 16px; } /* Larger touch targets */
    .field-input { font-size: 16px !important; } /* Stop iOS zoom on focus */
  }

  .jb-editor-layout { display: flex; width: 100%; max-width: 1440px; height: 100vh; overflow: hidden; background: #05080f; }
  .jb-sidebar { width: 320px; background: #0a0f1c; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; }
  .jb-sidebar-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .jb-sidebar-content { flex: 1; overflow-y: auto; padding: 10px; }
  .jb-side-item { width: 100%; padding: 12px 16px; border-radius: 10px; color: #94a3b8; text-align: left; display: flex; align-items: center; gap: 10px; cursor: pointer; border: 1px solid transparent; background: transparent; transition: all 0.2s; margin-bottom: 4px; }
  .jb-side-item.active { background: rgba(244,158,11,0.05); border-color: rgba(244,158,11,0.1); color: #f49e0b; }
  .jb-preview-pane { flex: 1; display: flex; flex-direction: column; }
  .jb-toolbar { height: 64px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
  .jb-canvas { flex: 1; overflow-y: auto; padding: 60px 40px; display: flex; justify-content: center; background: radial-gradient(circle at 50% 50%, rgba(244,158,11,0.03) 0%, transparent 70%); }
  .jb-toggle-group { display: flex; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 8px; }
  .jb-toggle-btn { padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #64748b; }
  .jb-toggle-btn.active { background: #f49e0b; color: #000; }
  .brand-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; margin-bottom: 16px; outline: none; }
  .brand-input:focus { border-color: var(--brand-primary); }
  .jb-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .jb-modal { background: #0a0f1c; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 40px 100px rgba(0,0,0,0.6); }
  
  /* Focused Mode Transitions */
  .field-container { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
  .field-enter { opacity: 0; transform: translateY(20px); }
  .field-enter-active { opacity: 1; transform: translateY(0); }
  .field-exit { opacity: 0; transform: translateY(-20px); }
`;

// --- Main Component -----------------------------------------------------------

export const PDFJourneyBuilder: React.FC = () => {
  const [stage, setStage] = useState<"upload" | "detecting" | "configure" | "wizard" | "review" | "complete">("upload");
  const [libsReady, setLibsReady] = useState(false);
  const [libError, setLibError] = useState(false);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [fileData, setFileData] = useState<Record<string, FileData[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [filledUrl, setFilledUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [noFields, setNoFields] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    const saved = loadBrandConfig();
    return mergeBrandConfig(saved || undefined);
  });
  const [isEditorMode, setIsEditorMode] = useState(true);
  const [editorTab, setEditorTab] = useState<'steps' | 'settings' | 'insights' | 'leads'>('steps');
  const [language, setLanguage] = useState<Language>('en');
  const [leads, setLeads] = useState<JourneyLead[]>([]);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [isAutoBuilding, setIsAutoBuilding] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [selectedLead, setSelectedLead] = useState<JourneyLead | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [signingFieldId, setSigningFieldId] = useState<string | null>(null);
  const [webhookTestStatus, setWebhookTestStatus] = useState<{ loading: boolean, success?: boolean, error?: string } | null>(null);
  const [isLogoUploading, setIsLogoUploading] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);
  const stepStartTimeRef = useRef<number>(0);
  const [isComplianceMode, setIsComplianceMode] = useState(false);
  const [variant, setVariant] = useState<'v1' | 'v2'>('v1');

  useEffect(() => {
    // Detect template from URL
    const params = new URLSearchParams(window.location.search);
    const template = params.get('template');
    if (template && stage === 'upload') {
      // Logic to trigger template load (already supported by TemplateGallery)
      setShowTemplateGallery(true);
    }
  }, [stage]);

  useEffect(() => {
    (async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        await loadScript("https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js");
        setLibsReady(true);
      } catch { setLibError(true); }
    })();
  }, []);

  useEffect(() => {
    const keys = Object.keys(localStorage);
    const draftKey = keys.find(k => k.startsWith('jb_draft_'));
    if (draftKey) setDraft(JSON.parse(localStorage.getItem(draftKey)!));
  }, []);

  useEffect(() => { applyBrandConfig(brandConfig); }, [brandConfig]);

  useEffect(() => {
    const fetchStats = async () => {
      try { const s = await getJourneyStats(fileName || 'unnamed'); setStats(s); } catch (err) { console.error(err); }
    };
    if (editorTab === 'insights') fetchStats();
  }, [editorTab, fileName]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const user = getCurrentUser();
        if (user) { const l = await getLeadsForOwner(user.uid); setLeads(l); }
      } catch (err) { console.error(err); }
    };
    if (editorTab === 'leads') fetchLeads();
  }, [editorTab]);

  useEffect(() => {
    if (!brandConfig.locale) {
      const detected = autoDetectRegionalSettings();
      setBrandConfig(p => ({ ...p, ...detected }));
    }
  }, []);

  useEffect(() => {
    // A/B Testing Variant Assignment (Sticky)
    const storedVariant = localStorage.getItem(`jb_variant_${fileName || 'global'}`);
    if (storedVariant === 'v1' || storedVariant === 'v2') {
      setVariant(storedVariant);
    } else {
      const assigned = Math.random() > 0.5 ? 'v2' : 'v1';
      setVariant(assigned);
      localStorage.setItem(`jb_variant_${fileName || 'global'}`, assigned);
    }
  }, [fileName]);

  useEffect(() => {
    // Process any leads that were buffered while offline
    processSyncQueue(async (data) => {
      console.log('[Sync] Resyncing lead data:', data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (stage === 'wizard') {
      startTimeRef.current = Date.now();
      stepStartTimeRef.current = Date.now();
      trackJourneyEvent(fileName || 'unnamed', 'start', { variant });
      
      // Auto-detect browser language and switch if translation exists
      const browserLang = navigator.language.split("-")[0];
      if (brandConfig.localizedContent?.[browserLang]) {
        setCurrentLanguage(browserLang);
      }
    }
  }, [stage, brandConfig.localizedContent, variant]);

  const saveDraft = (data: FormData) => {
    localStorage.setItem(`jb_draft_${fileName}`, JSON.stringify({ fileName, steps, formData: data }));
  };

  const processFile = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Please upload a PDF."); return; }
    if (!libsReady) { setError("Engine loading..."); return; }
    setError(""); setFileName(file.name); setStage("detecting");
    const bytes = await file.arrayBuffer(); setPdfBytes(bytes);
    try {
      const pdfjsLib = (window as any).pdfjsLib;
      const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const raw = await pdf.getFieldObjects();
      let detected: Field[] = [];
      if (raw) {
        detected = Object.entries(raw).map(([name, arr]: [string, any]) => ({
          id: name, name, label: formatLabel(name), type: mapFieldType(arr[0].type), options: (arr[0].options || []).map((o: any) => o.displayValue || o.exportValue || o)
        }));
      }
      let builtSteps: Step[] = [];
      if (detected.length > 0) {
        for (let i = 0; i < detected.length; i += 4) {
          const chunk = detected.slice(i, i + 4);
          builtSteps.push({ id: `s${i}`, title: autoStepTitle(chunk, builtSteps.length + 1), fields: chunk });
        }
      } else { builtSteps = FALLBACK_STEPS; setNoFields(true); }
      setSteps(builtSteps); setStage("configure"); setActiveStepId(builtSteps[0].id);
    } catch { setError("Parse error."); setStage("upload"); }
  };

  const handleTranslateContent = async (lang: string) => {
    if (!lang || lang === 'en') return;
    setIsTranslating(true);
    try {
      const translated = await translateJourneyContent(steps, lang);
      setBrandConfig(p => ({
        ...p,
        localizedContent: { ...p.localizedContent, [lang]: translated }
      }));
    } catch (e) {
      setError("Translation failed. Please check your AI settings.");
    }
    setIsTranslating(false);
  };

  const handleMagicBuild = async () => {
    if (!pdfBytes) return; setIsAutoBuilding(true);
    try {
      const docText = await extractTextFromPdf(new File([pdfBytes], fileName));
      const res = await generateJourneyWorkflow(docText, steps.flatMap(s => s.fields));
      if (res?.steps) { setSteps(res.steps); setCurrentStep(0); setActiveStepId(res.steps[0].id); }
    } catch { setError("AI Build failed."); } finally { setIsAutoBuilding(false); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };
  const setField = (id: string, value: any) => {
    if (value === 'OPEN_SIGN_MODAL') {
      setSigningFieldId(id);
      return;
    }
    const updated = { ...formData, [id]: value };
    setFormData(updated);
    if (stage === 'wizard') saveDraft(updated);
  };

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    const fieldConditions: Record<string, ConditionGroup[]> = {};
    step.fields.forEach(f => { if (f.conditions) fieldConditions[f.id] = f.conditions; });
    
    const visible = getVisibleFields(step.fields, formData, fieldConditions);
    const errors: Record<string, string> = {};
    visible.forEach(f => { if (f.required && !formData[f.id]) errors[f.id] = "Required"; });
    setFieldErrors(errors); return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    const step = steps[currentStep];
    const fieldConditions: Record<string, ConditionGroup[]> = {};
    step.fields.forEach(f => { if (f.conditions) fieldConditions[f.id] = f.conditions; });
    const visible = getVisibleFields(step.fields, formData, fieldConditions);

    if (brandConfig.isFocusedMode) {
      const field = visible[activeFieldIndex];
      if (field.required && !formData[field.id]) {
        setFieldErrors({ [field.id]: "Required" });
        trackJourneyEvent(fileName || 'unnamed', 'field_error', { fieldId: field.id, stepId: step.id, variant });
        return;
      }
      setFieldErrors({});
      if (activeFieldIndex < visible.length - 1) {
        setActiveFieldIndex(activeFieldIndex + 1);
      } else {
        if (currentStep < steps.length - 1) {
          const duration = Math.floor((Date.now() - stepStartTimeRef.current) / 1000);
          trackJourneyEvent(fileName || 'unnamed', 'step_complete', { stepId: step.id, duration, variant });
          setCurrentStep(p => p + 1);
          stepStartTimeRef.current = Date.now();
          setActiveFieldIndex(0);
        } else {
          setStage("review");
        }
      }
    } else {
      if (validateCurrentStep()) {
        if (currentStep < steps.length - 1) {
          const duration = Math.floor((Date.now() - stepStartTimeRef.current) / 1000);
          trackJourneyEvent(fileName || 'unnamed', 'step_complete', { stepId: step.id, duration, variant });
          setCurrentStep(p => p + 1);
          stepStartTimeRef.current = Date.now();
          setActiveFieldIndex(0);
        } else {
          setStage("review");
        }
      } else {
        // Track the first visible error
        const firstErrorId = Object.keys(fieldErrors)[0];
        if (firstErrorId) {
          trackJourneyEvent(fileName || 'unnamed', 'field_error', { fieldId: firstErrorId, stepId: step.id, variant });
        }
      }
    }
  };

  const handleBack = () => {
    if (brandConfig.isFocusedMode) {
      if (activeFieldIndex > 0) {
        setActiveFieldIndex(activeFieldIndex - 1);
      } else if (currentStep > 0) {
        const prevStep = steps[currentStep - 1];
        const fieldConditions: Record<string, ConditionGroup[]> = {};
        prevStep.fields.forEach(f => { if (f.conditions) fieldConditions[f.id] = f.conditions; });
        const visible = getVisibleFields(prevStep.fields, formData, fieldConditions);
        setCurrentStep(p => p - 1);
        setActiveFieldIndex(visible.length - 1);
      }
    } else {
      if (currentStep > 0) setCurrentStep(p => p - 1);
    }
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (stage === 'wizard' && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'TEXTAREA') {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [stage, currentStep, activeFieldIndex, formData, steps, brandConfig.isFocusedMode]);

  const fillAndDownload = async () => {
    setIsProcessing(true);
    try {
      if (!pdfBytes) { setStage("complete"); return; }
      const { PDFDocument, rgb, StandardFonts } = (window as any).PDFLib;
      const doc = await PDFDocument.load(pdfBytes);
      const form = doc.getForm();
      const fields = form.getFields();

      for (const f of fields) {
        const name = f.getName();
        const val = formData[name];
        if (!val) continue;

        try {
          if (f.constructor.name === "PDFTextField") {
            f.setText(String(val));
          } else if (f.constructor.name === "PDFSignature" || (f.constructor.name === "PDFButton" && val.startsWith('data:image'))) {
            // Handle Signature Injection
            const image = await doc.embedPng(val);
            const widgets = f.acroField.getWidgets();
            for (const widget of widgets) {
              const pages = doc.getPages();
              // pdf-lib doesn't easily give page index from widget, so we find it
              const page = pages.find((p: any) => p.node.context === widget.getOption('P')?.context || p.node.context === widget.getOption('Page')?.context) || pages[0];
              const rect = widget.getRectangle();
              page.drawImage(image, {
                x: rect.x + 2,
                y: rect.y + 2,
                width: rect.width - 4,
                height: rect.height - 4,
              });
            }
          }
        } catch (err) {
          console.warn(`Could not fill field ${name}:`, err);
        }
      }

      // Get GeoData for lead and audit trail
      const geoData = await getGeoData();

      // Add Audit Trail if enabled
      if (brandConfig.includeAuditTrail) {
        const page = doc.addPage([600, 400]);
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const subFont = await doc.embedFont(StandardFonts.Helvetica);
        
        page.drawRectangle({ x: 0, y: 0, width: 600, height: 400, color: rgb(0.06, 0.09, 0.16) });
        page.drawText('Certificate of Completion', { x: 50, y: 340, size: 24, font, color: rgb(0.96, 0.62, 0.04) });
        page.drawText(`Submission ID: ${Math.random().toString(36).substring(2, 15).toUpperCase()}`, { x: 50, y: 300, size: 12, font: subFont, color: rgb(0.8, 0.8, 0.8) });
        page.drawText(`Signed on: ${new Date().toLocaleString()}`, { x: 50, y: 280, size: 12, font: subFont, color: rgb(0.8, 0.8, 0.8) });
        page.drawText(`Location: ${geoData?.city || 'Unknown'}, ${geoData?.country || 'Unknown'}`, { x: 50, y: 260, size: 12, font: subFont, color: rgb(0.8, 0.8, 0.8) });
        page.drawText(`Verified IP: ${maskIp(geoData?.ip || '0.0.0.0')}`, { x: 50, y: 240, size: 12, font: subFont, color: rgb(0.8, 0.8, 0.8) });
        
        page.drawRectangle({ x: 50, y: 80, width: 500, height: 120, color: rgb(1, 1, 1), opacity: 0.05 });
        page.drawText('This document was digitally signed and secured via PDFA2Z Enterprise.', { x: 70, y: 180, size: 11, font: subFont, color: rgb(0.6, 0.6, 0.6) });
        page.drawText('Verification QR Code', { x: 70, y: 150, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      }

      const bytes = await doc.save();
      setFilledUrl(URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })));
      
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      await trackJourneyEvent(fileName, 'complete', { duration, variant });
      const user = getCurrentUser();
      const lead = await saveJourneyLead(fileName, steps[0].title, user?.uid || 'guest', formData, new Blob([bytes]), [], geoData as any);
      
      // Send notification to owner (if we have an email)
      if (user?.email || brandConfig.supportEmail) {
        await sendLeadNotification(user?.email || brandConfig.supportEmail || '', lead as any, brandConfig.emailTemplate);
      }

      if (brandConfig.webhookUrl) {
        try {
          const payload = constructWebhookPayload(fileName, steps[0].title, lead as any, brandConfig);
          const result = await triggerJourneyWebhook(brandConfig.webhookUrl, brandConfig.webhookSecret || "", payload);
          if (!result.success) {
             console.warn('Webhook failed, adding to sync queue:', result.error);
             addToSyncQueue({ type: 'webhook_trigger', data: { url: brandConfig.webhookUrl, leadId: (lead as any).id, data: formData }});
          }
        } catch (e) {
          console.error('Webhook error:', e);
          addToSyncQueue({ type: 'webhook_trigger', data: { url: brandConfig.webhookUrl, leadId: (lead as any).id, data: formData }});
        }
      }
    } catch (e) { console.error(e); }
    setStage("complete"); setIsProcessing(false);
  };

  const reset = () => { setStage("upload"); setFormData({}); setSteps([]); setFileName(""); setFilledUrl(null); };

  const restoreDraft = () => {
    if (!draft) return;
    setSteps(draft.steps); setFormData(draft.formData); setFileName(draft.fileName); setStage("configure");
  };

  const addStep = () => { const id = `s${Date.now()}`; setSteps(p => [...p, { id, title: "New Step", fields: [] }]); setActiveStepId(id); };
  const removeStep = (id: string) => { setSteps(p => p.filter(s => s.id !== id)); };
  const updateStep = (id: string, up: Partial<Step>) => { setSteps(p => p.map(s => s.id === id ? { ...s, ...up } : s)); };
  const updateField = (sId: string, fId: string, up: Partial<Field>) => {
    setSteps(p => p.map(s => s.id === sId ? { ...s, fields: s.fields.map(f => f.id === fId ? { ...f, ...up } : f) } : s));
  };
  const removeFieldFromStep = (sId: string, fId: string) => {
    setSteps(p => p.map(s => s.id === sId ? { ...s, fields: s.fields.filter(f => f.id !== fId) } : s));
  };

  return (
    <>
      <style>{CSS}</style>
      <style>{brandConfig.customCss}</style>

      {stage === "upload" && (
        <div className="jb-root">
          <div className="jb-card">
            <div className="jb-brand"><span className="jb-brand-pip" /> pdfa2z - Journey Builder</div>
            <h1 className="jb-title">Turn any PDF into a<br /><em>Digital Journey</em></h1>
            <p className="jb-sub">Upload a PDF form and we will automatically convert it into a beautiful, guided wizard.</p>
            <div className={`jb-dropzone${dragging ? " drag" : ""}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}>
              <LayoutIcon size={40} style={{ color: '#f59e0b', marginBottom: 16 }} />
              <p><strong>Drop PDF here</strong> or click to browse</p>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
            </div>
            {error && <p className="jb-err">{error}</p>}
            {draft && (
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(245,158,11,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sparkles size={20} color="#f59e0b" />
                <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Restore Draft?</p><p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{draft.fileName}</p></div>
                <button className="jb-btn jb-btn-gold" onClick={restoreDraft} style={{ width: 'auto', padding: '8px 16px', fontSize: 12 }}>Restore</button>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "detecting" && (
        <div className="jb-root">
          <div className="jb-card" style={{ textAlign: "center" }}>
            <div className="jb-spinner" />
            <h1 className="jb-title">Analysing <em>your PDF</em></h1>
            <p className="jb-sub">Detecting fields and auto-building structure...</p>
          </div>
        </div>
      )}

      {stage === "configure" && (
        <div className="jb-editor-layout">
          <aside className="jb-sidebar">
            <div className="jb-sidebar-header">
              <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b' }}>DESIGNER</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{fileName}</div>
            </div>
            <div style={{ padding: '0 10px', marginTop: 10 }}>
              <div className="jb-toggle-group">
                <button className={`jb-toggle-btn${editorTab === 'steps' ? " active" : ""}`} onClick={() => setEditorTab('steps')}>Workflow</button>
                <button className={`jb-toggle-btn${editorTab === 'settings' ? " active" : ""}`} onClick={() => setEditorTab('settings')}>Identity</button>
                <button className={`jb-toggle-btn${editorTab === 'insights' ? " active" : ""}`} onClick={() => setEditorTab('insights')}>Insights</button>
                <button className={`jb-toggle-btn${editorTab === 'leads' ? " active" : ""}`} onClick={() => setEditorTab('leads')}>Leads</button>
              </div>
            </div>
            {editorTab === 'settings' && (
              <div style={{ padding: '20px 20px 0' }}>
                 <div style={{ padding: 16, background: 'rgba(245,158,11,0.05)', borderRadius: 16, border: '1px solid rgba(245,158,11,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                       <Globe size={16} className="text-amber-500" />
                       <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>ENTERPRISE SYNC</span>
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                       <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8', cursor: 'pointer' }}>
                          <input type="checkbox" checked={brandConfig.crmMappingEnabled} onChange={e => setBrandConfig(p => ({ ...p, crmMappingEnabled: e.target.checked }))} />
                          Enable CRM Auto-Mapping
                       </label>
                       <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8', cursor: 'pointer' }}>
                          <input type="checkbox" checked={brandConfig.abTestingEnabled} onChange={e => setBrandConfig(p => ({ ...p, abTestingEnabled: e.target.checked }))} />
                          A/B Test Variant (v2)
                       </label>
                    </div>
                 </div>
              </div>
            )}
            <div className="jb-sidebar-content">
              {editorTab === 'steps' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px' }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>STEPS</span>
                    <Plus size={14} onClick={addStep} style={{ cursor: 'pointer' }} />
                  </div>
                  {steps.map(s => (
                    <div key={s.id} className={`jb-side-item${activeStepId === s.id ? " active" : ""}`} onClick={() => setActiveStepId(s.id)}>
                      <LayoutIcon size={14} /> <span style={{ flex: 1 }}>{s.title}</span> <span>{s.fields.length}</span>
                    </div>
                  ))}
                  <div style={{ padding: 10, marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>AI LOCALIZATION</div>
                    <select 
                      onChange={(e) => handleTranslateContent(e.target.value)} 
                      disabled={isTranslating}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none' }}
                    >
                      <option value="">Translate with AI...</option>
                      <option value="es">Spanish (Español)</option>
                      <option value="fr">French (Français)</option>
                      <option value="de">German (Deutsch)</option>
                      <option value="pt">Portuguese (Português)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="zh">Chinese (中文)</option>
                    </select>
                    {isTranslating && <p style={{ fontSize: 10, color: 'var(--brand-primary)', marginTop: 4 }}>Gemini is translating your content...</p>}
                  </div>
                </>
              ) : editorTab === 'settings' ? (
                <div style={{ height: '100%', overflowY: 'auto' }}>
                  <JourneyBrandConfig 
                    initialConfig={brandConfig} 
                    availableFields={steps.flatMap(s => s.fields).map(f => ({ id: f.id, label: f.label }))}
                    onConfigChange={(newConfig) => {
                      setBrandConfig(newConfig);
                    }}
                    onSave={(newConfig) => {
                      setBrandConfig(newConfig);
                    }}
                  />
                </div>
              ) : editorTab === 'insights' ? (
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 20 }}>CONVERSION FUNNEL</div>
                  {stats ? (
                    <>
                      <div style={{ display: 'grid', gap: 10 }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: '#64748b' }}>VIEWS</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{stats.viewCount}</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--brand-primary)', width: '100%', borderRadius: 2 }} />
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: '#64748b' }}>STARTS</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{stats.startCount}</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--brand-primary)', width: `${(stats.startCount / (stats.viewCount || 1)) * 100}%`, borderRadius: 2, opacity: 0.7 }} />
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: '#64748b' }}>SUBMISSIONS</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{stats.completeCount}</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--brand-primary)', width: `${(stats.completeCount / (stats.viewCount || 1)) * 100}%`, borderRadius: 2, opacity: 0.4 }} />
                      </div>
                      
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                        <div style={{ background: 'rgba(245,158,11,0.05)', padding: 12, borderRadius: 12 }}>
                          <div style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>TOTAL CONV.</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b' }}>
                            {Math.round((stats.completeCount / (stats.viewCount || 1)) * 100)}%
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,158,11,0.03)', padding: 12, borderRadius: 12 }}>
                          <div style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>AVG. TIME</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                            {Math.round(stats.totalCompletionTime / (stats.completeCount || 1))}s
                          </div>
                        </div>
                      </div>

                      {/* A/B Test Variant Comparison */}
                      {stats.variantStats && (
                        <div style={{ marginTop: 20 }}>
                          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>A/B TEST PERFORMANCE</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {['v1', 'v2'].map(v => {
                              const s = stats.variantStats![v] || { views: 0, starts: 0, completes: 0 };
                              const cr = Math.round((s.completes / (s.views || 1)) * 100);
                              const isWinner = v === (Math.round((stats.variantStats!['v1'].completes / (stats.variantStats!['v1'].views || 1)) * 100) < Math.round((stats.variantStats!['v2'].completes / (stats.variantStats!['v2'].views || 1)) * 100) ? 'v2' : 'v1');
                              
                              return (
                                <div key={v} style={{ background: isWinner ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, border: isWinner ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 9, fontWeight: 800, color: isWinner ? '#10b981' : '#64748b' }}>VARIANT {v.toUpperCase()}</span>
                                    {isWinner && <div style={{ background: '#10b981', width: 6, height: 6, borderRadius: '50%' }} />}
                                  </div>
                                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{cr}%</div>
                                  <div style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>{s.completes} leads / {s.views} views</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>GEOGRAPHIC HEAT MAP</div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <WorldMap leads={leads} />
                      </div>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>DROP-OFF & TIMING PER STEP</div>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {steps.map((s, i) => {
                          const count = stats.stepCompletions?.[s.id] || 0;
                          const prevCount = i === 0 ? stats.startCount : (stats.stepCompletions?.[steps[i-1].id] || 0);
                          const dropOff = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0;
                          const width = stats.startCount > 0 ? (count / stats.startCount) * 100 : 0;
                          const avgTime = Math.round((stats.stepTimes?.[s.id] || 0) / (count || 1));

                          return (
                            <div key={s.id} style={{ position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 10 }}>
                                <span style={{ color: '#cbd5e1' }}>{s.title}</span>
                                <span style={{ color: '#94a3b8' }}>{count} users · {avgTime}s avg.</span>
                              </div>
                              <div style={{ height: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                                <div style={{ height: '100%', width: `${width}%`, background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', opacity: 0.6 }} />
                                {i > 0 && dropOff > 0 && (
                                  <div style={{ position: 'absolute', right: 8, top: 4, fontSize: 9, color: '#f87171', fontWeight: 700 }}>
                                    -{dropOff}% LOSS
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Friction Points (Field Errors) */}
                    {Object.keys(stats.fieldErrors || {}).length > 0 && (
                      <div style={{ marginTop: 25 }}>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>FRICTION POINTS (FIELD ERRORS)</div>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {Object.entries(stats.fieldErrors)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([fieldId, errorCount]) => (
                            <div key={fieldId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: 'rgba(248,113,113,0.05)', borderRadius: 10, border: '1px solid rgba(248,113,113,0.1)' }}>
                              <div style={{ color: '#f87171' }}><AlertTriangle size={14} /></div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 700 }}>{formatLabel(fieldId)}</div>
                                <div style={{ fontSize: 9, color: '#64748b' }}>{errorCount} validation failures</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    </>
                  ) : (
                    <div>Loading stats...</div>
                  )}
                </div>
              ) : (
                <div style={{ padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 5px' }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>RECENT LEADS</span>
                    <button 
                      onClick={() => {
                        const csv = [
                          'Date,Name,Email,Status,Data',
                          ...leads.map(l => `${new Date(l.createdAt).toLocaleDateString()},${l.data.full_name || ''},${l.data.email || ''},${l.status},"${JSON.stringify(l.data).replace(/"/g, '""')}"`)
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `leads_${fileName}.csv`;
                        a.click();
                      }} 
                      style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Export CSV
                    </button>
                  </div>
                  {leads.map(l => (
                    <div key={l.id} className="jb-side-item" style={{ position: 'relative', paddingRight: 30 }} onClick={() => setSelectedLead(l)}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.data.full_name || l.data.email || "Guest"}</span> 
                      <span style={{ fontSize: 9, opacity: 0.6 }}>{String(l.status).toUpperCase()}</span>
                      <Trash2 
                        size={12} 
                        style={{ position: 'absolute', right: 10, top: 12, opacity: 0.4, cursor: 'pointer' }} 
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          if (confirm('Delete lead?')) {
                            await deleteLead(l.id!);
                            setLeads(p => p.filter(x => x.id !== l.id));
                          }
                        }} 
                      />
                    </div>
                  ))}
                  {leads.length === 0 && <p style={{ textAlign: 'center', fontSize: 11, color: '#64748b', marginTop: 20 }}>No leads yet</p>}
                </div>
              )}
            </div>
            <div className="jb-sidebar-footer">
              <button className="jb-btn jb-btn-ghost" onClick={handleMagicBuild} disabled={isAutoBuilding} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Sparkles size={14} /> {isAutoBuilding ? "AI analysis..." : "AI Magic Build"}
              </button>
            </div>
          </aside>
          <main className="jb-preview-pane">
            <div className="jb-toolbar">
              <div className="jb-toggle-group">
                <button className={`jb-toggle-btn${isEditorMode ? " active" : ""}`} onClick={() => setIsEditorMode(true)}>Editor</button>
                <button className={`jb-toggle-btn${!isEditorMode ? " active" : ""}`} onClick={() => setIsEditorMode(false)}>Live Preview</button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  className="jb-btn jb-btn-ghost" 
                  style={{ width: 'auto', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 size={14} /> Distribute
                </button>
                <button className="jb-btn jb-btn-gold" style={{ width: 'auto', padding: '8px 24px' }} onClick={() => { setStage("wizard"); setCurrentStep(0); }}>Go Live {"->"}</button>
              </div>
            </div>
            <div className="jb-canvas">
                {(() => {
                  const s = steps.find(x => x.id === activeStepId) || steps[0];
                  const fieldConditions: Record<string, ConditionGroup[]> = {};
                  if (s) s.fields.forEach(f => { if (f.conditions) fieldConditions[f.id] = f.conditions; });

                  return (
                    <div className="jb-card" style={{ maxWidth: 600 }}>
                      {isEditorMode ? (
                        <>
                          <input style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, fontWeight: 800, width: '100%', marginBottom: 20 }} value={s?.title} onChange={e => updateStep(s.id, { title: e.target.value })} />
                          {s?.fields.map(f => (
                            <div key={f.id} style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, marginBottom: 10 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 10, color: '#64748b' }}>{f.type.toUpperCase()}</span>
                                <Trash2 size={12} onClick={() => removeFieldFromStep(s.id, f.id)} style={{ cursor: 'pointer' }} />
                              </div>
                              <input className="brand-input" value={f.label} onChange={e => updateField(s.id, f.id, { label: e.target.value })} style={{ marginBottom: 0 }} />
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          {brandConfig.logoUrl && <img src={brandConfig.logoUrl} style={{ height: brandConfig.logoHeight || 32, marginBottom: 24, display: 'block', margin: '0 auto' }} />}
                          <h2 className="jb-title" style={{ color: 'var(--brand-text)' }}>{brandConfig.journeyTitle || s?.title}</h2>
                          {s && (() => {
                            const visible = getVisibleFields(s.fields, formData, fieldConditions);
                            if (brandConfig.isFocusedMode) {
                              const f = visible[0]; // Show first field in preview
                              if (!f) return null;
                              return (
                                <div key={f.id} className="jb-field" style={{ marginBottom: 16 }}>
                                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-text-secondary)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                                  <div style={{ height: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }} />
                                </div>
                              );
                            }
                            return visible.map(f => (
                              <div key={f.id} className="jb-field" style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-text-secondary)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                                <div style={{ height: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }} />
                              </div>
                            ));
                          })()}
                        </>
                      )}
                    </div>
                  );
                })()}
            </div>
          </main>
        </div>
      )}

      {stage === "wizard" && (() => {
        const isRtl = ['ar', 'he'].includes(currentLanguage);
        const t = (key: string) => (JOURNEY_TRANSLATIONS[currentLanguage as Language] || JOURNEY_TRANSLATIONS.en)[key];
        
        return (
          <div className="jb-root" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="jb-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="jb-brand"><span className="jb-brand-pip" /> {brandConfig.companyName || "pdfa2z"}</div>
              {brandConfig.localizedContent && Object.keys(brandConfig.localizedContent).length > 0 && (
                <div style={{ position: 'relative' }}>
                  <select 
                    value={currentLanguage} 
                    onChange={(e) => setCurrentLanguage(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 6, outline: 'none' }}
                  >
                    <option value="en">🇺🇸 EN</option>
                    {Object.keys(brandConfig.localizedContent).map(l => (
                      <option key={l} value={l}>{{es:'🇲🇽 ES', fr:'🇫🇷 FR', de:'🇩🇪 DE', pt:'🇧🇷 PT', hi:'🇮🇳 HI', zh:'🇨🇳 ZH'}[l] || l.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {(() => {
              const activeSteps = (currentLanguage !== 'en' && brandConfig.localizedContent?.[currentLanguage]) || steps;
              const s = activeSteps[currentStep];
              if (!s) return null;
              
              const fieldConditions: Record<string, ConditionGroup[]> = {};
              s.fields.forEach((f: any) => { if (f.conditions) fieldConditions[f.id] = f.conditions; });
              
              return (
                <>
                  <div className="jb-pills" style={{ marginBottom: 30, display: 'flex', gap: 6 }}>
                    {activeSteps.map((_, i) => <div key={i} className="jb-pill" style={{ height: 4, flex: 1, borderRadius: 2, background: i <= currentStep ? 'var(--brand-primary)' : 'rgba(255,255,255,0.1)' }} />)}
                  </div>
                  <h2 className="jb-title">{brandConfig.journeyTitle || s.title}</h2>
                  <div style={{ marginTop: 24, minHeight: brandConfig.isFocusedMode ? 280 : 'auto', position: 'relative' }}>
                    {(() => {
                      const visible = getVisibleFields(s.fields, formData, fieldConditions);
                      if (brandConfig.isFocusedMode) {
                        const f = visible[activeFieldIndex];
                        if (!f) return null;
                        return (
                          <div key={f.id} className="field-container">
                             <div className="jb-field" style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {currentLanguage === 'en' ? 'Question' : {es:'Pregunta', fr:'Question', de:'Frage'}[currentLanguage] || 'Question'} {activeFieldIndex + 1} of {visible.length}
                                </div>
                                <label style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand-text)', display: 'block', marginBottom: 12, lineHeight: 1.2 }}>{f.label}{f.required && '*'}</label>
                                <FieldInput 
                                  field={f} 
                                  value={formData[f.id]} 
                                  onChange={v => {
                                    setField(f.id, v);
                                    // Auto-transition for single selection
                                    if (['select', 'checkbox'].includes(f.type) && v) {
                                      setTimeout(handleNext, 400);
                                    }
                                  }} 
                                  error={fieldErrors[f.id]} 
                                />
                             </div>
                          </div>
                        );
                      }
                      return visible.map(f => (
                        <div key={f.id} className="jb-field" style={{ marginBottom: 20 }}>
                          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-text-secondary)', display: 'block', marginBottom: 8 }}>{f.label}{f.required && '*'}</label>
                          <FieldInput field={f} value={formData[f.id]} onChange={v => setField(f.id, v)} error={fieldErrors[f.id]} />
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Trust and Time Estimator */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 24, paddingTop: 20 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {brandConfig.showSecurityBadges !== false && (
                          <SecurityTrust 
                            horizontal 
                            enabledBadges={brandConfig.enabledSecurityBadges} 
                            className="opacity-70 scale-90 origin-left" 
                          />
                        )}
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textAlign: 'right', flex: 1 }}>
                          <span style={{ color: 'var(--brand-primary)' }}>EST. REMAINING: </span>
                          {Math.max(1, Math.ceil((steps.length - currentStep) * 0.8))} MINS
                        </div>
                     </div>
                  </div>

                  <div className="jb-btn-row" style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                    {(currentStep > 0 || (brandConfig.isFocusedMode && activeFieldIndex > 0)) && (
                      <button className="jb-btn jb-btn-ghost" style={{ flex: 1 }} onClick={handleBack}>{t('back')}</button>
                    )}
                    <button className="jb-btn jb-btn-gold" style={{ flex: 2 }} onClick={handleNext}>
                      {brandConfig.isFocusedMode 
                        ? (activeFieldIndex === getVisibleFields(s.fields, formData, fieldConditions).length - 1 && currentStep === activeSteps.length - 1 ? t('review') : t('continue'))
                        : (currentStep === activeSteps.length - 1 ? t('review') : t('continue'))}
                    </button>
                  </div>
                </>
              );
            })()}
            </div>
          </div>
        );
      })()}

      {stage === "review" && (
        <div className="jb-root">
          <JourneyReviewStep
            steps={steps} formData={formData} fileData={fileData}
            onEdit={idx => { setCurrentStep(idx); setStage("wizard"); }}
            onConfirm={consent => consent && fillAndDownload()}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {stage === "complete" && (
        <div className="jb-root" style={{ background: 'var(--brand-bg)' }}>
          <div className="jb-card animate-in zoom-in-95 duration-500" style={{ textAlign: "center", maxWidth: 500 }}>
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
               <div style={{ position: 'absolute', inset: 0, background: 'var(--brand-primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(10px)' }} />
               <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <CheckCircle2 size={40} />
               </div>
            </div>

            <h1 className="jb-title" style={{ fontSize: 32, marginBottom: 8 }}>{brandConfig.successMessage || "Journey Complete!"}</h1>
            <p className="jb-sub" style={{ marginBottom: 32 }}>{brandConfig.successSubtitle || "Your compliant document is ready for download."}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
               <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>Time Saved</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-primary)' }}>~12 Mins</div>
               </div>
               <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>Compliance</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>Verified</div>
               </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {filledUrl && (
                <a href={filledUrl} download={fileName} className="jb-btn jb-btn-gold" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 24px' }}>
                  <Download size={18} /> Download Protected PDF
                </a>
              )}
              <button className="jb-btn jb-btn-ghost" onClick={reset}>Securely Logout & Restart</button>
            </div>

            <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               <p style={{ fontSize: 11, color: '#64748b' }}>
                  🔒 This session was protected with 256-bit encryption. {brandConfig.isPipedaCompliant ? "Data purged in compliance with PIPEDA." : "Standard audit logs retained."}
               </p>
            </div>
          </div>
        </div>
      )}

      {selectedLead && (
        <div className="jb-modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="jb-modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Lead Details</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setSelectedLead(null)} />
            </div>
            <div style={{ padding: 24 }}>
              {Object.entries(selectedLead.data).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{k.toUpperCase()}</div>
                  <div style={{ color: '#fff' }}>{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <JourneyShareModal 
          fileName={fileName} 
          journeyTitle={brandConfig.journeyTitle || steps[0]?.title || "PDF Journey"} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </>
  );
};
