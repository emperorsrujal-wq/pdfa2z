import * as React from 'react';
import { Save, X, Eraser, PenTool, Type, Upload as UploadIcon, Check, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signedImageBase64: string) => void;
  onCancel: () => void;
  initialTab?: 'DRAW' | 'TYPE' | 'UPLOAD';
}

const INK_COLORS = [
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Blue', value: '#1e40af' },
  { label: 'Dark Blue', value: '#1e3a8a' },
  { label: 'Red', value: '#b91c1c' },
];

const SIGNATURE_FONTS = [
  { name: 'Brush Script', css: '"Brush Script MT", "Dancing Script", cursive' },
  { name: 'Italic Serif', css: 'Georgia, serif' },
  { name: 'Handwritten', css: '"Comic Sans MS", cursive' },
  { name: 'Elegant', css: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
];

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, initialTab = 'DRAW' }) => {
  const [tab, setTab] = React.useState<'DRAW' | 'TYPE' | 'UPLOAD'>(initialTab);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const typeCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [color, setColor] = React.useState('#1a1a1a');
  const [hasStrokes, setHasStrokes] = React.useState(false);
  const lastPos = React.useRef<{ x: number; y: number } | null>(null);

  const [typedName, setTypedName] = React.useState('');
  const [selectedFont, setSelectedFont] = React.useState(SIGNATURE_FONTS[0]);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);

  // Initialize draw canvas
  const initCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = color;
    }
    setHasStrokes(false);
  }, [color]);

  React.useEffect(() => {
    if (tab === 'DRAW') {
      // Small delay to let DOM settle
      const t = setTimeout(initCanvas, 50);
      return () => clearTimeout(t);
    }
  }, [tab, initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
    lastPos.current = pos;
    setIsDrawing(true);
    setHasStrokes(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    if (!pos || !lastPos.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = color;
      const xc = (lastPos.current.x + pos.x) / 2;
      const yc = (lastPos.current.y + pos.y) / 2;
      ctx.quadraticCurveTo(lastPos.current.x, lastPos.current.y, xc, yc);
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasStrokes(false);
    }
  };

  // Render typed name into canvas for saving
  const renderTypeSignature = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = `italic 72px ${selectedFont.css}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Signature', 20, 80);
    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    if (tab === 'DRAW') {
      const canvas = canvasRef.current;
      if (!canvas || !hasStrokes) return;
      onSave(canvas.toDataURL('image/png'));
    } else if (tab === 'TYPE') {
      if (!typedName.trim()) return;
      onSave(renderTypeSignature());
    } else if (tab === 'UPLOAD' && uploadedImage) {
      onSave(uploadedImage);
    }
  };

  const canSave = (tab === 'DRAW' && hasStrokes) || (tab === 'TYPE' && typedName.trim().length > 0) || (tab === 'UPLOAD' && !!uploadedImage);

  return (
    <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">Create Your Signature</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Draw, type, or upload your signature</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-3">
          {(['DRAW', 'TYPE', 'UPLOAD'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${
                tab === t
                  ? 'border-[#0061ef] text-[#0061ef]'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
              }`}
            >
              {t === 'DRAW' ? '✏️ Draw' : t === 'TYPE' ? 'Aa Type' : '⬆ Upload'}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* DRAW TAB */}
          {tab === 'DRAW' && (
            <div className="space-y-4">
              <div className="relative rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group hover:border-[#0061ef]/40 transition-colors">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-52 cursor-crosshair touch-none block"
                  style={{ touchAction: 'none' }}
                />
                {!hasStrokes && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-slate-300 text-3xl font-bold italic mb-2">Sign here</div>
                    <div className="absolute bottom-4 left-4 right-4 border-t-2 border-slate-200" />
                  </div>
                )}
                <button
                  onClick={clearCanvas}
                  className="absolute top-3 right-3 p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-red-500 hover:border-red-100 transition-all shadow-sm text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw size={13} /> Clear
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ink Color:</span>
                <div className="flex gap-2">
                  {INK_COLORS.map(c => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => setColor(c.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${color === c.value ? 'border-[#0061ef] scale-110 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TYPE TAB */}
          {tab === 'TYPE' && (
            <div className="space-y-4">
              <input
                type="text"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                placeholder="Type your full name..."
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-300 focus:border-[#0061ef] focus:bg-white outline-none transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                {SIGNATURE_FONTS.map(f => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFont(f)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${selectedFont.name === f.name ? 'border-[#0061ef] bg-blue-50 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}
                  >
                    <p style={{ fontFamily: f.css, color }} className="text-3xl truncate leading-none mb-2">
                      {typedName || 'Jane Doe'}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {tab === 'UPLOAD' && (
            <div>
              <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 hover:border-[#0061ef]/40 transition-all bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                    <UploadIcon size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-600">Click or drag to upload</p>
                    <p className="text-xs text-slate-400 mt-1">PNG with transparent background recommended</p>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = re => setUploadedImage(re.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {uploadedImage && (
                <div className="mt-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-between">
                  <img src={uploadedImage} className="h-14 object-contain" alt="Signature preview" />
                  <button onClick={() => setUploadedImage(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50/50">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex-[2] py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              canSave
                ? 'bg-[#0061ef] hover:bg-[#0051cc] text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check size={18} />
            Adopt & Sign
          </button>
        </div>
      </div>
    </div>
  );
};
