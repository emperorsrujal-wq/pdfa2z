import * as React from 'react';
import { Save, X, Eraser, PenTool, Type, Upload as UploadIcon, Check, RotateCcw, Smartphone } from 'lucide-react';
import { Button } from './Button';

interface SignaturePadProps {
    onSave: (signedImageBase64: string) => void;
    onCancel: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel }) => {
    const [tab, setTab] = React.useState<'DRAW' | 'TYPE' | 'UPLOAD' | 'MOBILE'>('DRAW');
    
    // Draw State
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [color, setColor] = React.useState('#000000');
    const [points, setPoints] = React.useState<{x: number, y: number}[]>([]);

    // Type State
    const [typedName, setTypedName] = React.useState('');
    const [selectedFont, setSelectedFont] = React.useState<string>('Brush Script MT, cursive');
    const fonts = [
        'Brush Script MT, cursive',
        'Bradley Hand, cursive',
        'Snell Roundhand, cursive',
        'Dancing Script, cursive',
        'Great Vibes, cursive'
    ];

    // Upload State
    const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (tab === 'DRAW') {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [tab]);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const pos = getPos(e);
        setPoints([pos]);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault(); 
        const pos = getPos(e);
        const newPoints = [...points, pos];
        setPoints(newPoints);
        
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && newPoints.length > 2) {
            // Bezier curve smoothing
            const xc = (newPoints[newPoints.length - 2].x + newPoints[newPoints.length - 1].x) / 2;
            const yc = (newPoints[newPoints.length - 2].y + newPoints[newPoints.length - 1].y) / 2;
            ctx.quadraticCurveTo(newPoints[newPoints.length - 2].x, newPoints[newPoints.length - 2].y, xc, yc);
            ctx.stroke();
        }
    };

    const stopDrawing = () => setIsDrawing(false);

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setPoints([]);
        }
    };

    const handleSave = () => {
        if (tab === 'DRAW') {
            const canvas = canvasRef.current;
            if (!canvas || points.length === 0) return;
            onSave(canvas.toDataURL('image/png'));
        } else if (tab === 'TYPE') {
            if (!typedName) return;
            // Simulated rendering for now
            onSave('data:image/png;base64,...'); 
        } else if (tab === 'UPLOAD' && uploadedImage) {
            onSave(uploadedImage);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Create Signature</h3>
                        <p className="text-sm text-slate-400 font-medium">Choose your preferred method</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex bg-slate-50/50 p-2 mx-6 mt-6 rounded-2xl gap-1">
                    {(['DRAW', 'TYPE', 'UPLOAD', 'MOBILE'] as const).map((t) => (
                        <button 
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {tab === 'DRAW' && (
                        <div className="space-y-6">
                            <div className="relative group">
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="w-full h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl cursor-crosshair touch-none transition-all group-hover:border-indigo-300 group-hover:bg-indigo-50/30"
                                />
                                {points.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                        <p className="text-2xl font-black text-slate-400 uppercase tracking-widest">Sign Here</p>
                                    </div>
                                )}
                                <button 
                                    onClick={handleClear}
                                    className="absolute bottom-4 right-4 p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                                    title="Clear"
                                >
                                    <RotateCcw size={20} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Ink Color</span>
                                <div className="flex gap-2">
                                    {['#000000', '#1e3a8a', '#c2410c'].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'TYPE' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                            <input 
                                type="text" 
                                value={typedName} 
                                onChange={(e) => setTypedName(e.target.value)} 
                                placeholder="Type your name..."
                                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-2xl font-bold placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {fonts.map(f => (
                                    <button 
                                        key={f}
                                        onClick={() => setSelectedFont(f)}
                                        className={`p-6 border-2 rounded-3xl text-left transition-all ${selectedFont === f ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <p style={{ fontFamily: f }} className="text-3xl text-slate-900 truncate">
                                            {typedName || 'Your Name'}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">{f.split(' ')[0]}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'MOBILE' && (
                        <div className="py-12 flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300 text-center">
                            <div className="w-48 h-48 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-900/20 relative ring-8 ring-slate-50">
                                <Smartphone size={64} className="text-white opacity-20" />
                                <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-[1.5rem]" />
                                <div className="absolute -bottom-3 bg-indigo-600 px-4 py-1.5 rounded-full shadow-lg">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Scan Me</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xl font-black text-slate-900">Sign with Mobile</h4>
                                <p className="text-sm text-slate-400 max-w-xs font-medium decoration-indigo-400">Scan this code to open a secure signature pad on your phone. Works with fingers and styluses.</p>
                            </div>
                        </div>
                    )}

                    {tab === 'UPLOAD' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-300">
                             <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-200 border-dashed rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all bg-slate-50/50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 mb-4">
                                        <UploadIcon size={32} />
                                    </div>
                                    <p className="text-sm text-slate-600 font-bold">Click or drag your signature</p>
                                    <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">PNG or SVG only</p>
                                </div>
                                <input type="file" className="hidden" accept="image/png" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (re) => setUploadedImage(re.target?.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                            </label>
                            {uploadedImage && (
                                <div className="mt-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                                    <img src={uploadedImage} className="h-12 object-contain" alt="Sig" />
                                    <button onClick={() => setUploadedImage(null)} className="p-2 text-slate-400 hover:text-red-500"><X size={20} /></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                    <Button variant="secondary" className="flex-1 py-4 text-slate-500 hover:text-slate-900" onClick={onCancel}>Cancel</Button>
                    <Button variant="primary" className="flex-[2] py-4 shadow-xl shadow-indigo-100" onClick={handleSave}>
                        <Check size={20} className="mr-2" /> Adopt & Sign
                    </Button>
                </div>
            </div>
        </div>
    );
};
