import * as React from 'react';
import { 
  X, Calendar, MessageSquare, MapPin, Mail, 
  FileText, ExternalLink, Download, Clock, Globe, Shield,
  Save, Trash2
} from 'lucide-react';
import { JourneyLead, updateLead } from '../services/leadService';
import { maskIp } from '../services/geoService';

interface LeadDetailModalProps {
  lead: JourneyLead;
  onClose: () => void;
  onUpdate: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, onUpdate }) => {
  const [notes, setNotes] = React.useState(lead.notes || '');
  const [followUpDate, setFollowUpDate] = React.useState(lead.followUpDate || '');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (lead.id) {
        await updateLead(lead.id, { notes, followUpDate });
        onUpdate();
      }
    } catch (err) {
      console.error("Failed to update lead:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-50">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <span className="text-2xl font-black">{lead.data.name?.substring(0, 1) || 'L'}</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{lead.data.name || 'Anonymous Lead'}</h2>
              <div className="flex items-center gap-3 mt-1 text-slate-400 font-bold text-xs uppercase tracking-widest">
                 <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-500">{lead.journeyTitle}</span>
                 <span>•</span>
                 <span>ID: {lead.id?.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Lead Data */}
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-2 mb-6 text-blue-600">
                  <Shield size={20} className="fill-blue-600/10" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Contact Intelligence</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-slate-600">
                    <Mail size={18} className="text-slate-300" />
                    <span className="font-medium">{lead.data.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <Clock size={18} className="text-slate-300" />
                    <span className="font-medium">Captured: {new Date(lead.createdAt?.toDate?.() || lead.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-6 text-emerald-600">
                  <Globe size={20} className="fill-emerald-600/10" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Geo Distribution</h3>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6">
                   <div className="flex-1">
                      <p className="text-sm font-black text-slate-900">{lead.geoData?.city}, {lead.geoData?.country}</p>
                      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">IP Address: {maskIp(lead.geoData?.ip || '')}</p>
                   </div>
                   <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300">
                      <MapPin size={24} />
                   </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-6 text-indigo-600">
                  <FileText size={20} className="fill-indigo-600/10" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Documents & Assets</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                   {lead.pdfUrl && (
                     <a href={lead.pdfUrl} target="_blank" className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                              <FileText size={20} />
                           </div>
                           <span className="text-sm font-bold text-slate-900">Signed Submission</span>
                        </div>
                        <Download size={18} className="text-slate-300 group-hover:text-indigo-600" />
                     </a>
                   )}
                   {lead.attachmentUrls?.map((url, i) => (
                     <a key={i} href={url} target="_blank" className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                              <FileText size={20} />
                           </div>
                           <span className="text-sm font-bold text-slate-900">Attachment {i+1}</span>
                        </div>
                        <ExternalLink size={18} className="text-slate-300 group-hover:text-indigo-600" />
                     </a>
                   ))}
                </div>
              </section>
            </div>

            {/* Right: CRM follow-up */}
            <div className="space-y-8">
               <section className="premium-card p-8 bg-slate-900 text-white border-0 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                     <Calendar size={20} className="text-indigo-400" />
                     <h3 className="text-xs font-black uppercase tracking-[0.2em]">Elite CRM Actions</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Follow-up Date</label>
                      <input 
                        type="date" 
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all font-bold"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Internal Notes</label>
                      <textarea 
                        rows={6}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add strategic notes about this lead..."
                        className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all font-medium resize-none"
                      />
                    </div>

                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                      {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <Save size={20} />}
                      Save CRM Update
                    </button>
                  </div>
               </section>

               <div className="flex items-center justify-between px-2">
                  <button className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2">
                    <Trash2 size={14} /> Archive Lead
                  </button>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Modified: Just now</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
