
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Download, Clock, Image as ImageIcon, ExternalLink, Shield } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryGalleryProps {
  onBack: () => void;
}

export const HistoryGallery: React.FC<HistoryGalleryProps> = ({ onBack }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('user_generation_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('user_generation_history', JSON.stringify(updated));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear your local browsing history? This cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem('user_generation_history');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
                <button 
                  onClick={onBack}
                  className="group p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all shadow-sm"
                >
                  <ArrowLeft size={24} className="text-gray-400 group-hover:text-primary transition-transform group-hover:-translate-x-1" />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Vault</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Local Browser Cache Only</p>
                    </div>
                </div>
            </div>

            {history.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <Trash2 size={16} /> WIPE VAULT
                </button>
            )}
        </div>

        {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-[fadeIn_0.5s_ease-out]">
                <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-gray-700">
                    <ImageIcon size={48} />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">History is Empty</h2>
                <p className="text-gray-500 max-w-sm font-medium leading-relaxed mb-10">
                    Your generated images appear here. We don't store your results on our servers for privacy.
                </p>
                <button 
                    onClick={onBack}
                    className="px-10 py-4 rounded-2xl gradient-bg text-white font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,0,82,0.4)] transition-all active:scale-95"
                >
                    Start Generating
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeIn_0.7s_ease-out]">
                {history.map((item) => (
                    <div 
                        key={item.id}
                        className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-primary/50 transition-all duration-500 shadow-2xl hover:shadow-primary/10"
                    >
                        {/* Image */}
                        <img 
                            src={item.url} 
                            alt="Generated" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />

                        {/* Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Top Info */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                                <Clock size={12} className="text-primary" />
                                <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors"
                                title="Delete from cache"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Bottom Actions */}
                        <div className="absolute bottom-6 left-6 right-6 translate-y-[20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="flex gap-2">
                                <a 
                                    href={item.url} 
                                    download={`RemoveCloths_${item.id}.png`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-3 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                                >
                                    <Download size={14} /> DOWNLOAD
                                </a>
                                <a 
                                    href={item.url} 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>

                        {/* Tags / Config Summary (Minimal) */}
                        {item.settings && (
                            <div className="absolute bottom-20 left-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                {item.settings.gender} • {item.settings.mode}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* Info Footer */}
        <div className="mt-20 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Shield size={28} />
            </div>
            <div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Zero-Persistence Policy</h3>
                <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-2xl">
                    This gallery is powered by your browser's local storage. Your generated images are private to this specific browser and device. Clearing your browser data or clicking "Wipe Vault" will permanently remove these records.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};
