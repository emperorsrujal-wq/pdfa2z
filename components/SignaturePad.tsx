import * as React from 'react';
import { 
  X, 
  Trash2, 
  Type, 
  PenTool, 
  Image as ImageIcon, 
  Camera, 
  Check, 
  RotateCcw,
  MousePointer2
} from 'lucide-react';

interface SignaturePadProps {
  onSave: (signedImageBase64: string, shouldSave: boolean) => void;
  onCancel: () => void;
  initialTab?: 'DRAW' | 'TYPE' | 'UPLOAD' | 'CAMERA';
}

const SEJDA_INK_COLORS = [
  '#4d8bf4', // Light Blue
  '#3b5998', // Medium Blue
  '#003366', // Dark Blue
  '#000080', // Navy
  '#4a4a4a', // Dark Grey
  '#000000', // Black
];

const SIGNATURE_FONTS = [
  { name: 'Brush Script', css: '"Brush Script MT", "Dancing Script", cursive' },
  { name: 'Italic Serif', css: 'Georgia, serif' },
  { name: 'Handwritten', css: '"Comic Sans MS", cursive' },
  { name: 'Elegant', css: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
];

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, initialTab = 'DRAW' }) => {
  const [tab, setTab] = React.useState<'DRAW' | 'TYPE' | 'UPLOAD' | 'CAMERA'>(initialTab);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [color, setColor] = React.useState('#000000');
  const [hasStrokes, setHasStrokes] = React.useState(false);
  const [shouldSaveSignature, setShouldSaveSignature] = React.useState(true);
  const lastPos = React.useRef<{ x: number; y: number } | null>(null);

  const [typedName, setTypedName] = React.useState('');
  const [selectedFont, setSelectedFont] = React.useState(SIGNATURE_FONTS[0]);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);

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
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
    }
  }, [color]);

  React.useEffect(() => {
    if (tab === 'DRAW') {
      const t = setTimeout(initCanvas, 100);
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

  const clearCanvas = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasStrokes(false);
    }
  };

  const handleSave = () => {
    let dataUrl = '';
    if (tab === 'DRAW' && canvasRef.current && hasStrokes) {
      dataUrl = canvasRef.current.toDataURL('image/png');
    } else if (tab === 'TYPE' && typedName.trim()) {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        ctx.font = `italic 72px ${selectedFont.css}`;
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, 20, 75);
        dataUrl = canvas.toDataURL('image/png');
      }
    } else if (tab === 'UPLOAD' && uploadedImage) {
      dataUrl = uploadedImage;
    }

    if (dataUrl) onSave(dataUrl, shouldSaveSignature);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-500 font-medium">Create signature</h3>
          <button onClick={onCancel} className="text-slate-300 hover:text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex bg-white rounded-md border border-slate-100 p-1">
            {[
              { id: 'TYPE', label: 'Type', icon: <Type size={16} /> },
              { id: 'DRAW', label: 'Draw', icon: <PenTool size={16} /> },
              { id: 'UPLOAD', label: 'Upload Image', icon: <ImageIcon size={16} /> },
              { id: 'CAMERA', label: 'Camera', icon: <Camera size={16} /> },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 px-6 py-2 rounded-sm text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-white text-[#11b67a] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className={tab === t.id ? 'text-[#11b67a]' : 'text-slate-400'}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-slate-600 text-sm cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={shouldSaveSignature} 
              onChange={e => setShouldSaveSignature(e.target.checked)}
              className="w-4 h-4 rounded accent-[#11b67a]" 
            />
            Save signature
          </label>
        </div>

        {/* Content Area */}
        <div className="p-8 bg-white min-h-[400px] flex flex-col items-center">
          
          {tab === 'DRAW' && (
            <div className="w-full flex flex-col items-center">
              {/* Color Palette */}
              <div className="flex gap-3 mb-6">
                {SEJDA_INK_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-125' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <p className="text-slate-400 text-sm mb-6">Sign your name using your mouse or touchpad.</p>

              <div className="relative w-full border border-slate-100 rounded-sm bg-white overflow-hidden shadow-inner group">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-64 cursor-crosshair touch-none"
                />
                
                {/* Clear Button (Green X) */}
                <button 
                  onClick={clearCanvas}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-[#11b67a] text-[#11b67a] flex items-center justify-center hover:bg-[#11b67a] hover:text-white transition-all shadow-sm"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          )}

          {tab === 'TYPE' && (
            <div className="w-full space-y-6">
              <input
                type="text"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                placeholder="Type your name"
                className="w-full px-4 py-4 text-2xl border-b-2 border-slate-100 focus:border-[#11b67a] outline-none text-slate-800 font-medium placeholder:text-slate-200 text-center"
              />
              <div className="grid grid-cols-2 gap-4">
                {SIGNATURE_FONTS.map(f => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFont(f)}
                    className={`p-6 border rounded-sm text-center transition-all ${selectedFont.name === f.name ? 'border-[#11b67a] bg-emerald-50/30' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <p style={{ fontFamily: f.css, color }} className="text-4xl text-slate-800 truncate leading-relaxed">
                      {typedName || 'Jane Doe'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'UPLOAD' && (
            <div className="w-full flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-sm p-12 bg-slate-50/30">
               <ImageIcon size={48} className="text-slate-200 mb-4" />
               <p className="text-slate-500 font-medium">Click to upload image</p>
               <p className="text-slate-400 text-xs mt-1">PNG, JPG or SVG</p>
               <input type="file" className="hidden" />
            </div>
          )}

          {tab === 'CAMERA' && (
            <div className="w-full flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-sm p-12 bg-slate-50/30">
               <Camera size={48} className="text-slate-200 mb-4" />
               <p className="text-slate-500 font-medium">Use camera to capture signature</p>
               <button className="mt-4 px-6 py-2 bg-[#11b67a] text-white rounded-sm text-sm font-bold">Start Camera</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 flex justify-end gap-3 bg-white border-t border-slate-50">
          <button 
             onClick={onCancel}
             className="px-6 py-2 text-slate-500 hover:text-slate-700 font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={(!hasStrokes && tab === 'DRAW') || (!typedName.trim() && tab === 'TYPE')}
            className={`px-12 py-3 bg-[#11b67a] text-white rounded-sm font-bold shadow-lg transition-all ${
              ((hasStrokes && tab === 'DRAW') || (typedName.trim() && tab === 'TYPE')) ? 'hover:bg-[#0da26a] active:scale-95' : 'opacity-50 grayscale cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
