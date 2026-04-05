import * as React from 'react';
import {
  Check, X, Trash2, Calendar, Type, Stamp, User, CheckSquare,
  ZoomIn, ZoomOut, PenTool, RotateCcw, Move, GripVertical
} from 'lucide-react';
import { EditElement } from '../utils/pdfHelpers';
import { SignaturePad } from './SignaturePad';

interface PdfSignCanvasProps {
  image: string;
  pageIndex: number;
  totalPages: number;
  initialElements: EditElement[];
  savedSignatures: string[];
  onSave: (elements: EditElement[]) => void;
  onFinish: () => void;
  onCancel: () => void;
  onPageChange: (delta: number) => void;
  onRequestNewSignature: () => void;
}

type FieldType = 'signature' | 'initials' | 'date' | 'name' | 'text' | 'checkbox';

const FIELDS: { type: FieldType; icon: React.ReactNode; label: string; color: string }[] = [
  { type: 'signature', icon: <PenTool size={16} />, label: 'Signature', color: '#0061ef' },
  { type: 'initials',  icon: <User size={14} />,    label: 'Initials',  color: '#7c3aed' },
  { type: 'date',      icon: <Calendar size={14} />, label: 'Date',      color: '#059669' },
  { type: 'name',      icon: <User size={14} />,     label: 'Full Name', color: '#b45309' },
  { type: 'text',      icon: <Type size={14} />,     label: 'Text',      color: '#374151' },
  { type: 'checkbox',  icon: <CheckSquare size={14} />, label: 'Checkbox', color: '#374151' },
];

function fieldColor(fieldType: FieldType) {
  return FIELDS.find(f => f.type === fieldType)?.color || '#374151';
}

