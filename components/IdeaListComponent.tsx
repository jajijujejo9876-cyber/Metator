
import React, { memo, useState, useRef, useEffect } from 'react';
import { Copy, CheckCircle, AlertTriangle, Menu, Trash2, Languages, Check, X, ExternalLink } from 'lucide-react';
import { FileItem, Language } from '../types';

interface Props {
  items: FileItem[];
  negativeContext?: string;
  onDelete: (id: string) => void;
  onToggleLanguage: (id: string) => void;
  getLanguage: (id: string) => Language;
  isMode1: boolean;
}

const IdeaListComponent: React.FC<Props> = ({ 
  items, 
  negativeContext = "", 
  onDelete, 
  onToggleLanguage, 
  getLanguage,
  isMode1
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCleanTitle = (text: string) => {
    if (!text) return "";
    return text.includes('|||') ? text.split('|||')[0].trim() : text.trim();
  };

  const getVulgarWord = (text: string) => {
    if (!text || !negativeContext) return null;
    const words = negativeContext.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
    const lowerText = text.toLowerCase();
    for (const word of words) {
        if (lowerText.includes(word)) return word.toUpperCase();
    }
    return null;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setActiveMenuId(null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = items.map(item => {
       const rowId = item.sourceData?.id || 0;
       const lang = getLanguage(item.id);
       const rawText = lang === 'ENG' ? item.metadata?.en?.title : item.metadata?.ind?.title;
       const title = getCleanTitle(rawText || "");
       const vulgar = getVulgarWord(title);
       return `${rowId}. ${vulgar ? `[HIDDEN - ${vulgar} DETECTED]` : title}`;
    }).join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedId('ALL');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleOpenLink = (url: string | undefined) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
      setActiveMenuId(null);
    }
  };

  return (
    <div className="flex flex-col gap-0 bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-50 border-b border-blue-100 shrink-0">
         <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">
            Idea Output Results ({items.length})
         </h3>
         <div className="flex gap-2">
            <button 
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 rounded text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors uppercase"
            >
              {copiedId === 'ALL' ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copiedId === 'ALL' ? 'Copied All' : 'Copy All'}
            </button>
         </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 bg-gray-50/30">
          <div className="flex flex-col divide-y divide-gray-100">
             {items.map((item) => {
                const rowId = item.sourceData?.id || 0;
                const lang = getLanguage(item.id);
                const rawText = lang === 'ENG' ? item.metadata?.en?.title : item.metadata?.ind?.title;
                const title = getCleanTitle(rawText || "");
                const vulgarWord = getVulgarWord(title);
                const isMenuOpen = activeMenuId === item.id;
                const originalUrl = item.sourceData?.originalKeywords;

                return (
                   <div key={item.id} className={`flex items-center gap-3 px-3 transition-colors group relative h-16 shrink-0 ${vulgarWord ? 'bg-red-50 hover:bg-red-100/60' : 'hover:bg-white'}`}>
                      {/* Row Number */}
                      <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded text-xs font-bold ${vulgarWord ? 'bg-red-200 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                         {rowId}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                         {vulgarWord ? (
                            <div className="flex items-center gap-2 text-red-600 whitespace-nowrap overflow-hidden">
                               <AlertTriangle size={14} className="shrink-0" />
                               <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-2 py-0.5 rounded shadow-sm">
                                  {vulgarWord} / BLOCKED DETECTED
                               </span>
                            </div>
                         ) : (
                            <p className="text-sm text-gray-800 font-medium truncate select-all" title={title}>{title}</p>
                         )}
                      </div>

                      {/* Action Menu Container */}
                      <div className="relative flex items-center justify-end shrink-0 w-9 h-9">
                        {isMenuOpen ? (
                            <div 
                                ref={menuRef}
                                className="absolute right-0 flex items-center gap-1.5 bg-white border border-gray-200 shadow-xl rounded-lg p-1.5 z-50 animate-in fade-in slide-in-from-right-2 duration-200 ring-1 ring-black/5"
                            >
                                {/* Jika TIDAK terdeteksi vulgar, tampilkan Link dan Salin */}
                                {!vulgarWord && (
                                    <>
                                        {/* 1. Akses Link */}
                                        {originalUrl && originalUrl.startsWith('http') && (
                                            <button 
                                                onClick={() => handleOpenLink(originalUrl)}
                                                className="p-2 rounded-md transition-colors bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                                                title="Buka Link Asli"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                        )}

                                        {/* 2. Salin */}
                                        <button 
                                            onClick={() => handleCopy(title, item.id)}
                                            className={`p-2 rounded-md transition-colors ${copiedId === item.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`}
                                            title="Salin Teks"
                                        >
                                            {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                                        </button>

                                        {/* Opsional: Language (Hanya Mode 1) */}
                                        {isMode1 && (
                                            <button 
                                                onClick={() => { onToggleLanguage(item.id); setActiveMenuId(null); }}
                                                className={`p-2 rounded-md transition-colors bg-gray-100 ${lang === 'ENG' ? 'text-blue-600 hover:bg-blue-100' : 'text-emerald-600 hover:bg-emerald-100'}`}
                                                title={`Bahasa: ${lang}`}
                                            >
                                                <Languages size={16} />
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* 3. Delete (Selalu tampil) */}
                                <button 
                                    onClick={() => { onDelete(item.id); setActiveMenuId(null); }}
                                    className="p-2 rounded-md transition-colors bg-gray-100 text-red-500 hover:bg-red-100"
                                    title="Hapus"
                                >
                                    <Trash2 size={16} />
                                </button>
                                
                                <div className="w-px h-6 bg-gray-200 mx-0.5" />

                                {/* 4. X (Tutup Menu) */}
                                <button 
                                    onClick={() => setActiveMenuId(null)}
                                    className="p-2 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                    title="Tutup"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={(e) => toggleMenu(e, item.id)}
                                className="p-1.5 rounded-lg border bg-white border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all group-hover:border-gray-300"
                            >
                                <Menu size={18} />
                            </button>
                        )}
                      </div>
                   </div>
                );
             })}
          </div>
      </div>
    </div>
  );
};

export default memo(IdeaListComponent);
