import React, { useState } from 'react';
import { Wand2, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from './Button.tsx';
import { generateImage } from '../services/geminiService.ts';
import { AspectRatio } from '../types.ts';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [highQuality, setHighQuality] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateImage(prompt, aspectRatio, highQuality);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <Wand2 className="w-8 h-8 text-purple-600" />
          AI Image Generator
        </h1>
        <p className="text-slate-500">Transform your words into stunning visuals using Gemini 2.5 Flash & 3 Pro.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city made of crystal, sunset lighting..."
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            >
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="3:4">3:4 (Tall)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${highQuality ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-sm font-medium text-slate-700">High Quality (Pro)</span>
            </div>
            <button
              onClick={() => setHighQuality(!highQuality)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${highQuality ? 'bg-purple-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highQuality ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={!prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200"
            icon={<Wand2 className="w-4 h-4" />}
          >
            Generate Image
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex items-center justify-center min-h-[400px] relative overflow-hidden group shadow-sm">
          {generatedImage ? (
            <>
              <img
                src={generatedImage}
                alt="Generated"
                className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <a
                  href={generatedImage}
                  download={(function () {
                    let ext = '.png';
                    if (generatedImage.startsWith('data:image/jpeg')) ext = '.jpg';
                    else if (generatedImage.startsWith('data:image/webp')) ext = '.webp';
                    return `lumina-gen-${Date.now()}${ext}`;
                  })()}
                  className="p-3 bg-white rounded-full text-slate-900 hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <Download className="w-6 h-6" />
                </a>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 p-8">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                  <p className="animate-pulse text-slate-600">Dreaming up your image...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <ImageIcon className="w-16 h-16 opacity-20" />
                  <p>Enter a prompt and click Generate to see magic happen</p>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center shadow-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};