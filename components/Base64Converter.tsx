import React, { useState, useRef } from 'react';
import { Upload, ArrowRightLeft, Copy, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

export const Base64Converter: React.FC = () => {
    const [mode, setMode] = useState<'ENCODE' | 'DECODE'>('ENCODE');
    const [inputType, setInputType] = useState<'TEXT' | 'IMAGE'>('TEXT');
    const [inputText, setInputText] = useState('');
    const [output, setOutput] = useState('');
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setInputText(ev.target.result as string);
                    if (mode === 'ENCODE') setOutput(ev.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const process = () => {
        try {
            if (mode === 'ENCODE') {
                // For text, we encode. For images, we already have DataURL from FileReader
                if (inputType === 'TEXT') {
                    setOutput(btoa(inputText));
                } else {
                    // Image already base64 from FileReader
                    setOutput(inputText);
                }
            } else {
                // Decode
                if (inputType === 'TEXT') {
                    setOutput(atob(inputText));
                } else {
                    // For image decode, we just show the base64 string as an image source
                    // No explicit "decode" needed for display, but we could strip metadata
                    setOutput(inputText);
                }
            }
        } catch (e) {
            setOutput("Error: Invalid Input");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
        // Toast could go here
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                    <ArrowRightLeft className="w-8 h-8 text-indigo-600" />
                    Base64 Converter
                </h2>
                <p className="text-slate-500">Encode and decode text or images to Base64 instantly.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setMode('ENCODE')}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${mode === 'ENCODE' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                        >
                            Encode
                        </button>
                        <button
                            onClick={() => setMode('DECODE')}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${mode === 'DECODE' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                        >
                            Decode
                        </button>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => { setInputType('TEXT'); setInputText(''); setOutput(''); }}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${inputType === 'TEXT' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                        >
                            <span className="flex items-center gap-2"><FileText size={16} /> Text</span>
                        </button>
                        <button
                            onClick={() => { setInputType('IMAGE'); setInputText(''); setOutput(''); }}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${inputType === 'IMAGE' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                        >
                            <span className="flex items-center gap-2"><ImageIcon size={16} /> Image</span>
                        </button>
                    </div>
                </div>

                {/* Input Area */}
                <div className="space-y-4">
                    <label className="font-bold text-slate-700 block">Input {inputType === 'IMAGE' ? 'Image' : 'Text'}</label>

                    {inputType === 'TEXT' ? (
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={mode === 'ENCODE' ? "Enter text to encode..." : "Paste Base64 string to decode..."}
                            className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                        />
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all text-slate-400 hover:text-indigo-600"
                        >
                            {fileName ? (
                                <div className="text-center">
                                    <ImageIcon size={32} className="mx-auto mb-2" />
                                    <p className="font-bold">{fileName}</p>
                                </div>
                            ) : (
                                <>
                                    <Upload size={32} className="mb-2" />
                                    <p className="font-bold">Click to Upload Image</p>
                                </>
                            )}
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                </div>

                <Button onClick={process} className="w-full py-4 text-lg font-bold uppercase tracking-wider">
                    {mode} {inputType}
                </Button>

                {/* Output Area */}
                {output && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <label className="font-bold text-slate-700">Result</label>
                            <button onClick={copyToClipboard} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-800">
                                <Copy size={16} /> Copy
                            </button>
                        </div>

                        {inputType === 'IMAGE' && mode === 'DECODE' ? (
                            <div className="bg-slate-900 rounded-xl p-4 flex justify-center">
                                <img src={output} alt="Decoded" className="max-h-96 object-contain" />
                            </div>
                        ) : (
                            <textarea
                                readOnly
                                value={output}
                                className="w-full h-40 bg-slate-900 text-green-400 border border-slate-800 rounded-xl p-4 outline-none font-mono text-xs"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
