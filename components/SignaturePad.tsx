import * as React from 'react';
import { Save, X, Eraser, PenTool, Type, Upload as UploadIcon, Check } from 'lucide-react';

interface SignaturePadProps {
    onSave: (signedImageBase64: string) => void;
    onCancel: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel }) => {
    const [tab, setTab] = React.useState<'DRAW' | 'TYPE' | 'UPLOAD'>('DRAW');
    
    // Draw State
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [color, setColor] = React.useState('#1e3a8a');
    const [lineWidth, setLineWidth] = React.useState(3);

    // Type State
    const [typedName, setTypedName] = React.useState('John Doe');
    const [selectedFont, setSelectedFont] = React.useState<string>('Brush Script MT, cursive');
    const fonts = [
        'Brush Script MT, cursive',
        'Bradley Hand, cursive',
        'Snell Roundhand, cursive',
        'Georgia, serif',
        'Courier New, monospace'
    ];

    // Upload State
    const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (tab === 'DRAW') {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const w = 600;
            const h = 300;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.clearRect(0, 0, w, h);
            }
        }
    }, [tab]);

    // --- DRAW LOGIC ---
    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const pos = getPos(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault(); 
        const pos = getPos(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => setIsDrawing(false);

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const cropCanvasToImage = (sourceCanvas: HTMLCanvasElement | null): string | null => {
        if (!sourceCanvas) return null;
        const ctx = sourceCanvas.getContext('2d');
        if (!ctx) return null;

        const w = sourceCanvas.width;
        const h = sourceCanvas.height;
        const pixels = ctx.getImageData(0, 0, w, h);
        
        let minX = w, minY = h, maxX = 0, maxY = 0;
        let p = 0;
        
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const alpha = pixels.data[p + 3];
                if (alpha > 0) { // If not completely transparent
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
                p += 4;
            }
        }
        
        if (minX > maxX || minY > maxY) return null; // empty
        
        minX = Math.max(0, minX - 10);
        minY = Math.max(0, minY - 10);
        maxX = Math.min(w, maxX + 10);
        maxY = Math.min(h, maxY + 10);
        
        const cropW = maxX - minX;
        const cropH = maxY - minY;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = cropW;
        tempCanvas.height = cropH;
        const tCtx = tempCanvas.getContext('2d');
        if (tCtx) {
            tCtx.putImageData(ctx.getImageData(minX, minY, cropW, cropH), 0, 0);
            return tempCanvas.toDataURL('image/png');
        }
        return sourceCanvas.toDataURL('image/png');
    };

    // --- UPLOAD LOGIC ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) setUploadedImage(ev.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    // --- SAVE ROUTER ---
    const handleSave = () => {
        if (tab === 'DRAW') {
            const base64 = cropCanvasToImage(canvasRef.current);
            if (base64) onSave(base64);
            else alert("Please draw your signature first.");
        } else if (tab === 'TYPE') {
            // Render text to an invisible canvas, then crop & save
            if (!typedName.trim()) {
                alert("Please type a name.");
                return;
            }
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 800; // Large enough buffer
            tempCanvas.height = 300;
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                ctx.font = `60px ${selectedFont}`;
                ctx.fillStyle = color;
                ctx.textBaseline = 'middle';
                ctx.fillText(typedName, 20, 150);
                const finalImg = cropCanvasToImage(tempCanvas);
                if (finalImg) onSave(finalImg);
            }
        } else if (tab === 'UPLOAD') {
            if (uploadedImage) onSave(uploadedImage); // we can choose to process to transparent but png handles it
            else alert("Please upload an image first.");
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl flex flex-col w-full max-w-2xl overflow-hidden border border-slate-200">
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                    <h3 className="font-black text-xl flex items-center gap-2 text-slate-800">
                        Create Signature
                    </h3>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex border-b text-sm font-bold">
                    <button 
                        onClick={() => setTab('DRAW')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-4 border-b-2 transition-all ${tab === 'DRAW' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                        <PenTool size={16} /> Draw
                    </button>
                    <button 
                        onClick={() => setTab('TYPE')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-4 border-b-2 transition-all ${tab === 'TYPE' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Type size={16} /> Type
                    </button>
                    <button 
                        onClick={() => setTab('UPLOAD')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-4 border-b-2 transition-all ${tab === 'UPLOAD' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                    >
                        <UploadIcon size={16} /> Upload
                    </button>
                </div>

                <div className="p-6 bg-slate-50 flex items-center justify-center min-h-[300px]">
                    {tab === 'DRAW' && (
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="bg-white border text-blue border-slate-200 cursor-crosshair w-full aspect-[2/1] rounded-2xl shadow-inner touch-none"
                        />
                    )}
                    
                    {tab === 'TYPE' && (
                        <div className="w-full flex flex-col gap-6">
                            <input 
                                type="text" 
                                value={typedName} 
                                onChange={(e) => setTypedName(e.target.value)} 
                                placeholder="Type your name here"
                                className="w-full p-4 border-2 border-slate-200 rounded-2xl text-xl font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            />
                            
                            <div className="bg-slate-200 h-px w-full" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider -mb-2">Select Style</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                                {fonts.map(f => (
                                    <div 
                                        key={f} 
                                        onClick={() => setSelectedFont(f)}
                                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedFont === f ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-transparent bg-white hover:border-slate-300 shadow-sm'}`}
                                    >
                                        <div style={{ fontFamily: f, color }} className="text-2xl truncate">
                                            {typedName || 'Your Name'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'UPLOAD' && (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            {uploadedImage ? (
                                <div className="space-y-4 w-full flex flex-col items-center">
                                    <div className="bg-white p-4 rounded-2xl border aspect-[2/1] w-full max-w-sm flex items-center justify-center shadow-inner">
                                        <img src={uploadedImage} className="max-w-full max-h-full object-contain" alt="Uploaded sig" />
                                    </div>
                                    <button onClick={() => setUploadedImage(null)} className="text-sm font-bold text-red-500 hover:text-red-600">Remove Image</button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full aspect-[2/1] border-2 border-slate-300 border-dashed rounded-3xl cursor-pointer hover:bg-slate-100 transition-colors bg-white">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
                                        <p className="mb-2 text-sm text-slate-500 font-medium"><span className="font-bold text-indigo-600">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-slate-400">PNG, JPG or SVG (Max 5MB)</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileUpload} />
                                </label>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-white flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex w-full md:w-auto items-center gap-4">
                        {(tab === 'DRAW' || tab === 'TYPE') && (
                            <div className="flex items-center gap-2 bg-slate-50 p-2 border rounded-xl flex-1 md:flex-none">
                                <label className="text-sm font-bold text-slate-500 ml-2">Color:</label>
                                <div className="flex gap-1 pr-1">
                                    {['#000000', '#1e3a8a', '#d97706', '#dc2626'].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-indigo-300 scale-110 shadow-md' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {tab === 'DRAW' && (
                            <button onClick={handleClear} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-2">
                                <Eraser size={16} /> Clear
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors flex-1 md:flex-none">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="flex-2 md:flex-none px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2 justify-center">
                            <Check size={18} /> Adopt & Sign
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
