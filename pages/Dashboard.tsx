import * as React from 'react';
import { 
  FileText, Clock, CheckCircle2, Shield, Plus, List, Filter, Search,
  Download, ExternalLink, Settings, MoreVertical, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { subscribeToUserSessions, NotarizationSession } from '../services/notarizeService';
import { getUserDocuments as getNotaryDocs } from '../services/notarizeService';
import { getLibraryDocuments } from '../services/documentService';
import { UserDocument } from '../types';
import { DEMO_MODE } from '../config/firebase';
import { formatFileSize } from '../services/notarizeService';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [sessions, setSessions] = React.useState<NotarizationSession[]>([]);
  const [docs, setDocs] = React.useState<UserDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'documents' | 'notarizations'>('documents');

  React.useEffect(() => {
    // Load Notarizations
    const unsubSessions = subscribeToUserSessions(s => {
      setSessions(s);
    });

    // Load generic Documents
    const loadDocs = async () => {
      const userDocs = await getLibraryDocuments();
      setDocs(userDocs);
      setLoading(false);
    };

    loadDocs();
    return () => {
      unsubSessions();
    };
  }, []);

  const stats = [
    { label: t('dashboard.totalFiles'), value: docs.length + sessions.length, icon: <FileText size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: t('dashboard.notarized'), value: sessions.filter(s => s.status === 'completed').length, icon: <Shield size={20} />, color: 'bg-green-50 text-green-600' },
    { label: t('dashboard.recent'), value: docs.filter(d => {
        const dDate = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
        return (new Date().getTime() - dDate.getTime()) < 86400000;
      }).length, icon: <Clock size={20} />, color: 'bg-amber-50 text-amber-600' },
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t('dashboard.title')}</h1>
          <p className="text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Plus size={16} /> {t('dashboard.newTool')}
          </Link>
          <button onClick={() => signOut()} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all">
            {t('common.signOut')}
          </button>
        </div>
      </div>

      {/* Demo Mode Alert */}
      {DEMO_MODE && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl">🚀</span>
          <div>
            <p className="font-black text-amber-800 text-sm">Demo Mode Active</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Persistence is simulated. Add real Firebase keys to enable permanent storage.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        {/* Tabs */}
        <div className="flex items-center border-b border-slate-100 px-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-5 font-black text-sm transition-all border-b-2 inline-flex items-center gap-2 ${
              activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText size={18} /> {t('dashboard.myDocuments')}
          </button>
          <button 
            onClick={() => setActiveTab('notarizations')}
            className={`px-4 py-5 font-black text-sm transition-all border-b-2 inline-flex items-center gap-2 ${
              activeTab === 'notarizations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Shield size={18} /> {t('dashboard.notarizations')}
          </button>
        </div>

        {/* Filters/Search (Mockup) */}
        <div className="p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('dashboard.searchPlaceholder')} 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-white transition-all"><Filter size={18} /></button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-white transition-all"><List size={18} /></button>
          </div>
        </div>

        {/* Table/Grid List */}
        <div className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
              <p className="text-slate-400 text-sm font-medium">{t('dashboard.loading')}</p>
            </div>
          ) : activeTab === 'documents' ? (
            docs.length === 0 ? (
              <EmptyState 
                title={t('dashboard.noDocsTitle')} 
                desc={t('dashboard.noDocsDesc')} 
                actionLabel={t('dashboard.newTool')}
                actionPath="/"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                      <th className="px-6 py-3">File Name</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {docs.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50 group transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <FileText size={18} />
                            </div>
                            <span className="font-bold text-sm text-slate-700 truncate max-w-[200px]">{doc.fileName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{doc.category}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-400">{formatFileSize(doc.fileSize)}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {doc.createdAt?.toDate?.()?.toLocaleDateString() || 'Today'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a href={doc.downloadUrl} download className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download">
                              <Download size={16} />
                            </a>
                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            sessions.length === 0 ? (
              <EmptyState 
                title={t('dashboard.noNotaryTitle')} 
                desc={t('dashboard.noNotaryDesc')} 
                actionLabel={t('dashboard.notarizations')}
                actionPath="/notarize"
              />
            ) : (
              <div className="divide-y divide-slate-50">
                {sessions.map(sess => (
                  <div key={sess.id} className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Shield size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-sm truncate">{sess.document_name || 'Legal Session'}</p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{sess.status.replace('_', ' ')} · {sess.notary_type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      sess.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {sess.status}
                    </span>
                    <button className="p-2 text-slate-300 hover:text-slate-600"><MoreVertical size={18} /></button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ title: string; desc: string; actionLabel: string; actionPath: string }> = ({ title, desc, actionLabel, actionPath }) => (
  <div className="flex flex-col items-center justify-center py-20 px-8 text-center max-w-sm mx-auto">
    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
      <FileText size={32} className="text-slate-200" />
    </div>
    <h3 className="text-lg font-black text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-400 text-sm mb-8 leading-relaxed">{desc}</p>
    <Link to={actionPath} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2">
      <Plus size={18} /> {actionLabel}
    </Link>
  </div>
);
