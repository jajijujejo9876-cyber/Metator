import React, { memo, useState, useRef, useEffect } from 'react';
import { Copy, CheckCircle, Languages, Trash2, Code, Menu, X, Eye, Check } from 'lucide-react';
import { FileItem, Language } from '../types';

interface Props {
  items: FileItem[];
  onDelete: (id: string) => void;
  onToggleLanguage: (id: string) => void;
  getLanguage: (id: string) => Language;
  onPreview?: (item: FileItem) => void;
}

const PromptListComponent: React.FC<Props> = ({ items, onDelete, onToggleLanguage, getLanguage, onPreview }) => {
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setActiveMenuId(null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = items.map(item => {
       const lang = getLanguage(item.id);
       const text = lang === 'ENG' ? item.metadata.en.title : item.metadata.ind.title;
       return text;
    }).join('\n\n');
    navigator.clipboard.writeText(allText);
    setCopiedId('ALL');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-0 bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-50 border-b border-blue-100">
         <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">
            Generated Prompts ({items.length})
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
      <div className="flex flex-col divide-y divide-gray-100">
         {items.map((item, index) => {
            const lang = getLanguage(item.id);
            const text = lang === 'ENG' ? item.metadata.en.title : item.metadata.ind.title;
            const isJson = text.trim().startsWith('{') && text.trim().endsWith('}');
            const isMenuOpen = activeMenuId === item.id;
            
            const isFileMode = item.previewUrl && item.previewUrl.length > 0;

            return (
               // Gap-3 ini yang mengatur jarak rata (12px) antar elemen di dalamnya
               <div key={item.id} className="flex gap-3 p-3 hover:bg-gray-50 transition-colors group h-[100px]">
                  
                  {/* Bagian Kiri: Row Number */}
                  <div className="shrink-0 w-8 flex items-center justify-center h-full">
                     <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-xs font-bold text-gray-500">
                       {index + 1}
                     </div>
                  </div>

                  {/* Bagian Tengah: Content Prompt (Dibuat flex-1 agar mengisi seluruh ruang kosong) */}
                  <div className="flex-1 min-w-0 h-full">
                     <div className={`h-full rounded border overflow-hidden flex flex-col ${isJson ? 'bg-gray-50 border-gray-200 font-mono text-xs' : 'bg-white border-gray-100'}`}>
                        {isJson && <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase p-1.5 border-b border-gray-200 bg-gray-50 shrink-0"><Code size={10} /> JSON Output</div>}
                        
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 p-2 break-words whitespace-pre-wrap">
                            <p className={`text-sm text-gray-800 ${isJson ? '' : 'font-medium'}`}>
                                {text || <span className="text-gray-400 italic">No content generated.</span>}
                            </p>
                        </div>
                     </div>
                  </div>

                  {/* Bagian Kanan: Actions / Menu Area (Dibuat shrink-0 agar ukurannya pas dengan tombol) */}
                  <div className="shrink-0 flex items-center justify-center h-full">
                      <div className="relative flex items-center justify-center w-9 h-9">
                          {isMenuOpen ? (
                              <div 
                                  ref={menuRef}
                                  className="absolute right-0 flex items-center gap-1.5 bg-white border border-gray-200 shadow-xl rounded-lg p-1.5 z-50 animate-in fade-in slide-in-from-right-2 duration-200 ring-1 ring-black/5"
                              >
                                  {/* 1. Preview Mata */}
                                  {isFileMode && onPreview && (
                                      <button 
                                          onClick={() => { onPreview(item); setActiveMenuId(null); }}
                                          className="p-2 rounded-md transition-colors bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                                          title="Preview Gambar/Video Asli"
                                      >
                                          <Eye size={16} />
                                      </button>
                                  )}

                                  {/* 2. Salin */}
                                  <button 
                                      onClick={() => handleCopy(text, item.id)}
                                      className={`p-2 rounded-md transition-colors ${copiedId === item.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`}
                                      title="Salin Prompt"
                                  >
                                      {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                                  </button>

                                  {/* 3. Ganti Bahasa */}
                                  <button 
                                      onClick={() => { onToggleLanguage(item.id); setActiveMenuId(null); }}
                                      className={`p-2 rounded-md transition-colors bg-gray-100 ${lang === 'ENG' ? 'text-blue-600 hover:bg-blue-100' : 'text-emerald-600 hover:bg-emerald-100'}`}
                                      title={`Bahasa saat ini: ${lang}`}
                                  >
                                      <Languages size={16} />
                                  </button>

                                  {/* 4. Hapus */}
                                  <button 
                                      onClick={() => { onDelete(item.id); setActiveMenuId(null); }}
                                      className="p-2 rounded-md transition-colors bg-gray-100 text-red-500 hover:bg-red-100"
                                      title="Hapus Prompt"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                                  
                                  <div className="w-px h-6 bg-gray-200 mx-0.5" />

                                  {/* 5. Tutup Menu (X) */}
                                  <button 
                                      onClick={() => setActiveMenuId(null)}
                                      className="p-2 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                      title="Tutup Menu"
                                  >
                                      <X size={16} />
                                  </button>
                              </div>
                          ) : (
                              <button 
                                  onClick={(e) => toggleMenu(e, item.id)}
                                  className="p-1.5 rounded-lg border bg-white border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all group-hover:border-gray-300 shadow-sm"
                                  title="Action Menu"
                              >
                                  <Menu size={18} />
                              </button>
                          )}
                      </div>
                  </div>

               </div>
            );
         })}
      </div>
    </div>
  );
};

export default memo(PromptListComponent);
