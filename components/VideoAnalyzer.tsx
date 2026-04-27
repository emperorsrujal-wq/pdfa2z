import * as React from 'react';
import { Send, Upload, Bot, User, Video, X } from 'lucide-react';
import { Button } from './Button.tsx';
import { fileToBase64, formatTime } from '../utils.ts';
import { VideoChatService } from '../services/geminiService.ts';
import { ChatMessage } from '../types.ts';

export const VideoAnalyzer: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [chatService] = React.useState(() => new VideoChatService());
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.size > 20 * 1024 * 1024) {
        setMessages([{ id: 'err-size', role: 'model', text: 'Video file is too large. Please use a video under 20 MB.', timestamp: Date.now() }]);
        return;
      }

      setFile(selectedFile);
      setVideoPreview(URL.createObjectURL(selectedFile));
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
          text: "Sorry, I couldn't analyze that video. Please try a shorter or smaller file.",
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

  const reset = () => {
    setFile(null);
    setVideoPreview(null);
    setMessages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fade-in">
      <h1 className="sr-only">AI Video Analyzer</h1>
      {!file ? (
        <div className="w-full flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl border-dashed hover:border-rose-500 hover:bg-rose-50/20 transition-colors cursor-pointer min-h-[400px] shadow-sm" onClick={() => fileInputRef.current?.click()}>
          <div className="p-4 bg-rose-50 rounded-full mb-4">
            <Video className="w-8 h-8 text-rose-500" />
          </div>
          <p className="text-lg font-medium text-slate-900">Upload Video to Chat</p>
          <p className="text-slate-500 mt-1">AI watches your video and answers questions.</p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <>
          <div className="w-full md:w-80 flex flex-col bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="relative rounded-xl overflow-hidden bg-black mb-4 aspect-video">
              <video src={videoPreview!} controls className="w-full h-full object-contain" />
              <button onClick={reset} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-slate-800 text-sm truncate">{file.name}</h4>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            <div className="mt-auto">
              <Button
                variant="secondary"
                onClick={reset}
                className="w-full"
              >
                Upload New Video
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg h-[500px] md:h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.length === 0 && isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                  <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <p>Watching video...</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-rose-600'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
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
                  placeholder="Ask about the video..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none h-14"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-2 bottom-2 p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors shadow-sm"
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