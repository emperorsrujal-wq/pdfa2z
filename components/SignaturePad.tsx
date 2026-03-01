import * as React from 'react';
import {  useRef, useEffect, useState  } from 'react';
import { Save, X, Undo, Eraser, PenTool } from 'lucide-react';

interface SignaturePadProps {
    image: string;
    onSave: (signedImage: string) => void;
    onCancel: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ image, onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

    // Initialize canvas with image
    useEffect(() => {
        const img = new Image();
        img.src = image;
        img.onload = () => {
            // Fit to screen but keep aspect ratio
            const maxWidth = window.innerWidth * 0.9;
            const maxHeight = window.innerHeight * 0.7;

            let w = img.width;
            let h = img.height;

            // Scale down if needed
            const ratio = Math.min(maxWidth / w, maxHeight / h);

            // We process at somewhat high res for quality, but display scaled
            // Actually, for simplicity, let's just use the natural size in canvas 
            // but scale via CSS if needed. Or scaling data.

            // Better approach: Set canvas to full resolution, scale via style
            const canvas = canvasRef.current;
            if (!canvas) return;

            canvas.width = w;
            canvas.height = h;
            setCanvasSize({ w, h });

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, w, h);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        };
    }, [image]);

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
        e.preventDefault(); // Stop scrolling on touch
        const pos = getPos(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleSave = () => {
        if (canvasRef.current) {
            onSave(canvasRef.current.toDataURL('image/png'));
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden w-full max-w-5xl">
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-lg flex items-center gap-2"><PenTool size={20} /> Sign Document</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center relative touch-none">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="bg-white shadow-lg cursor-crosshair max-w-full"
                        style={{ maxHeight: '60vh' }}
                    />
                </div>

                <div className="p-4 border-t bg-white flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-bold">Color:</label>
                            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none" />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-bold">Size:</label>
                            <input type="range" min="1" max="10" value={lineWidth} onChange={e => setLineWidth(parseInt(e.target.value))} className="w-24" />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onCancel} className="px-6 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg flex items-center gap-2">
                            <Save size={18} /> Save Signature
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
