import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { validateField, FieldValidationConfig, getFormatHint, getFieldError } from "../utils/journeyFieldValidation";
import { getVisibleFields, ConditionGroup } from "../utils/journeyConditionals";
import { JourneyFileUpload, FileData } from "./JourneyFileUpload";
import { JourneyReviewStep } from "./JourneyReviewStep";
import { BrandConfig, DEFAULT_BRAND_CONFIG, mergeBrandConfig, loadBrandConfig, applyBrandConfig } from "../utils/journeyBranding";
import { generateJourneyWorkflow } from "../services/geminiService";
import { extractTextFromPdf } from "../utils/pdfHelpers";
import { Settings, Sparkles, Plus, Trash2, ChevronUp, ChevronDown, Eye, PenTool, Layout as LayoutIcon, Type, CheckCircle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Field {
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
  conditions?: ConditionGroup[];  // Conditions for showing this field
}

interface Step {
  id: string;
  title: string;
  description?: string; // Optional intro text for the step
  fields: Field[];
}

interface FormData {
  [key: string]: any;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

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

// ─── Signature Canvas ─────────────────────────────────────────────────────────

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

  const stop = () => {
    drawing.current = false;
  };

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
      <button
        onClick={clear}
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          fontSize: 11,
          color: "#64748b",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        Clear
      </button>
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
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "#f59e0b", cursor: "pointer", flexShrink: 0 }}
          />
          {field.label}
          {field.required && <span style={{ color: "#f87171" }}>*</span>}
        </label>
        {field.helpText && <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{field.helpText}</p>}
        {error && <p style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>⚠ {error}</p>}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={{ ...base, cursor: "pointer" }}>
        <option value="">— Select —</option>
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "signature") return <SignaturePad onChange={onChange} />;
  if (field.type === "date")
    return <input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} style={base} />;
  if (field.type === "email")
    return (
      <input
        type="email"
        value={value || ""}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        onChange={(e) => onChange(e.target.value)}
        style={base}
      />
    );
  return (
    <div>
      <input
        type="text"
        value={value || ""}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        onChange={(e) => onChange(e.target.value)}
        style={base}
        maxLength={field.maxLength}
      />
      {field.helpText && <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{field.helpText}</p>}
      {field.example && <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Example: {field.example}</p>}
      {field.validationType && <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Format: {getFormatHint(field.validationType)}</p>}
      {error && <p style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,500;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

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

  .jb-root {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: var(--brand-bg);
    font-family: var(--brand-font-family);
    color: var(--brand-text); padding: 24px; position: relative; overflow: hidden;
    border-radius: 24px;
  }
  .jb-glow-tl {
    position: fixed; top: -300px; left: -300px;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%);
    pointer-events: none; z-index: 0;
  }
  .jb-glow-br {
    position: fixed; bottom: -300px; right: -300px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%);
    pointer-events: none; z-index: 0;
  }
  .jb-card {
    background: rgba(10,15,28,0.95);
    border: 1px solid var(--brand-primary);
    border-opacity: 0.13;
    border-radius: 22px;
    padding: 44px 40px;
    max-width: 560px; width: 100%;
    position: relative; z-index: 1;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.025), 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
    animation: jb-cardIn 0.4s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes jb-cardIn { from { opacity:0; transform:translateY(18px) scale(0.98); } to { opacity:1; transform:none; } }

  .jb-brand {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--brand-heading-font);
    font-size: 12px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--brand-primary); margin-bottom: 30px;
  }
  .jb-brand-pip { width: 6px; height: 6px; background: var(--brand-primary); border-radius: 50%; box-shadow: 0 0 8px var(--brand-primary); }
  .jb-brand-logo { height: 32px; margin-right: 8px; }

  .jb-title { font-family: var(--brand-heading-font); font-size: 30px; font-weight: 800; line-height: 1.15; color: var(--brand-text); margin-bottom: 12px; }
  .jb-title em { font-style: normal; color: var(--brand-primary); }
  .jb-sub { color: #4e6080; font-size: 14px; line-height: 1.65; margin-bottom: 30px; }
  .jb-sub strong { color: var(--brand-text-secondary); font-weight: 500; }

  .jb-dropzone {
    border: 2px dashed rgba(245,158,11,0.22); border-radius: 16px;
    padding: 52px 28px; text-align: center; cursor: pointer;
    background: rgba(245,158,11,0.015);
    transition: border-color 0.2s, background 0.2s;
  }
  .jb-dropzone:hover, .jb-dropzone.drag { border-color: rgba(245,158,11,0.55); background: rgba(245,158,11,0.04); }
  .jb-dropzone-icon { font-size: 44px; margin-bottom: 16px; line-height: 1; }
  .jb-dropzone-label { color: #94a3b8; font-size: 15px; line-height: 1.7; }
  .jb-dropzone-label strong { color: #f59e0b; }
  .jb-dropzone-hint { font-size: 12px; color: #374151; margin-top: 6px; }

  .jb-btn { display: block; width: 100%; padding: 14px 28px; border-radius: 12px; font-family: var(--brand-font-family); font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
  .jb-btn-gold { background: var(--brand-primary); color: #000; margin-top: 16px; }
  .jb-btn-gold:hover { background: var(--brand-accent); box-shadow: 0 4px 20px rgba(245,158,11,0.3); transform: translateY(-1px); }
  .jb-btn-ghost { background: transparent; color: #64748b; border: 1.5px solid rgba(71,85,105,0.35); margin-top: 12px; }
  .jb-btn-ghost:hover { color: var(--brand-text); border-color: rgba(148,163,184,0.4); }

  .jb-pills { display: flex; gap: 5px; margin-bottom: 28px; }
  .jb-pill { height: 3px; border-radius: 2px; flex: 1; background: rgba(71,85,105,0.3); transition: background 0.35s; }
  .jb-pill.done { background: var(--brand-primary); }
  .jb-pill.active { background: rgba(245,158,11,0.45); }

  .jb-step-meta { margin-bottom: 26px; }
  .jb-step-num { font-size: 12px; color: #475569; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
  .jb-step-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; font-weight: 700; color: #f8fafc; }

  .jb-field { margin-bottom: 20px; }
  .jb-field label { display: block; font-size: 13px; font-weight: 500; color: #64748b; margin-bottom: 8px; letter-spacing: 0.025em; }

  .jb-btn-row { display: flex; gap: 10px; margin-top: 28px; }
  .jb-btn-row .jb-btn { margin: 0; flex: 1; }
  .jb-btn-row .jb-btn-gold { flex: 2; }

  .jb-spinner { width: 44px; height: 44px; border: 3px solid rgba(245,158,11,0.12); border-top-color: #f59e0b; border-radius: 50%; animation: jb-spin 0.75s linear infinite; margin: 0 auto 20px; }
  @keyframes jb-spin { to { transform: rotate(360deg); } }
  .jb-loading-card { text-align: center; padding: 16px 0 8px; }

  .jb-summary-list { border: 1px solid rgba(245,158,11,0.1); border-radius: 14px; overflow: hidden; margin: 20px 0 8px; }
  .jb-summary-row { padding: 13px 18px; border-bottom: 1px solid rgba(30,41,59,0.8); display: flex; flex-direction: column; gap: 5px; }
  .jb-summary-row:last-child { border-bottom: none; }
  .jb-summary-row-top { display: flex; align-items: center; gap: 10px; }
  .jb-summary-step-num { font-size: 11px; font-weight: 700; color: #f59e0b; letter-spacing: 0.08em; text-transform: uppercase; }
  .jb-summary-step-name { font-size: 14px; font-weight: 500; color: #e2e8f0; }
  .jb-badge { font-size: 10px; padding: 2px 9px; border-radius: 20px; background: rgba(245,158,11,0.1); color: #f59e0b; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-left: auto; }
  .jb-summary-fields { font-size: 12px; color: #374151; }

  .jb-success-wrap { text-align: center; padding: 8px 0 4px; }
  .jb-success-icon { font-size: 64px; margin-bottom: 18px; line-height: 1; filter: drop-shadow(0 0 20px rgba(245,158,11,0.4)); }

  .jb-err { color: #f87171; font-size: 13px; margin-top: 12px; text-align: center; }
  .jb-notice { color: #475569; font-size: 12px; margin-top: 10px; text-align: center; }

  .jb-root input:focus, .jb-root select:focus, .jb-root textarea:focus {
    outline: none;
    border-color: rgba(245,158,11,0.5) !important;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.08) !important;
  }

  /* ─── DESIGNER STYLES ───────────────────────────────── */
  .jb-editor-layout {
    display: flex; gap: 24px; width: 100%; max-width: 1400px; height: calc(100vh - 120px);
    animation: jb-fadeIn 0.5s ease;
  }
  @keyframes jb-fadeIn { from { opacity:0; } to { opacity:1; } }

  .jb-sidebar {
    width: 320px; background: rgba(10,15,28,0.9); border: 1px solid rgba(245,158,11,0.1);
    border-radius: 20px; display: flex; flex-direction: column; overflow: hidden;
    backdrop-blur: 10px;
  }
  .jb-sidebar-header {
    padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex; align-items: center; justify-content: space-between;
  }
  .jb-sidebar-content { flex: 1; overflow-y: auto; padding: 12px; }
  .jb-sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.05); }

  .jb-side-item {
    width: 100%; padding: 12px 16px; border-radius: 12px; background: transparent;
    border: 1px solid transparent; color: #94a3b8; text-align: left;
    display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;
    margin-bottom: 4px;
  }
  .jb-side-item:hover { background: rgba(255,255,255,0.03); color: #e2e8f0; }
  .jb-side-item.active { 
    background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); color: #f59e0b;
    box-shadow: inset 0 0 12px rgba(245,158,11,0.03);
  }

  .jb-preview-pane {
    flex: 1; display: flex; flex-direction: column; gap: 20px;
  }
  .jb-toolbar {
    background: rgba(10,15,28,0.8); backdrop-blur: 12px; padding: 12px 24px;
    border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);
    display: flex; align-items: center; justify-content: space-between;
  }
  .jb-canvas {
    flex: 1; background: rgba(10,15,28,0.5); border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.03); overflow-y: auto;
    display: flex; justify-content: center; padding: 40px;
  }

  .jb-field-edit-card {
    background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.05);
    border-radius: 16px; padding: 20px; margin-top: 12px;
  }

  .jb-toggle-group {
    display: flex; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 10px;
  }
  .jb-toggle-btn {
    padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; border: none; background: transparent; color: #64748b;
  }
  .jb-toggle-btn.active { background: #f59e0b; color: #000; }
`;

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const [editorTab, setEditorTab] = useState<'steps' | 'settings'>('steps');
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isAutoBuilding, setIsAutoBuilding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load PDF.js + pdf-lib
  useEffect(() => {
    (async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        await loadScript("https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js");
        setLibsReady(true);
      } catch {
        setLibError(true);
      }
    })();
  }, []);

  // Apply brand configuration
  useEffect(() => {
    applyBrandConfig(brandConfig);
  }, [brandConfig]);

  const processFile = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a valid PDF file.");
      return;
    }
    if (!libsReady) {
      setError("PDF engine still loading, please wait a moment.");
      return;
    }
    setError("");
    setFileName(file.name);
    setStage("detecting");

    let bytes: ArrayBuffer;
    try {
      bytes = await file.arrayBuffer();
    } catch {
      setError("Could not read file.");
      setStage("upload");
      return;
    }
    setPdfBytes(bytes);

    try {
      const pdfjsLib = (window as any).pdfjsLib;
      const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
      const raw = await pdf.getFieldObjects();

      let detected: Field[] = [];
      if (raw && Object.keys(raw).length > 0) {
        detected = Object.entries(raw).map(([name, arr]: [string, any]) => {
          const f = arr[0];
          return {
            id: name,
            name,
            label: formatLabel(name),
            type: mapFieldType(f.type),
            options: (f.options || []).map((o: any) => o.displayValue || o.exportValue || o),
          };
        });
      }

      let builtSteps: Step[];
      if (detected.length > 0) {
        setNoFields(false);
        builtSteps = [];
        for (let i = 0; i < detected.length; i += 4) {
          const chunk = detected.slice(i, i + 4);
          builtSteps.push({ id: `s${i}`, title: autoStepTitle(chunk, builtSteps.length + 1), fields: chunk });
        }
      } else {
        setNoFields(true);
        builtSteps = FALLBACK_STEPS;
      }

      setSteps(builtSteps);
      setStage("configure");
    } catch (e) {
      console.error(e);
      setError("Could not parse this PDF. Try a different file.");
      setStage("upload");
    }
  };

  const handleMagicBuild = async () => {
    if (!pdfBytes) return;
    setIsAutoBuilding(true);
    setError("");

    try {
      const docText = await extractTextFromPdf(new File([pdfBytes], fileName));
      const allFields = steps.flatMap(s => s.fields);
      const result = await generateJourneyWorkflow(docText, allFields);
      
      if (result && result.steps && result.steps.length > 0) {
        setSteps(result.steps);
        setCurrentStep(0);
        setActiveStepId(result.steps[0].id);
      }
    } catch (e) {
      console.error(e);
      setError("AI was unable to re-organize this document. Please try manual editing.");
    } finally {
      setIsAutoBuilding(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const setField = (id: string, val: any) => {
    setFormData((p) => ({ ...p, [id]: val }));
    // Clear error for this field when user starts typing
    if (fieldErrors[id]) {
      setFieldErrors((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    if (stage !== "wizard" || currentStep >= steps.length) return true;

    const step = steps[currentStep];

    // Get visible fields based on conditions
    const fieldConditions: Record<string, ConditionGroup[]> = {};
    step.fields.forEach((field) => {
      if (field.conditions) {
        fieldConditions[field.id] = field.conditions;
      }
    });
    const visibleFields = getVisibleFields(step.fields, formData, fieldConditions);

    const errors: Record<string, string> = {};
    let hasErrors = false;

    // Only validate visible fields
    visibleFields.forEach((field) => {
      const config: FieldValidationConfig = {
        required: field.required || false,
        type: field.validationType as any,
        minLength: field.minLength,
        maxLength: field.maxLength,
      };

      const error = validateField(formData[field.id], config, field.label);
      if (error) {
        errors[field.id] = error.message;
        hasErrors = true;
      }
    });

    setFieldErrors(errors);
    return !hasErrors;
  };

  const fillAndDownload = async () => {
    setIsProcessing(true);
    try {
      if (!pdfBytes || noFields) {
        setStage("complete");
        setIsProcessing(false);
        return;
      }
      const { PDFDocument } = (window as any).PDFLib;
      const doc = await PDFDocument.load(pdfBytes);
      const form = doc.getForm();
      form.getFields().forEach((field: any) => {
        const name = field.getName();
        const val = formData[name];
        if (!val) return;
        const cn = field.constructor.name;
        try {
          if (cn === "PDFTextField") field.setText(String(val));
          else if (cn === "PDFCheckBox") {
            if (val) field.check();
            else field.uncheck();
          } else if (cn === "PDFDropdown") field.select(String(val));
          else if (cn === "PDFRadioGroup") field.select(String(val));
        } catch (_) {}
      });
      const filled = await doc.save();
      const blob = new Blob([filled], { type: "application/pdf" });
      setFilledUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
    }
    setStage("complete");
    setIsProcessing(false);
  };

  const reset = () => {
    setStage("upload");
    setFormData({});
    setFileData({});
    setFieldErrors({});
    setCurrentStep(0);
    setFilledUrl(null);
    setPdfBytes(null);
    setFileName("");
    setSteps([]);
    setNoFields(false);
  };

  const removeFieldFromStep = (stepId: string, fieldId: string) => {
    setSteps(p => p.map(s => {
      if (s.id !== stepId) return s;
      return { ...s, fields: s.fields.filter(f => f.id !== fieldId) };
    }));
  };

  const updateStep = (id: string, updates: Partial<Step>) => {
    setSteps(p => p.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStep = (id: string) => {
    setSteps(p => p.filter(s => s.id !== id));
    if (activeStepId === id) setActiveStepId(null);
  };

  const addStep = () => {
    const id = `s${Date.now()}`;
    const newStep: Step = { id, title: "New Step", fields: [] };
    setSteps(p => [...p, newStep]);
    setActiveStepId(id);
  };

  const updateField = (stepId: string, fieldId: string, updates: Partial<Field>) => {
    setSteps(p => p.map(s => {
      if (s.id !== stepId) return s;
      return {
        ...s,
        fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
      };
    }));
  };

  const moveField = (fromStepId: string, toStepId: string, fieldId: string) => {
    setSteps(p => {
      const fromStep = p.find(s => s.id === fromStepId);
      const toStep = p.find(s => s.id === toStepId);
      const field = fromStep?.fields.find(f => f.id === fieldId);
      if (!fromStep || !toStep || !field) return p;

      return p.map(s => {
        if (s.id === fromStepId) {
          return { ...s, fields: s.fields.filter(f => f.id !== fieldId) };
        }
        if (s.id === toStepId) {
          return { ...s, fields: [...s.fields, field] };
        }
        return s;
      });
    });
  };

  const totalFields = steps.reduce((a, s) => a + s.fields.length, 0);

  // ─── Upload Stage ──────────────────────────────────────────────────────────
  if (stage === "upload")
    return (
      <>
        <style>{CSS}</style>
        <div className="jb-root">
          <div className="jb-glow-tl" />
          <div className="jb-glow-br" />
          <div className="jb-card">
            <div className="jb-brand">
              <span className="jb-brand-pip" />
              pdfa2z · Journey Builder
            </div>
            <h1 className="jb-title">
              Turn any PDF into a
              <br />
              <em>Digital Journey</em>
            </h1>
            <p className="jb-sub">
              Upload a PDF form and we'll automatically detect all fields and convert them into a beautiful, guided
              wizard your clients can complete on any device.
            </p>
            <div
              className={`jb-dropzone${dragging ? " drag" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <div className="jb-dropzone-icon">📄</div>
              <p className="jb-dropzone-label">
                <strong>Drop your PDF here</strong>
                <br />
                or click to browse files
              </p>
              <p className="jb-dropzone-hint">Supports fillable & non-fillable PDFs · Max 20MB</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              />
            </div>
            {error && <p className="jb-err">{error}</p>}
            {libError && <p className="jb-err">Failed to load PDF engine. Please refresh.</p>}
            {!libsReady && !libError && <p className="jb-notice">⏳ Loading PDF engine…</p>}
          </div>
        </div>
      </>
    );

  // ─── Detecting Stage ───────────────────────────────────────────────────────
  if (stage === "detecting")
    return (
      <>
        <style>{CSS}</style>
        <div className="jb-root">
          <div className="jb-glow-tl" />
          <div className="jb-glow-br" />
          <div className="jb-card">
            <div className="jb-brand">
              <span className="jb-brand-pip" />
              pdfa2z · Journey Builder
            </div>
            <div className="jb-loading-card">
              <div className="jb-spinner" />
              <h1 className="jb-title" style={{ fontSize: 24 }}>
                Analysing <em>your PDF</em>
              </h1>
              <p className="jb-sub" style={{ marginBottom: 0 }}>
                Detecting form fields and auto-building your journey structure…
              </p>
            </div>
          </div>
        </div>
      </>
    );

  // ─── Designer Stage ───────────────────────────────────────────────────────
  if (stage === "configure") {
    const activeStep = steps.find(s => s.id === activeStepId) || steps[0];
    
    return (
      <>
        <style>{CSS}</style>
        <div className="jb-root" style={{ padding: 40 }}>
          <div className="jb-glow-tl" />
          <div className="jb-glow-br" />
          
          <div className="jb-editor-layout">
            {/* Sidebar */}
            <div className="jb-sidebar">
              <div className="jb-sidebar-header" style={{ padding: '12px 16px' }}>
                <div className="jb-toggle-group" style={{ width: '100%' }}>
                  <button 
                    className={`jb-toggle-btn${editorTab === 'steps' ? " active" : ""}`} 
                    onClick={() => setEditorTab('steps')}
                    style={{ flex: 1 }}
                  >
                    Steps
                  </button>
                  <button 
                    className={`jb-toggle-btn${editorTab === 'settings' ? " active" : ""}`} 
                    onClick={() => setEditorTab('settings')}
                    style={{ flex: 1 }}
                  >
                    Branding
                  </button>
                </div>
              </div>
              
              <div className="jb-sidebar-content">
                {editorTab === 'steps' ? (
                  <>
                    <div style={{ padding: '8px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>WORKFLOW STEPS</span>
                      <button onClick={addStep} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                    {steps.map((s, idx) => (
                      <button 
                        key={s.id} 
                        className={`jb-side-item${activeStepId === s.id || (!activeStepId && idx === 0) ? " active" : ""}`}
                        onClick={() => setActiveStepId(s.id)}
                      >
                        <LayoutIcon size={16} />
                        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
                        <span style={{ fontSize: 10, opacity: 0.5 }}>{s.fields.length}</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div style={{ padding: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: 'block', marginBottom: 12 }}>IDENTITY & STYLE</span>
                    
                    <div className="jb-field">
                      <label style={{ fontSize: 11 }}>Company Name</label>
                      <input 
                        type="text" 
                        value={brandConfig.companyName || ""} 
                        onChange={(e) => setBrandConfig(p => ({ ...p, companyName: e.target.value }))}
                        className="brand-input" 
                        style={{ fontSize: 13, padding: '8px 12px' }}
                      />
                    </div>

                    <div className="jb-field">
                      <label style={{ fontSize: 11 }}>Primary Color</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input 
                          type="color" 
                          value={brandConfig.primaryColor || "#f59e0b"} 
                          onChange={(e) => setBrandConfig(p => ({ ...p, primaryColor: e.target.value }))}
                          style={{ width: 32, height: 32, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                        />
                        <input 
                          type="text" 
                          value={brandConfig.primaryColor || ""} 
                          onChange={(e) => setBrandConfig(p => ({ ...p, primaryColor: e.target.value }))}
                          className="brand-input" 
                          style={{ fontSize: 12, padding: '4px 8px', flex: 1 }}
                        />
                      </div>
                    </div>

                    <div className="jb-field">
                      <label style={{ fontSize: 11 }}>Logo URL</label>
                      <input 
                        type="text" 
                        value={brandConfig.logoUrl || ""} 
                        onChange={(e) => setBrandConfig(p => ({ ...p, logoUrl: e.target.value }))}
                        className="brand-input" 
                        style={{ fontSize: 13, padding: '8px 12px' }}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="jb-sidebar-footer">
                <button onClick={handleMagicBuild} disabled={isAutoBuilding} className="jb-btn jb-btn-ghost" style={{ fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Sparkles size={14} />
                  {isAutoBuilding ? "Analyzing..." : "AI Magic Build"}
                </button>
              </div>
            </div>

            {/* Preview/Canvas Pane */}
            <div className="jb-preview-pane">
              <div className="jb-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="jb-toggle-group">
                    <button className={`jb-toggle-btn${isEditorMode ? " active" : ""}`} onClick={() => setIsEditorMode(true)}>Design</button>
                    <button className={`jb-toggle-btn${!isEditorMode ? " active" : ""}`} onClick={() => setIsEditorMode(false)}>Preview</button>
                  </div>
                  <span style={{ color: "#475569", fontSize: 13 }}>Editing: <strong>{activeStep?.title}</strong></span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="jb-btn jb-btn-ghost" onClick={reset} style={{ padding: "8px 16px", fontSize: 13 }}>Reset</button>
                  <button className="jb-btn jb-btn-gold" onClick={() => { setCurrentStep(0); setStage("wizard"); }} style={{ padding: "8px 24px", fontSize: 13 }}>Go Live →</button>
                </div>
              </div>

              <div className="jb-canvas">
                <div className="jb-card" style={{ maxWidth: 640, margin: 0, animation: "none" }}>
                  {isEditorMode ? (
                    <div>
                      <div style={{ marginBottom: 24 }}>
                        <label className="jb-step-num">Step Title</label>
                        <input 
                          type="text" 
                          value={activeStep?.title || ""} 
                          onChange={(e) => updateStep(activeStep!.id, { title: e.target.value })}
                          className="jb-title-input"
                          style={{ background: "transparent", border: "none", borderBottom: "2px solid rgba(245,158,11,0.2)", width: "100%", fontSize: 24, fontWeight: 800, color: "#fff", padding: "8px 0", outline: "none" }}
                        />
                      </div>

                      <div style={{ marginBottom: 24 }}>
                        <label className="jb-step-num">Step Description (Explainer Intro)</label>
                        <textarea 
                          value={activeStep?.description || ""} 
                          onChange={(e) => updateStep(activeStep!.id, { description: e.target.value })}
                          style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px", width: "100%", color: "#94a3b8", fontSize: 13, minHeight: 80, outline: "none" }}
                          placeholder="Guide your clients with a warm introduction for this step..."
                        />
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {activeStep?.fields.map((f) => (
                          <div key={f.id} className="jb-field-edit-card" style={{ borderLeft: activeFieldId === f.id ? "3px solid #f59e0b" : "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Type size={14} style={{ color: "#64748b" }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{f.name}</span>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button className="jb-btn-icon" onClick={() => removeFieldFromStep(activeStep.id, f.id)}><Trash2 size={14} /></button>
                              </div>
                            </div>
                            <input 
                              type="text" 
                              value={f.label} 
                              onChange={(e) => updateField(activeStep.id, f.id, { label: e.target.value })}
                              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 12px", width: "100%", color: "#fff", marginBottom: 8 }}
                              placeholder="Display Label"
                            />
                            <textarea 
                              value={f.helpText || ""} 
                              onChange={(e) => updateField(activeStep.id, f.id, { helpText: e.target.value })}
                              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 12px", width: "100%", color: "#94a3b8", fontSize: 12, minHeight: 60 }}
                              placeholder="Help text for client..."
                            />
                          </div>
                        ))}
                        {activeStep?.fields.length === 0 && (
                          <div style={{ padding: 40, textAlign: "center", border: "2px dashed rgba(255,255,255,0.05)", borderRadius: 16, color: "#475569" }}>
                            No fields in this step. Drag fields here or add from the list.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ animation: "jb-fadeIn 0.3s ease" }}>
                      <div className="jb-pills">
                        {steps.map((_, i) => (
                          <div key={i} className={`jb-pill${i === steps.indexOf(activeStep!) ? " active" : ""}`} />
                        ))}
                      </div>
                      <div className="jb-step-meta">
                        <div className="jb-step-num">Step {steps.indexOf(activeStep!) + 1} of {steps.length}</div>
                        <div className="jb-step-title">{activeStep?.title}</div>
                      </div>
                      {activeStep?.fields.map((field) => (
                        <div className="jb-field" key={field.id}>
                          <label>{field.label} {field.required && "*"}</label>
                          <FieldInput field={field} value={formData[field.id]} onChange={() => {}} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Wizard Stage ──────────────────────────────────────────────────────────
  if (stage === "wizard") {
    const step = steps[currentStep];

    // Get visible fields based on conditions
    const fieldConditions: Record<string, ConditionGroup[]> = {};
    step.fields.forEach((field) => {
      if (field.conditions) {
        fieldConditions[field.id] = field.conditions;
      }
    });
    const visibleFields = getVisibleFields(step.fields, formData, fieldConditions);

    const isFirst = currentStep === 0;
    const isLast = currentStep === steps.length - 1;

    return (
      <>
        <style>{CSS}</style>
        <div className="jb-root">
          <div className="jb-glow-tl" />
          <div className="jb-glow-br" />
          <div className="jb-card">
            {/* Progress Bar */}
            <div className="jb-progress-bar-wrap">
              <div 
                className="jb-progress-bar-fill" 
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} 
              />
            </div>

            <div className="jb-brand">
              <span className="jb-brand-pip" />
              {brandConfig.companyName || "pdfa2z"} · Journey
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div className="jb-step-num" style={{ margin: 0 }}>Step {currentStep + 1} of {steps.length}</div>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                ⌛ ~{Math.max(1, Math.ceil((steps.length - currentStep) * 0.5))} min left
              </div>
            </div>

            {/* Step progress pills - keeping them as secondary subtle indicators */}
            <div className="jb-pills" style={{ marginBottom: 20 }}>
              {steps.map((_, i) => (
                <div key={i} className={`jb-pill${i < currentStep ? " done" : i === currentStep ? " active" : ""}`} />
              ))}
            </div>

            {/* Step header */}
            <div className="jb-step-meta">
              <div className="jb-step-num">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="jb-step-title">{step.title}</div>
              {step.description && (
                <p className="jb-sub" style={{ marginTop: 12, marginBottom: 0, fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>
                  {step.description}
                </p>
              )}
            </div>

            {/* Fields */}
            {visibleFields.map((field) => (
              <div className="jb-field" key={field.id}>
                {field.type === "file" ? (
                  <JourneyFileUpload
                    fieldId={field.id}
                    label={field.label}
                    acceptedTypes={field.acceptedTypes || [".pdf", ".jpg", ".png", ".doc", ".docx"]}
                    maxSize={field.maxSize || 10 * 1024 * 1024} // 10MB default
                    maxFiles={field.maxFiles || 5}
                    required={field.required}
                    helpText={field.helpText}
                    value={fileData[field.id] || []}
                    onChange={(files) => setFileData((p) => ({ ...p, [field.id]: files }))}
                    error={fieldErrors[field.id]}
                  />
                ) : (
                  <>
                    {field.type !== "checkbox" && (
                      <label>
                        {field.label}
                        {field.required && <span style={{ color: "#f87171" }}>*</span>}
                      </label>
                    )}
                    <FieldInput
                      field={field}
                      value={formData[field.id]}
                      onChange={(v) => setField(field.id, v)}
                      error={fieldErrors[field.id]}
                    />
                  </>
                )}
              </div>
            ))}

            {/* Nav buttons */}
            <div className="jb-btn-row">
              {!isFirst && (
                <button className="jb-btn jb-btn-ghost" onClick={() => setCurrentStep((c) => c - 1)}>
                  ← Back
                </button>
              )}
              {isLast ? (
                <button
                  className="jb-btn jb-btn-gold"
                  style={{ flex: isFirst ? 1 : 2 }}
                  onClick={() => {
                    if (validateCurrentStep()) {
                      setStage("review");
                    }
                  }}
                >
                  Review & Continue →
                </button>
              ) : (
                <button
                  className="jb-btn jb-btn-gold"
                  style={{ flex: isFirst ? 1 : 2 }}
                  onClick={() => {
                    if (validateCurrentStep()) {
                      setCurrentStep((c) => c + 1);
                    }
                  }}
                >
                  Continue →
                </button>
              )}
            </div>
            {Object.keys(fieldErrors).length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: "rgba(248, 113, 113, 0.1)", borderRadius: 10, borderLeft: "3px solid #f87171" }}>
                <p style={{ fontSize: 12, color: "#f87171", fontWeight: 600, margin: 0 }}>
                  ⚠ Please fix {Object.keys(fieldErrors).length} error{Object.keys(fieldErrors).length === 1 ? "" : "s"} before continuing
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ─── Review Stage ──────────────────────────────────────────────────────────
  if (stage === "review")
    return (
      <>
        <style>{CSS}</style>
        <div className="jb-root">
          <div className="jb-glow-tl" />
          <div className="jb-glow-br" />
          <JourneyReviewStep
            steps={steps}
            formData={formData}
            fileData={fileData}
            onEdit={(stepIndex) => {
              setCurrentStep(stepIndex);
              setStage("wizard");
            }}
            onConfirm={(consent) => {
              if (consent) {
                fillAndDownload();
              }
            }}
            isProcessing={isProcessing}
          />
        </div>
      </>
    );

  // ─── Complete Stage ────────────────────────────────────────────────────────
  if (stage === "complete")
    return (
      <>
        <style>{CSS}</style>
        <div className="jb-root">
          <div className="jb-glow-tl" />
          <div className="jb-glow-br" />
          <div className="jb-card">
            <div className="jb-brand">
              <span className="jb-brand-pip" />
              pdfa2z · Journey Builder
            </div>
            <div className="jb-success-wrap">
              <div className="jb-success-icon">✅</div>
              <h1 className="jb-title">
                Journey <em>Complete</em>
              </h1>
              <p className="jb-sub" style={{ marginBottom: 0 }}>
                {filledUrl
                  ? "Your PDF has been filled with the submitted data and is ready to download."
                  : "Your journey has been submitted. The form data has been captured."}
              </p>
            </div>
            {filledUrl && (
              <a href={filledUrl} download={`filled_${fileName}`} style={{ textDecoration: "none" }}>
                <button className="jb-btn jb-btn-gold">⬇ Download Filled PDF</button>
              </a>
            )}
            <button className="jb-btn jb-btn-ghost" onClick={reset}>
              Start New Journey
            </button>
          </div>
        </div>
      </>
    );

  return null;
};
