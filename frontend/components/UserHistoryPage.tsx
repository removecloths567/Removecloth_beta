
import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Download, 
  ExternalLink, 
  Clock, 
  Terminal, 
  Activity, 
  Image as ImageIcon,
  History,
  Info,
  ShieldAlert
} from 'lucide-react';
import { getLocalHistory, deleteLocalItem, clearLocalHistory, LocalHistoryItem } from '../lib/storage';

interface UserHistoryPageProps {
  onBack: () => void;
  wsLogs: any[]; // Logs passed from the main App component's websocket listener
}

export const UserHistoryPage: React.FC<UserHistoryPageProps> = ({ onBack, wsLogs }) => {
  const [history, setHistory] = useState<LocalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'generations' | 'live'>('generations');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const items = await getLocalHistory();
      setHistory(items);
    } catch (err) {
      console.error("Failed to load local history", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this result from your local cache?")) {
        await deleteLocalItem(id);
        loadHistory();
    }
  };

  const handleClearAll = async () => {
    if (confirm("Permanently wipe your local browser history? This cannot be undone.")) {
        await clearLocalHistory();
        loadHistory();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-black relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-5 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-5 blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <button 
                onClick={onBack}
                className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-gray-400 hover:text-white w-fit"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-black uppercase tracking-widest text-[10px]">Back to Platform</span>
            </button>

            <div className="flex bg-[#0d0d0d] p-1.5 rounded-2xl border border-white/5 shadow-2xl">
                <button 
                    onClick={() => setActiveTab('generations')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'generations' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <ImageIcon size={14} /> My History
                </button>
                <button 
                    onClick={() => setActiveTab('live')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'live' ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <Activity size={14} /> Live Signal
                </button>
            </div>
        </div>

        {activeTab === 'generations' ? (
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/10 shadow-glow">
                            <History size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Vault</h1>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Encrypted Local Browser Cache</p>
                        </div>
                    </div>
                    {history.length > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10"
                        >
                            <Trash2 size={14} /> Wipe All
                        </button>
                    )}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4 mb-10">
                    <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-amber-200/80 text-xs font-medium leading-relaxed">
                        Privacy notice: These results are stored exclusively in your browser's private data store. Clearing your browser cache or cookies for this site will permanently remove these records. We never upload these results to our permanent databases.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-20">
                        <Activity className="animate-pulse text-primary mb-4" size={48} />
                        <span className="font-black uppercase tracking-[0.5em] text-[10px]">Scanning Vault...</span>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-[#050505] border border-white/5 rounded-[3rem] border-dashed">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-700 mb-6">
                            <ImageIcon size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">The Vault is Empty</h3>
                        <p className="text-gray-500 max-w-xs text-sm font-medium">Your generated results will appear here automatically using your browser's local storage.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {history.map((item) => (
                            <div key={item.id} className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,0,82,0.1)]">
                                <div className="aspect-[3/4] overflow-hidden relative">
                                    <img src={item.imageUrl} alt="Result" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                    
                                    {/* Action Overlays */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <a 
                                            href={item.imageUrl} 
                                            download={`result_${item.id}.png`}
                                            className="p-3 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-500 rounded-2xl hover:bg-green-500 hover:text-white transition-all"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg">
                                            {item.config.mode}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                                            <Clock size={12} />
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-gray-400 text-[11px] font-bold uppercase tracking-tight line-clamp-1">
                                        {item.config.gender} Target • {item.config.bodyType} Build
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <div className="animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-[0_0_20px_rgba(255,0,249,0.2)]">
                        <Terminal size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Terminal</h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Direct Backend Communication logs</p>
                    </div>
                </div>

                <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 min-h-[500px] shadow-inner font-mono relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-secondary opacity-50"></div>
                    
                    <div className="flex flex-col gap-3">
                        {wsLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 opacity-20">
                                <Activity className="animate-pulse text-secondary mb-4" size={48} />
                                <span className="font-black uppercase tracking-[0.5em] text-[10px]">Awaiting Signal Stream...</span>
                            </div>
                        ) : (
                            wsLogs.map((log, i) => (
                                <div key={i} className="flex gap-4 animate-[slideInRight_0.3s_ease-out]">
                                    <span className="text-gray-700 shrink-0">[{new Date(log.time).toLocaleTimeString()}]</span>
                                    <span className="text-secondary font-black shrink-0">WS://STREAM</span>
                                    <span className="text-gray-300 break-all">{JSON.stringify(log.data)}</span>
                                </div>
                            ))
                        )}
                        <div className="h-1 animate-pulse bg-secondary/20 w-3 ml-2 mt-4"></div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">
                    <ShieldAlert size={14} className="text-secondary" />
                    Status: Signal Synchronized with Core Processor
                </div>
            </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .shadow-glow {
            box-shadow: 0 0 20px rgba(255, 0, 82, 0.2);
        }
      `}</style>
    </div>
  );
};