export const PdfSignCanvas: React.FC<PdfSignCanvasProps> = ({
  image,
  pageIndex,
  totalPages,
  initialElements,
  savedSignatures,
  onSave,
  onFinish,
  onCancel,
  onPageChange,
  onRequestNewSignature,
}) => {
  const [elements, setElements] = React.useState<EditElement[]>(initialElements);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [showSigPicker, setShowSigPicker] = React.useState(false);
  const [pendingFieldType, setPendingFieldType] = React.useState<FieldType | null>(null);
  const [showNewSigPad, setShowNewSigPad] = React.useState(false);
  const [showSigDropdown, setShowSigDropdown] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setElements(initialElements);
  }, [initialElements, pageIndex]);

  const updateElement = (id: string, updates: Partial<EditElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setActiveId(null);
  };

  const addField = (type: FieldType, sig?: string) => {
    let newEl: EditElement;
    if (type === 'signature' || type === 'initials') {
      newEl = {
        id: `sig-${Date.now()}`,
        type: 'image',
        pageIndex,
        x: 200, y: 600,
        width: type === 'initials' ? 120 : 280,
        height: type === 'initials' ? 60 : 80,
        imageUrl: sig || '',
        opacity: 1,
      };
    } else if (type === 'checkbox') {
      newEl = {
        id: `cb-${Date.now()}`,
        type: 'form-check',
        pageIndex,
        x: 200, y: 400,
        width: 30, height: 30,
        color: '#1a1a1a',
        opacity: 1,
        isChecked: false,
      };
    } else {
      const textMap: Record<string, string> = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        name: 'Full Name',
        text: 'Text',
      };
      newEl = {
        id: `txt-${Date.now()}`,
        type: 'text',
        pageIndex,
        x: 200, y: 400,
        width: 250, height: 35,
        color: '#1a1a1a',
        text: textMap[type] || 'Text',
        size: 14,
        opacity: 1,
      };
    }
    setElements(prev => [...prev, newEl]);
    setActiveId(newEl.id);
    onSave([...elements, newEl]);
  };

  const handleFieldClick = (type: FieldType) => {
    if (type === 'signature' || type === 'initials') {
      if (savedSignatures.length === 0) {
        setPendingFieldType(type);
        setShowNewSigPad(true);
      } else {
        setPendingFieldType(type);
        setShowSigDropdown(true);
      }
    } else {
      addField(type);
    }
  };

  const handleSigSelect = (sig: string) => {
    setShowSigDropdown(false);
    addField(pendingFieldType!, sig);
    setPendingFieldType(null);
  };

  const handleNewSigSaved = (base64: string) => {
    setShowNewSigPad(false);
    addField(pendingFieldType!, base64);
    setPendingFieldType(null);
    onRequestNewSignature(); // bubble up to save signature
  };

  const handleDragStart = (e: React.PointerEvent, el: EditElement) => {
    if (!containerRef.current) return;
    e.stopPropagation();
    setActiveId(el.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const startElX = el.x;
    const startElY = el.y;

    const onMove = (me: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((me.clientX - startX) / rect.width) * 1000;
      const dy = ((me.clientY - startY) / rect.height) * 1000;
      updateElement(el.id, {
        x: Math.max(0, Math.min(950, startElX + dx)),
        y: Math.max(0, Math.min(950, startElY + dy)),
      });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      onSave(elements);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleResizeStart = (e: React.PointerEvent, el: EditElement) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startW = el.width || 200;
    const startH = el.height || 50;
    const aspect = startW / startH;

    const onMove = (me: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((me.clientX - startX) / rect.width) * 1000;
      const newW = Math.max(60, startW + dx);
      updateElement(el.id, { width: newW, height: newW / aspect });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const activeEl = elements.find(el => el.id === activeId);

  return (
    <div className="fixed inset-0 z-[200] bg-[#f1f5f9] flex flex-col animate-in fade-in duration-200">

      {/* ─── HEADER ─────────────────────────────── */}
      <div className="shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0061ef] rounded-lg flex items-center justify-center">
            <PenTool size={16} className="text-white" />
          </div>
          <div>
            <span className="font-black text-slate-800 text-sm">Sign PDF</span>
            <span className="ml-2 text-xs text-slate-400">Page {pageIndex + 1} of {totalPages}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <X size={16} /> Cancel
          </button>
          <button
            onClick={onFinish}
            className="px-5 py-2 bg-[#0061ef] hover:bg-[#0051cc] text-white rounded-lg text-sm font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Check size={16} /> Finish & Download
          </button>
        </div>
      </div>

      {/* ─── BODY ───────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT SIDEBAR */}
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
          <div className="p-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Add Fields</p>
            <div className="space-y-1.5">
              {FIELDS.map(f => (
                <div key={f.type} className="relative">
                  <button
                    onClick={() => handleFieldClick(f.type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                  >
                    <span className="w-7 h-7 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: f.color }}>
                      {f.icon}
                    </span>
                    {f.label}
                    {(f.type === 'signature' || f.type === 'initials') && savedSignatures.length > 0 && (
                      <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{savedSignatures.length}</span>
                    )}
                  </button>

                  {/* Signature dropdown */}
                  {showSigDropdown && pendingFieldType === f.type && (
                    <div className="absolute left-full top-0 ml-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select signature</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {savedSignatures.map((sig, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSigSelect(sig)}
                            className="p-2 border-2 border-slate-100 rounded-lg hover:border-[#0061ef] cursor-pointer transition-colors flex items-center justify-center bg-slate-50 h-14"
                          >
                            <img src={sig} className="max-h-full object-contain mix-blend-multiply" alt="Saved signature" />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => { setShowSigDropdown(false); setShowNewSigPad(true); }}
                        className="mt-2 w-full py-2 bg-blue-50 text-[#0061ef] font-black text-xs rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        + Create New
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected element properties */}
          {activeEl && (
            <div className="p-4 border-t border-slate-100 mt-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Selected Field</p>
              {activeEl.type === 'text' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={activeEl.text || ''}
                    onChange={e => updateElement(activeEl.id, { text: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#0061ef] transition-colors"
                    placeholder="Enter text..."
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Size:</span>
                    <input
                      type="range" min="8" max="36" value={activeEl.size || 14}
                      onChange={e => updateElement(activeEl.id, { size: +e.target.value })}
                      className="flex-1 accent-[#0061ef]"
                    />
                    <span className="text-xs text-slate-500 font-bold w-6">{activeEl.size || 14}</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => deleteElement(activeEl.id)}
                className="mt-3 w-full py-2 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 border border-red-100 rounded-lg text-xs font-bold transition-colors"
              >
                <Trash2 size={14} /> Remove Field
              </button>
            </div>
          )}
        </aside>

        {/* CANVAS */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto"
          onClick={() => { setActiveId(null); setShowSigDropdown(false); }}
          style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Zoom controls */}
          <div className="flex items-center gap-2 mb-6 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden divide-x divide-slate-200">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
              <ZoomOut size={16} />
            </button>
            <span className="px-4 py-2 text-xs font-bold text-slate-600 min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
              <ZoomIn size={16} />
            </button>
            {totalPages > 1 && (
              <>
                <button onClick={() => onPageChange(-1)} disabled={pageIndex === 0} className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors">← Prev</button>
                <span className="px-3 py-2 text-xs text-slate-400">Page {pageIndex + 1}/{totalPages}</span>
                <button onClick={() => onPageChange(1)} disabled={pageIndex === totalPages - 1} className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors">Next →</button>
              </>
            )}
          </div>

          {/* Page canvas */}
          <div
            style={{
              width: '794px',
              flexShrink: 0,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              marginBottom: `${(zoom - 1) * 1123}px`,
            }}
          >
            <div
              ref={containerRef}
              className="relative bg-white shadow-2xl select-none"
              style={{ aspectRatio: '1 / 1.414', width: '100%' }}
              onClick={e => { e.stopPropagation(); setActiveId(null); setShowSigDropdown(false); }}
            >
              <img src={image} className="absolute inset-0 w-full h-full object-fill pointer-events-none" draggable={false} alt="PDF page" />

              {elements.map(el => {
                const isActive = activeId === el.id;
                const isSig = el.type === 'image';
                const fc = isSig ? '#0061ef' : fieldColor(el.type === 'form-check' ? 'checkbox' : el.type === 'text' ? 'text' : 'text');

                return (
                  <div
                    key={el.id}
                    className={`absolute group transition-all ${isActive ? 'z-50' : 'z-10 hover:z-20'}`}
                    style={{
                      left: `${el.x / 10}%`,
                      top: `${el.y / 10}%`,
                      width: el.width ? `${el.width / 10}%` : 'auto',
                      height: el.height ? `${el.height / 10}%` : 'auto',
                      cursor: 'move',
                      minWidth: 40,
                      minHeight: 20,
                    }}
                    onPointerDown={e => handleDragStart(e, el)}
                    onClick={e => { e.stopPropagation(); setActiveId(el.id); }}
                  >
                    {/* Hover/active border */}
                    <div
                      className={`absolute inset-0 border-2 rounded-sm pointer-events-none transition-all ${
                        isActive ? 'border-[#0061ef]' : 'border-transparent group-hover:border-[#0061ef]/40'
                      }`}
                      style={{ borderColor: isActive ? fc : undefined }}
                    />

                    {/* Field type label */}
                    {isActive && (
                      <div
                        className="absolute -top-6 left-0 text-[10px] font-black text-white px-2 py-0.5 rounded-t-sm uppercase tracking-widest flex items-center gap-1"
                        style={{ backgroundColor: fc }}
                      >
                        {isSig ? '✍ Signature' : el.type === 'text' ? '✏ Text' : el.type === 'form-check' ? '☑ Checkbox' : ''}
                      </div>
                    )}

                    {/* Content */}
                    {el.type === 'image' && el.imageUrl && (
                      <img src={el.imageUrl} className="w-full h-full object-contain pointer-events-none mix-blend-multiply" draggable={false} alt="" />
                    )}
                    {el.type === 'text' && (
                      <span
                        className="block w-full h-full overflow-hidden leading-none"
                        style={{
                          color: el.color || '#1a1a1a',
                          fontSize: `${((el.size || 14) / 794) * 100}%`,
                          fontWeight: el.isBold ? 'bold' : 'normal',
                          fontStyle: el.isItalic ? 'italic' : 'normal',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {el.text}
                      </span>
                    )}
                    {el.type === 'form-check' && (
                      <div
                        className="w-full h-full border-2 border-slate-700 bg-white flex items-center justify-center font-black text-slate-800 cursor-pointer"
                        onClick={ev => { ev.stopPropagation(); updateElement(el.id, { isChecked: !el.isChecked }); }}
                        style={{ fontSize: '70%' }}
                      >
                        {el.isChecked ? '✓' : ''}
                      </div>
                    )}

                    {/* Delete button */}
                    {isActive && (
                      <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); deleteElement(el.id); }}
                        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg z-30 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}

                    {/* Resize handle for images/sigs */}
                    {isActive && (el.type === 'image') && (
                      <div
                        className="absolute -bottom-2 -right-2 w-5 h-5 bg-[#0061ef] border-2 border-white rounded-full cursor-nwse-resize shadow-lg z-30"
                        onPointerDown={e => handleResizeStart(e, el)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* New signature modal */}
      {showNewSigPad && (
        <SignaturePad
          onSave={handleNewSigSaved}
          onCancel={() => { setShowNewSigPad(false); setPendingFieldType(null); }}
        />
      )}
    </div>
  );
};
