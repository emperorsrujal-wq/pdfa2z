import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { validateField, FieldValidationConfig, getFormatHint, getFieldError } from "../utils/journeyFieldValidation";
import { saveJourneyLead, getLeadsForOwner, JourneyLead, updateLeadStatus } from "../services/leadService";
import { getCurrentUser } from "../services/authService";
import { downloadJourneyQR } from "../utils/journeyQR";
import { trackJourneyEvent, getJourneyStats, JourneyStats } from "../services/analyticsService";
import { uploadFile } from "../services/storageService";
import { sendLeadNotification } from "../services/emailService";
import { triggerJourneyWebhook, constructWebhookPayload } from "../services/webhookService";
import { TemplateGallery } from "./TemplateGallery";
import { getVisibleFields, ConditionGroup } from "../utils/journeyConditionals";
import { JourneyFileUpload, FileData } from "./JourneyFileUpload";
import { JourneyReviewStep } from "./JourneyReviewStep";
import { BrandConfig, DEFAULT_BRAND_CONFIG, mergeBrandConfig, loadBrandConfig, applyBrandConfig, autoDetectRegionalSettings } from "../utils/journeyBranding";
import { generateJourneyWorkflow } from "../services/geminiService";
import { extractTextFromPdf } from "../utils/pdfHelpers";
import { 
  Settings, Sparkles, Plus, Trash2, ChevronUp, ChevronDown, Eye, PenTool, 
  Layout as LayoutIcon, Type, CheckCircle, CheckCircle2, BarChart2, Share2, Globe, Copy, Check, Info, X, AlertTriangle 
} from "lucide-react";
import { JOURNEY_TRANSLATIONS, Language } from "../utils/journeyTranslations";

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

