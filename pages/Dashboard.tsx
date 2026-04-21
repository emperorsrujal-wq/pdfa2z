import * as React from 'react';
import { 
  FileText, Clock, CheckCircle2, Shield, Plus, List, Filter, Search,
  Download, ExternalLink, Settings, MoreVertical, Trash2, Users, 
  BarChart3, Map, LayoutDashboard, Globe, ArrowUpRight, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { subscribeToUserSessions, NotarizationSession } from '../services/notarizeService';
import { getLibraryDocuments } from '../services/documentService';
import { getLeadsForOwner, JourneyLead } from '../services/leadService';
import { UserDocument } from '../types';
import { DEMO_MODE } from '../config/firebase';
import { formatFileSize } from '../services/notarizeService';
import { Link } from 'react-router-dom';
import { maskIp } from '../services/geoService';
import { LeadDetailModal } from '../components/LeadDetailModal';
import { WorldMap } from '../components/WorldMap';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [sessions, setSessions] = React.useState<NotarizationSession[]>([]);
  const [docs, setDocs] = React.useState<UserDocument[]>([]);
  const [leads, setLeads] = React.useState<JourneyLead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'documents' | 'notarizations' | 'leads' | 'analytics'>('overview');
  const [selectedLead, setSelectedLead] = React.useState<JourneyLead | null>(null);

  React.useEffect(() => {
    // Load Notarizations
    const unsubSessions = subscribeToUserSessions(s => {
      setSessions(s);
    });

    // Load generic Documents and Leads
    const loadAllData = async () => {
      try {
        const [userDocs, userLeads] = await Promise.all([
          getLibraryDocuments(),
          getLeadsForOwner()
        ]);
        setDocs(userDocs);
        setLeads(userLeads);
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
    return () => {
      unsubSessions();
    };
  }, []);

  const refreshLeads = async () => {
    const userLeads = await getLeadsForOwner();
    setLeads(userLeads);
    if (selectedLead) {
      const updated = userLeads.find(l => l.id === selectedLead.id);
      if (updated) setSelectedLead(updated);
    }
  };

  const stats = [
    { label: 'Active Journeys', value: leads.length, icon: <Users size={20} />, color: 'bg-indigo-50 text-indigo-600', trend: '+12%' },
    { label: 'Est. Time Saved', value: `${Math.round(leads.length * 0.5)}h`, icon: <Clock size={20} />, color: 'bg-blue-50 text-blue-600', trend: '+5%' },
    { label: 'Compliance ROI', value: `${(leads.length * 25).toLocaleString()}$`, icon: <Shield size={20} />, color: 'bg-emerald-50 text-emerald-600', trend: '+2%' },
  ];

  if (!user && !DEMO_MODE) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
          <Shield size={40} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{t('dashboard.accessDenied')}</h2>
        <p className="text-slate-500 mb-8 max-w-md">{t('dashboard.accessDeniedDesc')}</p>
        <Link to="/" className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          {t('dashboard.returnHome')}
        </Link>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'leads', label: 'Journeys & Compliance', icon: <Users size={20} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={20} /> },
    { id: 'notarizations', label: 'Notarizations', icon: <Shield size={20} /> },
    { id: 'analytics', label: 'Geo Analytics', icon: <Globe size={20} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)] gap-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Elite Dashboard Sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <div className="glass-panel p-4 rounded-[2rem] sticky top-24">
          <div className="mb-8 px-4 py-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Console</h2>
            <p className="text-lg font-black text-slate-900">Elite Hub</p>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-20 pt-6 border-t border-slate-100">
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">{activeTab}</h1>
            <p className="text-slate-500 font-medium">Welcome back, {user?.email?.split('@')[0] || 'Partner'}</p>
          </div>
          <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm hover:shadow-md transition-all">
            <Plus size={18} className="text-blue-600" /> New Journey
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Intelligence...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.map((stat) => (
                    <div key={stat.label} className="premium-card p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity Mini-Tab */}
                <div className="premium-card overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 tracking-tight">Recent Leads</h3>
                    <button onClick={() => setActiveTab('leads')} className="text-blue-600 text-xs font-bold flex items-center gap-1">View CRM <ArrowUpRight size={14} /></button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {leads.slice(0, 5).map(lead => (
                      <div 
                        key={lead.id} 
                        onClick={() => setSelectedLead(lead)}
                        className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                          {lead.data.name?.substring(0,2).toUpperCase() || 'LD'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{lead.data.name || lead.data.email || 'Lead Submission'}</p>
                          <p className="text-xs text-slate-400">{lead.journeyTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-700">{lead.geoData?.city || 'Globe'}</p>
                          <p className="text-[10px] text-slate-400">{new Date(lead.createdAt?.toDate?.() || lead.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {leads.length === 0 && <p className="p-10 text-center text-slate-400 text-sm">Waiting for incoming leads...</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="premium-card overflow-hidden min-h-[600px]">
                <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 border-b border-slate-100">
                  <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search leads by name, email or city..." className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-white transition-all"><Filter size={20} /></button>
                    <button className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">Export CSV</button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black border-b border-slate-100">
                        <th className="px-8 py-5">Identified Lead</th>
                        <th className="px-8 py-5">Journey Route</th>
                        <th className="px-8 py-5">Intelligence (Geo)</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leads.map(lead => (
                        <tr 
                          key={lead.id} 
                          onClick={() => setSelectedLead(lead)}
                          className="hover:bg-slate-50 group transition-colors cursor-pointer"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-sm text-slate-500 border border-white shadow-sm">
                                {lead.data.name?.substring(0, 1) || 'L'}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 tracking-tight">{lead.data.name || 'Anonymous'}</p>
                                <p className="text-xs text-slate-400 font-medium">{lead.data.email || 'No email provided'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{lead.journeyTitle}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <Globe size={12} className="text-slate-400" />
                                {lead.geoData?.city}, {lead.geoData?.country}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">IP: {maskIp(lead.geoData?.ip || '')}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              lead.status === 'new' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                              lead.status === 'qualified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                              {lead.pdfUrl && (
                                <a href={lead.pdfUrl} target="_blank" className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm">
                                  <Download size={16} />
                                </a>
                              )}
                              <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                                <ExternalLink size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                   {leads.length === 0 && <div className="py-20 text-center text-slate-400">No leads processed yet.</div>}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 premium-card p-1 overflow-hidden min-h-[500px] flex flex-col">
                  <div className="p-8 border-b border-slate-50">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Global Distribution intelligence</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Live from Lead Geo-capture</p>
                  </div>
                  <div className="flex-1 bg-slate-50/50 p-10 flex items-center justify-center relative">
                    <WorldMap leads={leads} />
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="premium-card p-8">
                    <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Distribution Breakdown</h3>
                    <div className="space-y-6">
                      {Object.entries(
                        leads.reduce((acc, lead) => {
                          const country = lead.geoData?.country || 'Unknown';
                          acc[country] = (acc[country] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([country, count]) => (
                        <div key={country} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-2"><Globe size={12} className="text-blue-500" /> {country}</span>
                            <span>{((count / leads.length) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${(count / leads.length) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                      {leads.length === 0 && <p className="text-slate-400 text-center py-20">No geo intelligence available yet.</p>}
                    </div>
                  </div>

                  <div className="premium-card p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-0">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                      <Shield size={24} className="text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-black mb-2">Satellite Feed</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">Your data is being aggregated from real-time secure IP packets globally.</p>
                    <button className="w-full py-4 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Download Report</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="premium-card overflow-hidden min-h-[600px]">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Document Library</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Managed Assets</p>
                  </div>
                  <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"><Settings size={20} /></button>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docs.map(doc => (
                      <div key={doc.id} className="p-6 bg-white border border-slate-100 rounded-3xl hover:border-blue-600 hover:shadow-xl transition-all group">
                         <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                               <FileText size={24} />
                            </div>
                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical size={18} /></button>
                         </div>
                         <h4 className="font-bold text-slate-900 truncate mb-1">{doc.fileName}</h4>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                           <Clock size={10} /> {new Date(doc.createdAt?.toDate?.() || doc.createdAt).toLocaleDateString()}
                         </p>
                         <div className="mt-8 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">{formatFileSize(doc.fileSize || 0)}</span>
                            <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Download size={16} /></button>
                         </div>
                      </div>
                    ))}
                    {docs.length === 0 && <p className="col-span-full text-center py-20 text-slate-400">Your document library is empty.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notarizations' && (
              <div className="premium-card overflow-hidden min-h-[600px]">
                <div className="p-8 border-b border-slate-50">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Notarization Sessions</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Blockchain Hash Audit</p>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                        <th className="px-8 py-5">Session</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5">Completed</th>
                        <th className="px-8 py-5 text-right">Certificate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sessions.map(session => (
                        <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                   <Shield size={18} />
                                </div>
                                <span className="font-bold text-slate-900">#{session.id.substring(0,8)}</span>
                             </div>
                           </td>
                           <td className="px-8 py-6">
                             <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">{session.status}</span>
                           </td>
                           <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                             {session.completed_at ? new Date(session.completed_at?.toDate?.() || session.completed_at).toLocaleDateString() : (session.created_at ? new Date(session.created_at?.toDate?.() || session.created_at).toLocaleDateString() : 'N/A')}
                           </td>
                           <td className="px-8 py-6 text-right">
                             <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all shadow-sm"><Download size={16} /></button>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                   {sessions.length === 0 && <p className="text-center py-20 text-slate-400">No notarization sessions recorded.</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lead CRM Detail Modal */}
      {selectedLead && (
        <LeadDetailModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onUpdate={refreshLeads}
        />
      )}
    </div>
  );
};

