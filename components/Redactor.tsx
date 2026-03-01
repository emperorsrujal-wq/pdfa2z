import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Trash2, MousePointer2 } from 'lucide-react';
import { RedactionArea } from '../utils/pdfHelpers';

interface RedactorProps {
    image: string;
    pageIndex: number;
    existingAreas: RedactionArea[];
    onSave: (areas: RedactionArea[]) => void;
    onCancel: () => void;
}

export const Redactor: React.FC<RedactorProps> = ({ image, pageIndex, existingAreas, onSave, onCancel }) => {
    const [areas, setAreas] = useState<RedactionArea[]>(existingAreas);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentArea, setCurrentArea] = useState<RedactionArea | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // Calculate relative to image container
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Since images are scaled/contained, we need to map to "natural" coordinates if we want accuracy.
        // For now, we'll store relative percentages or assume 1:1 for the preview.
        // BUT pdf-lib needs actual PDF points. 
        // We'll normalize to 0-1000 and then map to PDF size in parent.
        return {
            x: (x / rect.width) * 1000,
            y: (y / rect.height) * 1000
        };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getPos(e);
        setStartPos(pos);
        setIsDrawing(true);
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const pos = getPos(e);
        const width = Math.abs(pos.x - startPos.x);
        const height = Math.abs(pos.y - startPos.y);
        const x = Math.min(pos.x, startPos.x);
        const y = Math.min(pos.y, startPos.y);

        setCurrentArea({ pageIndex, x, y, width, height });
    };

    const handleEnd = () => {
        if (isDrawing && currentArea && currentArea.width > 5 && currentArea.height > 5) {
            setAreas([...areas, currentArea]);
        }
        setIsDrawing(false);
        setCurrentArea(null);
    };

    const removeArea = (idx: number) => {
        setAreas(areas.filter((_, i) => i !== idx));
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col p-4 md:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6 text-white max-w-5xl mx-auto w-full">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <MousePointer2 className="text-indigo-400" />
                        Redact Page {pageIndex + 1}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Click and drag to select areas to black out</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all flex items-center gap-2">
                        <X size={18} /> Cancel
                    </button>
                    <button onClick={() => onSave(areas)} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                        <Check size={18} /> Apply Redactions
                    </button>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-0">
                <div
                    ref={containerRef}
                    className="relative bg-white shadow-2xl rounded-sm cursor-crosshair select-none max-h-full aspect-[1/1.414]"
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                >
                    <img src={image} className="h-full object-contain pointer-events-none" alt="Redaction Preview" />

                    {/* Drawn Areas */}
                    {areas.filter(a => a.pageIndex === pageIndex).map((area, idx) => (
                        <div
                            key={idx}
                            className="absolute bg-black group"
                            style={{
                                left: `${area.x / 10}%`,
                                top: `${area.y / 10}%`,
                                width: `${area.width / 10}%`,
                                height: `${area.height / 10}%`,
                            }}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); removeArea(idx); }}
                                className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}

                    {/* Current Drawing */}
                    {currentArea && (
                        <div
                            className="absolute bg-black/50 border border-indigo-500 border-dashed"
                            style={{
                                left: `${currentArea.x / 10}%`,
                                top: `${currentArea.y / 10}%`,
                                width: `${currentArea.width / 10}%`,
                                height: `${currentArea.height / 10}%`,
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="mt-6 text-center text-slate-500 text-xs font-medium uppercase tracking-widest">
                {areas.length} area(s) marked for redaction
            </div>
        </div>
    );
};
