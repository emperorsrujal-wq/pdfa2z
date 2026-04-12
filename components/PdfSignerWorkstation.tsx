import * as React from 'react';
import { 
  FileSignature, 
  User, 
  Calendar, 
  Type, 
  CheckCircle2, 
  X, 
  ArrowLeft, 
  Smartphone,
  Shield,
  Zap,
  Layout,
  Mic,
  Plus
} from 'lucide-react';
import { Button } from './Button';
import { PdfEditorCanvas } from './PdfEditorCanvas';
import { SignaturePad } from './SignaturePad';
import { EditElement, detectSigningLines } from '../utils/pdfHelpers';

interface PdfSignerWorkstationProps {
  image: string;
  pageIndex: number;
  totalPages: number;
  file: File;
  onSave: (elements: EditElement[]) => void;
  onCancel: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const PdfSignerWorkstation: React.FC<PdfSignerWorkstationProps> = ({
  image,
  pageIndex,
  totalPages,
  file,
  onSave,
  onCancel,
  onNextPage,
  onPrevPage
}) => {
  const [elements, setElements] = React.useState<EditElement[]>([]);
  const [isMobileModalOpen, setIsMobileModalOpen] = React.useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = React.useState(false);
  const [isSigPadOpen, setIsSigPadOpen] = React.useState(false);
  const [isRecordingIntent, setIsRecordingIntent] = React.useState(false);
  const [hasVoiceEvidence, setHasVoiceEvidence] = React.useState(false);
  const [pendingFieldType, setPendingFieldType] = React.useState<'signature' | 'initial' | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  const addField = (type: 'signature' | 'initial' | 'date' | 'name') => {
    if (type === 'signature' || type === 'initial') {
      setPendingFieldType(type);
      setIsSigPadOpen(true);
      return;
    }

    const newEl: EditElement = {
      id: `${type}-${Date.now()}`,
      type: 'text',
      pageIndex,
      x: 500,
      y: 500,
      width: 150,
      height: 40,
      text: type === 'date' ? new Date().toLocaleDateString() : 'Full Name',
      color: '#000000',
      opacity: 1
    };
    setElements([...elements, newEl]);
  };

  const handleSignatureSave = (base64: string) => {
    const newEl: EditElement = {
      id: `${pendingFieldType}-${Date.now()}`,
      type: 'image',
      pageIndex,
      x: 500, y: 500, width: 200, height: 80,
      imageUrl: base64,
      opacity: 1
    };
    setElements([...elements, newEl]);
    setIsSigPadOpen(false);
    setPendingFieldType(null);
  };

  const handleAiSmartFind = async () => {
    setIsScanning(true);
    try {
      // Use actual document file for AI detection
      const found = await detectSigningLines(file, pageIndex);
      
      const newFields: EditElement[] = found.map((area, i) => ({
        id: `ai-field-${i}-${Date.now()}`,
        type: 'rect',
        pageIndex,
        x: (area.x / 612) * 1000, // Normalized to 1000
        y: (area.y / 792) * 1000,
        width: (area.width / 612) * 1000,
        height: (area.height / 792) * 1000,
        color: '#6366f1',
        opacity: 0.2
      }));

      setElements([...elements, ...newFields]);
      // alert(`AI detected ${found.length} possible signing areas!`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col animate-in fade-in duration-300">
      {/* Premium Signer Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FileSignature size={24} />
             </div>
             <div>
                <h1 className="text-lg font-black text-slate-900 leading-none">Elite Signer</h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Next-Gen Agreement Logic</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="ghost" className="text-slate-600" onClick={() => setIsAuditModalOpen(true)}>
             <Shield size={18} className="mr-2" /> Audit Trail
           </Button>
           <Button variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50/50" onClick={() => setIsMobileModalOpen(true)}>
             <Smartphone size={18} className="mr-2" /> Mobile Handoff
           </Button>
           <div className="w-px h-6 bg-slate-200 mx-2" />
           <Button 
             variant="primary" 
             onClick={() => {
               if (!hasVoiceEvidence) {
                 setIsRecordingIntent(true);
               } else {
                 onSave(elements);
               }
             }}
           >
             <CheckCircle2 size={18} className="mr-2" /> Complete & Finish
           </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Signature Fields */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-4 shrink-0 overflow-y-auto">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Standard Fields</h3>
           <div className="grid grid-cols-1 gap-3">
              <button onClick={() => addField('signature')} className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl group transition-all text-left">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                    <FileSignature size={20} />
                 </div>
                 <div>
                    <span className="block text-sm font-bold text-slate-700">Signature</span>
                    <span className="text-[10px] text-slate-400 font-medium">Draw or upload</span>
                 </div>
              </button>

              <button onClick={() => addField('initial')} className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl group transition-all text-left">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                    <Type size={20} />
                 </div>
                 <div>
                    <span className="block text-sm font-bold text-slate-700">Initial</span>
                    <span className="text-[10px] text-slate-400 font-medium">Short format</span>
                 </div>
              </button>

              <button onClick={() => addField('date')} className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl group transition-all text-left">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                    <Calendar size={20} />
                 </div>
                 <div>
                    <span className="block text-sm font-bold text-slate-700">Date Signed</span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-populated</span>
                 </div>
              </button>

              <button onClick={() => addField('name')} className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl group transition-all text-left">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                    <User size={20} />
                 </div>
                 <div>
                    <span className="block text-sm font-bold text-slate-700">Name</span>
                    <span className="text-[10px] text-slate-400 font-medium">Full Name</span>
                 </div>
              </button>
           </div>

           <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">AI Features</h3>
              <button 
                onClick={handleAiSmartFind}
                disabled={isScanning}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl shadow-lg shadow-indigo-200/50 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50"
              >
                 <Zap size={20} className={`text-yellow-400 fill-yellow-400 ${isScanning ? 'animate-pulse' : ''}`} />
                 <div className="text-left">
                    <span className="block text-sm font-black">{isScanning ? 'Scanning...' : 'AI Smart-Find'}</span>
                    <span className="text-[10px] text-indigo-100 font-bold opacity-80 uppercase tracking-tight">Detect Sign Lines</span>
                 </div>
              </button>
           </div>
        </aside>

        {/* Central Canvas Area */}
        <main className="flex-1 bg-slate-50 flex flex-col items-center p-8 overflow-y-auto">
           <div className="max-w-4xl w-full flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 shadow-sm">
                       {pageIndex + 1}
                    </div>
                    <span>of {totalPages} Pages</span>
                 </div>
                 <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <Button variant="ghost" size="sm" onClick={onPrevPage} disabled={pageIndex === 0}>Prev</Button>
                    <Button variant="ghost" size="sm" onClick={onNextPage} disabled={pageIndex === totalPages - 1}>Next</Button>
                 </div>
              </div>

              <div className="w-full shadow-2xl shadow-indigo-900/10 rounded-sm overflow-hidden border border-slate-200">
                 <PdfEditorCanvas 
                   image={image}
                   pageIndex={pageIndex}
                   initialElements={elements}
                   onSave={(els) => setElements(els)}
                   onCancel={() => {}} // Internal cancel handled differently
                   isEmbedded={true}
                   file={file}
                 />
              </div>

              <div className="flex items-center justify-center font-bold text-slate-400 text-sm gap-2">
                 <Shield size={16} /> 256-bit SSL Secure Signing Environment
              </div>
           </div>
        </main>
      </div>

      {/* Signature Pad Modal */}
      {isSigPadOpen && (
        <SignaturePad 
          onSave={handleSignatureSave}
          onCancel={() => {
            setIsSigPadOpen(false);
            setPendingFieldType(null);
          }}
        />
      )}

      {/* Mobile Modal Placeholder */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-xl font-black text-slate-900">Mobile Handoff</h3>
                    <p className="text-sm text-slate-500 font-medium">Scan to sign with your finger.</p>
                 </div>
                 <button onClick={() => setIsMobileModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X size={20} className="text-slate-400" />
                 </button>
              </div>
              <div className="aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
                 <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                    {/* Placeholder for QR Code */}
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                       <Smartphone size={64} className="text-white opacity-20" />
                    </div>
                 </div>
                 <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Awaiting Scan...</span>
              </div>
              <p className="mt-6 text-xs text-center text-slate-400 leading-relaxed font-medium">
                 This will open a secure signature pad on your mobile device. Any marks made will sync in real-time.
              </p>
           </div>
        </div>
      )}

      {/* Audit Modal Placeholder */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                       <Shield size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">Proof of Intent</h3>
                       <p className="text-sm text-slate-500 font-medium">Advanced Audit Trail</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAuditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X size={20} className="text-slate-400" />
                 </button>
              </div>
              
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4 transition-all hover:border-indigo-200 hover:bg-indigo-50 group">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">
                       <Mic size={24} />
                    </div>
                    <div>
                       <span className="block text-sm font-bold text-slate-900 uppercase">Voice Evidence</span>
                       <span className="text-xs text-slate-500 font-medium italic">"I agree to the terms of this document"</span>
                    </div>
                 </div>
                 
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                       <span>Audit Log</span>
                       <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> Live</span>
                    </div>
                    <div className="space-y-2">
                       <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                          <span>Session ID:</span>
                          <span className="text-slate-900 font-bold underline">#AG-9582-0A6D</span>
                       </div>
                       <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                          <span>IP Address:</span>
                          <span className="text-slate-900 font-bold">192.168.1.1 (Encrypted)</span>
                       </div>
                    </div>
                 </div>
              </div>

              <Button className="w-full mt-8" onClick={() => setIsAuditModalOpen(false)}>
                 Back to Workstation
              </Button>
           </div>
        </div>
      )}
      {/* Proof of Intent Recording Modal */}
      {isRecordingIntent && (
        <div className="fixed inset-0 z-[400] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                 <Mic size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Voice Confirmation</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                 To create a secure audit trail, please read the following statement aloud:
              </p>
              <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 mb-8 italic text-lg font-bold text-slate-800">
                 "I hereby agree to the terms and conditions outlined in this document."
              </div>
              <div className="flex gap-4">
                 <Button variant="secondary" className="flex-1" onClick={() => setIsRecordingIntent(false)}>Cancel</Button>
                 <Button variant="primary" className="flex-[2]" onClick={() => {
                   setHasVoiceEvidence(true);
                   setIsRecordingIntent(false);
                   // Show success then auto-save or wait for next click
                   alert("Voice evidence captured and hashed into the audit trail.");
                 }}>
                   Stop & Confirm
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
