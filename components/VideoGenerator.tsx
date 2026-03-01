import * as React from 'react';
import {  useState, useEffect  } from 'react';
import { Film, Download, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './Button.tsx';
import { generateVideo } from '../services/geminiService.ts';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if key is available in env or config
    // We can't easily import getApiKey here without changing imports, but we can check if the key is effectively "set" by the app logic
    // actually, let's just assume true if it's integrated, or let the service fail gracefully.
    // Ideally we should import getApiKey.
    const hasEnv = import.meta.env.VITE_GEMINI_API_KEY || (window as any).INTEGRATED_KEY_SET;
    // Since we added config/apiKey.ts, we can't easily check its value here without importing it.
    // Let's rely on the service to throw an error if missing.
    // We will set hasApiKey to true so users can TRY to use it.
    setHasApiKey(true);
  }, []);

  // handleSaveKey removed

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      const url = await generateVideo(prompt, aspectRatio);
      setGeneratedVideoUrl(url);
    } catch (err: any) {
      // If we get an auth error, we might want to prompt user again, but hardcoded key might be wrong too.
      // For now just show error.
      if (err.message && err.message.includes("key")) {
        setError(err.message + " Please check your API key.");
        setHasApiKey(false);
      } else {
        setError(err.message || "Failed to generate video");
      }
    } finally {
      setIsGenerating(false);
    }
  };


  // Error screen removed. If key is missing, handleGenerate will catch the error and show it in the UI toast/alert area.
  if (!hasApiKey && false) { // effectively disabled
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <Film className="w-8 h-8 text-rose-600" />
          Veo Video Generator
        </h1>
        <p className="text-slate-500">Create stunning 1080p videos from text using Google's Veo model.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic drone shot of a futuristic neon city at night, rain on the streets..."
              className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`p-3 rounded-xl border font-bold text-sm transition-all ${aspectRatio === '16:9' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                16:9 Landscape
              </button>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`p-3 rounded-xl border font-bold text-sm transition-all ${aspectRatio === '9:16' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                9:16 Portrait
              </button>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={!prompt.trim()}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-200"
            icon={<Film className="w-4 h-4" />}
          >
            {isGenerating ? 'Generating Video...' : 'Generate Video'}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            Generation typically takes 1-2 minutes.
          </p>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex items-center justify-center min-h-[400px] relative overflow-hidden group shadow-sm bg-slate-950">
          {generatedVideoUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <video
                controls
                autoPlay
                loop
                className="max-w-full max-h-[500px] rounded-lg shadow-2xl"
                src={generatedVideoUrl}
              />
              <a
                href={generatedVideoUrl}
                download={`veo-gen-${Date.now()}.mp4`}
                className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors shadow-lg"
                title="Download Video"
              >
                <Download className="w-6 h-6" />
              </a>
            </div>
          ) : (
            <div className="text-center text-slate-500 p-8">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-rose-500 border-r-rose-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-rose-400 font-bold text-lg animate-pulse">Dreaming up your scene...</p>
                    <p className="text-sm text-slate-600">This usually takes about 60 seconds.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 opacity-40">
                  <Film className="w-20 h-20" />
                  <p>Enter a prompt to start creating</p>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-900/90 border border-red-700 rounded-xl text-white text-sm text-center shadow-lg flex items-center justify-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};