function SignaturePad({ onChange }: { onChange: (val: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: any, el: HTMLCanvasElement) => {
    const r = el.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * (el.width / r.width),
      y: (src.clientY - r.top) * (el.height / r.height),
    };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    if (canvasRef.current) {
      last.current = getPos(e, canvasRef.current);
    }
    e.preventDefault();
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || !last.current) return;
    const pos = getPos(e, canvas);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    last.current = pos;
    onChange(canvas.toDataURL());
    e.preventDefault();
  };

  const stop = () => { drawing.current = false; };
  const clear = () => {
    const c = canvasRef.current;
    if (c) {
      c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
      onChange("");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={480}
        height={120}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={stop}
        style={{
          width: "100%",
          height: 120,
          background: "rgba(245,158,11,0.04)",
          border: "1.5px dashed rgba(245,158,11,0.35)",
          borderRadius: 10,
          cursor: "crosshair",
          display: "block",
          touchAction: "none",
        }}
      />
      <button onClick={clear} style={{ position: "absolute", top: 8, right: 10, fontSize: 11, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
      <p style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>Draw your signature above</p>
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
  if (field.type === "signature") return <SignaturePad onChange={onChange} />;
  if (field.type === "date") return <input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} style={base} />;
  return (
    <div>
      <input type="text" value={value || ""} placeholder={`Enter ${field.label.toLowerCase()}`} onChange={(e) => onChange(e.target.value)} style={base} maxLength={field.maxLength} />
      {field.helpText && <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{field.helpText}</p>}
      {error && <p style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>{error}</p>}
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
  .jb-card { background: rgba(10,15,28,0.95); border: 1px solid rgba(245,158,11,0.15); border-radius: 24px; padding: 44px 40px; max-width: 560px; width: 100%; position: relative; z-index: 1; box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
  .jb-brand { display: flex; align-items: center; gap: 8px; font-family: var(--brand-heading-font); font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--brand-primary); margin-bottom: 30px; }
  .jb-brand-pip { width: 6px; height: 6px; background: var(--brand-primary); border-radius: 50%; }
  .jb-title { font-family: var(--brand-heading-font); font-size: 32px; font-weight: 800; line-height: 1.1; margin-bottom: 12px; }
  .jb-title em { font-style: normal; color: var(--brand-primary); }
  .jb-sub { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 30px; }
  .jb-dropzone { border: 2px dashed rgba(245,158,11,0.2); border-radius: 16px; padding: 50px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(245,158,11,0.01); }
  .jb-dropzone:hover { border-color: var(--brand-primary); background: rgba(245,158,11,0.03); }
  .jb-btn { display: block; width: 100%; padding: 14px 28px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
  .jb-btn-gold { background: var(--brand-primary); color: #000; margin-top: 16px; }
  .jb-btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(245,158,11,0.3); }
  .jb-btn-ghost { background: transparent; color: #64748b; border: 1.5px solid rgba(71,85,105,0.3); margin-top: 12px; }
  .jb-spinner { width: 40px; height: 40px; border: 3px solid rgba(245,158,11,0.1); border-top-color: var(--brand-primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
  @keyframes spin { to { transform: rotate(360deg); } }
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
  const [isAutoBuilding, setIsAutoBuilding] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [selectedLead, setSelectedLead] = useState<JourneyLead | null>(null);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState<{ loading: boolean, success?: boolean, error?: string } | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const handleMagicBuild = async () => {
    if (!pdfBytes) return; setIsAutoBuilding(true);
    try {
      const docText = await extractTextFromPdf(new File([pdfBytes], fileName));
      const res = await generateJourneyWorkflow(docText, steps.flatMap(s => s.fields));
      if (res?.steps) { setSteps(res.steps); setCurrentStep(0); setActiveStepId(res.steps[0].id); }
    } catch { setError("AI Build failed."); } finally { setIsAutoBuilding(false); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };
  const setField = (id: string, val: any) => { setFormData(p => ({ ...p, [id]: val })); };

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    const fieldConditions: Record<string, ConditionGroup[]> = {};
    step.fields.forEach(f => { if (f.conditions) fieldConditions[f.id] = f.conditions; });
    
    const visible = getVisibleFields(step.fields, formData, fieldConditions);
    const errors: Record<string, string> = {};
    visible.forEach(f => { if (f.required && !formData[f.id]) errors[f.id] = "Required"; });
    setFieldErrors(errors); return Object.keys(errors).length === 0;
  };

  const fillAndDownload = async () => {
    setIsProcessing(true);
    try {
      if (!pdfBytes) { setStage("complete"); return; }
      const { PDFDocument } = (window as any).PDFLib;
      const doc = await PDFDocument.load(pdfBytes);
      const form = doc.getForm();
      form.getFields().forEach((f: any) => {
        const val = formData[f.getName()];
        if (!val) return;
        try { if (f.constructor.name === "PDFTextField") f.setText(String(val)); } catch {}
      });
      const bytes = await doc.save();
      setFilledUrl(URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })));
      await trackJourneyEvent(fileName, 'complete');
      const user = getCurrentUser();
      const lead = await saveJourneyLead(fileName, steps[0].title, user?.uid || 'guest', formData, new Blob([bytes]), []);
      if (brandConfig.webhookUrl) triggerJourneyWebhook(brandConfig.webhookUrl, "", constructWebhookPayload(fileName, steps[0].title, lead as any, brandConfig));
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
                <button className={`jb-toggle-btn${editorTab === 'insights' ? " active" : ""}`} onClick={() => setEditorTab('insights')}>Leads</button>
              </div>
            </div>
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
                </>
              ) : editorTab === 'settings' ? (
                <div style={{ padding: 10 }}>
                  <label style={{ fontSize: 11 }}>Company Name</label>
                  <input className="brand-input" value={brandConfig.companyName || ""} onChange={e => setBrandConfig(p => ({ ...p, companyName: e.target.value }))} />
                  <label style={{ fontSize: 11 }}>Logo URL</label>
                  <input className="brand-input" value={brandConfig.logoUrl || ""} onChange={e => setBrandConfig(p => ({ ...p, logoUrl: e.target.value }))} />
                </div>
              ) : (
                <div style={{ padding: 10 }}>
                  {leads.map(l => (
                    <div key={l.id} className="jb-side-item" onClick={() => setSelectedLead(l)}>
                      <span style={{ flex: 1 }}>{l.data.full_name || "Guest"}</span> <span style={{ fontSize: 9 }}>{String(l.status)}</span>
                    </div>
                  ))}
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
              <button className="jb-btn jb-btn-gold" style={{ width: 'auto', padding: '8px 24px' }} onClick={() => { setStage("wizard"); setCurrentStep(0); }}>Go Live {"->"}</button>
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
                          {brandConfig.logoUrl && <img src={brandConfig.logoUrl} style={{ height: 32, marginBottom: 20, display: 'block', margin: '0 auto' }} />}
                          <h2 className="jb-title">{s?.title}</h2>
                          {s && getVisibleFields(s.fields, formData, fieldConditions).map(f => (
                            <div key={f.id} className="jb-field">
                              <label>{f.label}</label>
                              <div style={{ height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })()}
            </div>
          </main>
        </div>
      )}

      {stage === "wizard" && (
        <div className="jb-root">
          <div className="jb-card">
            <div className="jb-brand"><span className="jb-brand-pip" /> {brandConfig.companyName || "pdfa2z"}</div>
            {(() => {
              const s = steps[currentStep];
              const fieldConditions: Record<string, ConditionGroup[]> = {};
              s.fields.forEach(f => { if (f.conditions) fieldConditions[f.id] = f.conditions; });
              
              return (
                <>
                  <div className="jb-pills">
                    {steps.map((_, i) => <div key={i} className={`jb-pill${i <= currentStep ? " done" : ""}`} />)}
                  </div>
                  <h2 className="jb-title">{s.title}</h2>
                  <div style={{ marginTop: 24 }}>
                    {getVisibleFields(s.fields, formData, fieldConditions).map(f => (
                      <div key={f.id} className="jb-field">
                        <label>{f.label}</label>
                        <FieldInput field={f} value={formData[f.id]} onChange={v => setField(f.id, v)} error={fieldErrors[f.id]} />
                      </div>
                    ))}
                  </div>
                  <div className="jb-btn-row">
                    {currentStep > 0 && <button className="jb-btn jb-btn-ghost" onClick={() => setCurrentStep(p => p - 1)}>Back</button>}
                    <button className="jb-btn jb-btn-gold" onClick={() => { if (validateCurrentStep()) { if (currentStep < steps.length - 1) setCurrentStep(p => p + 1); else setStage("review"); } }}>{currentStep === steps.length - 1 ? "Review" : "Next"}</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

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
        <div className="jb-root">
          <div className="jb-card" style={{ textAlign: "center" }}>
            <CheckCircle2 size={60} color="#10b981" style={{ margin: '0 auto 20px' }} />
            <h1 className="jb-title">Success!</h1>
            <p className="jb-sub">Form processed successfully.</p>
            {filledUrl && <a href={filledUrl} download={fileName} className="jb-btn jb-btn-gold" style={{ textDecoration: 'none' }}>Download PDF</a>}
            <button className="jb-btn jb-btn-ghost" onClick={reset}>Start New</button>
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
    </>
  );
};
