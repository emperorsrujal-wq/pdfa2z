import React, { useState } from 'react';
import { PenTool, Check, Copy, Wand2, RefreshCw, FileText, AlignLeft, Mail } from 'lucide-react';
import { Button } from './Button.tsx';
import { generateText } from '../services/geminiService.ts';

type WriterMode = 'GRAMMAR' | 'SUMMARIZE' | 'PARAPHRASE' | 'EMAIL';

export const AiWriter: React.FC = () => {
  const [mode, setMode] = useState<WriterMode>('GRAMMAR');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = [
    { id: 'GRAMMAR', label: 'Grammar Fixer', icon: <Check />, prompt: 'Fix grammar, spelling, and punctuation in the following text. Keep the original meaning but make it flawless:' },
    { id: 'SUMMARIZE', label: 'Summarizer', icon: <AlignLeft />, prompt: 'Summarize the following text into a concise paragraph:' },
    { id: 'PARAPHRASE', label: 'Paraphraser', icon: <RefreshCw />, prompt: 'Rewrite the following text in a clear, engaging, and professional tone:' },
    { id: 'EMAIL', label: 'Email Writer', icon: <Mail />, prompt: 'Write a professional email based on the following topic or draft:' },
  ] as const;

  const activeTool = tools.find(t => t.id === mode) || tools[0];

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    
    try {
      const fullPrompt = `${activeTool.prompt}\n\n"${inputText}"`;
      const result = await generateText(fullPrompt, "You are a professional writing assistant.");
      setOutputText(result);
    } catch (err) {
      setOutputText("Error generating text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3 mb-2">
          <PenTool className="w-8 h-8 text-teal-600" />
          AI Writer
        </h2>
        <p className="text-slate-500">Professional writing tools powered by Gemini</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => { setMode(tool.id as WriterMode); setOutputText(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium border ${
              mode === tool.id
                ? 'bg-teal-600 text-white shadow-md border-teal-600'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
            {tool.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        {/* Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col shadow-sm">
          <label className="text-sm font-medium text-slate-500 mb-2 flex items-center justify-between">
            <span>Input Text</span>
            <span className="text-xs opacity-50">{inputText.length} chars</span>
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Enter text to ${mode === 'EMAIL' ? 'write about' : activeTool.label.toLowerCase()}...`}
            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-all"
          />
          <div className="mt-4">
             <Button 
               onClick={handleProcess} 
               isLoading={isProcessing} 
               disabled={!inputText.trim()}
               className="w-full bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200"
               icon={<Wand2 className="w-4 h-4" />}
             >
               {mode === 'EMAIL' ? 'Write Email' : activeTool.label}
             </Button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col relative shadow-sm">
           <label className="text-sm font-medium text-slate-500 mb-2 flex items-center justify-between">
             <span>Result</span>
             {outputText && (
               <button 
                 onClick={handleCopy}
                 className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs transition-colors font-semibold"
               >
                 {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                 {copied ? 'Copied' : 'Copy'}
               </button>
             )}
           </label>
           <div className={`flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 overflow-y-auto whitespace-pre-wrap ${!outputText ? 'flex items-center justify-center' : ''}`}>
             {outputText ? outputText : (
               <div className="text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>AI output will appear here</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};