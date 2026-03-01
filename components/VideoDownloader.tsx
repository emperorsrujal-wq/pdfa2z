import * as React from 'react';
import {  useState  } from 'react';
import { Download, Link, Youtube, Facebook, Instagram, Twitter, Search, CheckCircle2, AlertCircle, Video, FileAudio } from 'lucide-react';
import { Button } from './Button.tsx';

interface VideoQuality {
  quality: string;
  format: string;
  size: string;
  url: string; // In a real app, this would be the backend signed URL
}

export const VideoDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    thumbnail: string;
    duration: string;
    source: 'YouTube' | 'Facebook' | 'Instagram' | 'TikTok' | 'Twitter' | 'Unknown';
    qualities: VideoQuality[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    // SIMULATION LOGIC:
    // Real video downloading requires a backend server (node/python) to bypass CORS and handle decryption.
    // This is a frontend-only demo, so we simulate the API response.
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

      let source: any = 'Unknown';
      if (url.includes('youtube.com') || url.includes('youtu.be')) source = 'YouTube';
      else if (url.includes('facebook.com') || url.includes('fb.watch')) source = 'Facebook';
      else if (url.includes('instagram.com')) source = 'Instagram';
      else if (url.includes('tiktok.com')) source = 'TikTok';
      else if (url.includes('twitter.com') || url.includes('x.com')) source = 'Twitter';

      // Mock Result
      setResult({
        title: "Amazing Video Content - " + source,
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
        duration: "03:45",
        source: source,
        qualities: [
          { quality: "1080p", format: "MP4", size: "45.2 MB", url: "#" },
          { quality: "720p", format: "MP4", size: "22.8 MB", url: "#" },
          { quality: "480p", format: "MP4", size: "12.5 MB", url: "#" },
          { quality: "Audio", format: "MP3", size: "3.4 MB", url: "#" },
        ]
      });

    } catch (err) {
      setError("Failed to analyze video URL. Please check the link and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = (q: VideoQuality) => {
    // In a real app, this would trigger the actual download
    // For demo, we download a sample dummy video to show interaction
    const dummyVideo = "https://www.w3schools.com/html/mov_bbb.mp4";
    const a = document.createElement('a');
    a.href = dummyVideo;
    a.download = `video_download_${Date.now()}.${q.format.toLowerCase()}`;
    a.target = "_blank"; // Open in new tab if download attribute is ignored
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <Download className="w-8 h-8 text-rose-600" />
          Universal Video Downloader
        </h1>
        <p className="text-slate-500">Download videos from YouTube, Facebook, Instagram, TikTok & more.</p>
        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 text-sm text-amber-900 flex items-center justify-center gap-2 shadow-sm">
          <AlertCircle size={20} />
          <span><strong>Frontend Demo:</strong> This tool is a simulation (UI-only). Real video downloading requires a backend server due to CORS and encryption policies.</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
              <Link size={20} />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste video URL here..."
              className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <div className="absolute right-2 top-2 bottom-2">
              <Button
                onClick={handleAnalyze}
                isLoading={isAnalyzing}
                disabled={!url.trim()}
                className="h-full bg-rose-600 hover:bg-rose-700 shadow-md"
              >
                Download
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-slate-400 text-sm font-medium">
            <span className="flex items-center gap-1"><Youtube size={16} /> YouTube</span>
            <span className="flex items-center gap-1"><Facebook size={16} /> Facebook</span>
            <span className="flex items-center gap-1"><Instagram size={16} /> Instagram</span>
            <span className="flex items-center gap-1"><Twitter size={16} /> Twitter</span>
            <span className="flex items-center gap-1">TikTok</span>
          </div>
        </div>

        {/* Results Section */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {result && (
          <div className="animate-fade-in bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="w-full md:w-64 aspect-video bg-black rounded-xl overflow-hidden shadow-lg flex-shrink-0 relative">
                <img src={result.thumbnail} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded font-bold">
                  {result.duration}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{result.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold uppercase tracking-wider">{result.source}</span>
                  <span>•</span>
                  <span>Ready to download</span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                  Note: This is a demo. Clicking download will fetch a sample video file as backend processing is required for real platform downloads.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.qualities.map((q, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-rose-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${q.format === 'MP3' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                      {q.format === 'MP3' ? <FileAudio size={20} /> : <Video size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{q.quality}</p>
                      <p className="text-xs text-slate-500">{q.format} • {q.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(q)}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2"
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} />
          </div>
          <h4 className="font-bold text-slate-900 mb-2">Paste Link</h4>
          <p className="text-sm text-slate-500">Copy the URL from the browser or app share button.</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video size={24} />
          </div>
          <h4 className="font-bold text-slate-900 mb-2">Select Quality</h4>
          <p className="text-sm text-slate-500">Choose from 4K, 1080p, 720p or MP3 audio.</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download size={24} />
          </div>
          <h4 className="font-bold text-slate-900 mb-2">Fast Download</h4>
          <p className="text-sm text-slate-500">Save the video directly to your device securely.</p>
        </div>
      </div>
    </div>
  );
};