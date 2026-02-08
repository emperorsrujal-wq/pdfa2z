import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Bot, User, File as FileIcon } from 'lucide-react';
import { Button } from './Button.tsx';
import { fileToBase64, formatTime } from '../utils.ts';
import { PdfChatService } from '../services/geminiService.ts';
import { ChatMessage } from '../types.ts';

export const PdfAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatService] = useState(() => new PdfChatService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsLoading(true);
      
      try {
        const base64 = await fileToBase64(selectedFile);
        const initialResponse = await chatService.startChat(base64, selectedFile.type);
        
        setMessages([
          {
            id: 'init-1',
            role: 'model',
            text: initialResponse,
            timestamp: Date.now()
          }
        ]);
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, {
            id: 'err-init',
            role: 'model',
            text: "Sorry, I couldn't process that PDF. Please try again.",
            isError: true,
            timestamp: Date.now()
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMsg.text);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: Date.now()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error replying to that.",
        isError: true,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fade-in">
      {!file ? (
        <div className="w-full flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl border-dashed hover:border-teal-500 hover:bg-teal-50/20 transition-colors cursor-pointer min-h-[400px] shadow-sm" onClick={() => fileInputRef.current?.click()}>
           <div className="p-4 bg-teal-50 rounded-full mb-4">
               <Upload className="w-8 h-8 text-teal-500" />
            </div>
            <p className="text-lg font-medium text-slate-900">Upload PDF to Chat</p>
            <p className="text-slate-500 mt-1">Get summaries and ask questions with AI</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf"
              onChange={handleFileSelect}
            />
        </div>
      ) : (
        <>
          <div className="w-full md:w-64 flex flex-col bg-white rounded-2xl border border-slate-200 p-4 h-[200px] md:h-full shadow-sm">
            <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <FileIcon className="w-8 h-8 text-teal-500" />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="md:mt-auto">
                <Button 
                variant="secondary" 
                onClick={() => { setFile(null); setMessages([]); }}
                className="w-full"
                >
                Upload New File
                </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg h-[500px] md:h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.length === 0 && isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                  <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <p>Analyzing document...</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-teal-600'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-2 opacity-70 ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-2 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask something about the document..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none h-14"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-2 bottom-2 p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors shadow-sm"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};