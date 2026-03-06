import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Key, Plus, Trash2, XCircle, ListOrdered, Search, Save, FileText, ExternalLink, Sparkles, Coffee } from 'lucide-react';
import { AppMode, ApiProvider } from '../types';

interface Props {
  apiKeys?: string[];
  setApiKeys?: (keys: string[]) => void;
  isProcessing: boolean;
  mode?: AppMode | 'logs'; 
  
  provider?: ApiProvider | 'CUSTOM' | string;
  setProvider?: (provider: any) => void;
  
  geminiModel?: string;
  setGeminiModel?: (m: string) => void;
  
  workerCount?: number;
  setWorkerCount?: (count: number) => void;

  apiDelay?: number;
  setApiDelay?: (delay: number) => void;
}

const ApiKeyPanel: React.FC<Props> = ({ 
  apiKeys = [], 
  setApiKeys = () => {}, 
  isProcessing, 
  provider = 'GEMINI CANVAS',
  setProvider,
  geminiModel = 'gemini-3.1-pro', 
  setGeminiModel,
  workerCount,
  setWorkerCount,
  apiDelay,
  setApiDelay,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = { 
      border: 'border-blue-200', 
      separator: 'border-blue-100',
      divider: 'border-gray-100', 
      icon: 'text-blue-500', 
      inputFocus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none',
      buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
      buttonPrimaryText: 'text-white',
      countBg: 'bg-blue-100 text-blue-800'
  };

  const inputClass = `w-full h-8 text-xs px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-900 transition-all disabled:bg-gray-50 disabled:text-gray-400 ${theme.inputFocus}`;

  useEffect(() => {
    if (workerCount === undefined && setWorkerCount) {
        setWorkerCount(5);
    }
    if (apiDelay === undefined && setApiDelay) {
        setApiDelay(3);
    }
  }, [workerCount, apiDelay, setWorkerCount, setApiDelay]);

  const handleWorkerChange = (value: string) => {
      if (!setWorkerCount) return;
      if (value === '') {
          setWorkerCount(0); 
          return;
      }
      let num = parseInt(value);
      if (isNaN(num)) return;
      if (num > 10) num = 10;
      if (num < 1) num = 1; 
      setWorkerCount(num);
  };

  const handleDelayChange = (value: string) => {
    if (!setApiDelay) return;
    if (value === '') {
        setApiDelay(0); 
        return;
    }
    let num = parseInt(value);
    if (isNaN(num)) return;
    if (num < 1) num = 1; 
    setApiDelay(num);
  };

  const handleAddKeys = () => {
    if (bulkInput.trim()) {
        const newKeys = bulkInput
            .split(/[\n,]+/)
            .map(k => k.trim())
            .filter(k => k.length > 0 && !apiKeys.includes(k));
        
        if (newKeys.length > 0) {
            setApiKeys([...apiKeys, ...newKeys]);
            setBulkInput('');
        }
    }
  };

  const handleDeleteOne = (keyToDelete: string) => setApiKeys(apiKeys.filter(k => k !== keyToDelete));
  const handleClearAll = () => setApiKeys([]);

  const handleLoadTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setBulkInput(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredKeys = useMemo(() => apiKeys.filter(k => k.toLowerCase().includes(searchTerm.toLowerCase())), [apiKeys, searchTerm]);

  const getBaseUrl = () => {
    return "https://generativelanguage.googleapis.com";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* API SETTINGS CARD */}
      <div className={`bg-white p-4 rounded-lg shadow-sm border ${theme.border} transition-colors flex flex-col`}>
        <div className="flex items-center gap-2 mb-4">
          <Key className={`w-4 h-4 ${theme.icon}`} />
          <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide leading-none">API Settings</h2>
        </div>

        <div className={`border-t ${theme.divider} mb-0`}></div>
        
        <div className="flex flex-col gap-0">
          <div className="pt-3 pb-0 mb-[7px]">
              <div className="grid grid-cols-2 gap-3">
                 <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Provider</label>
                    <div className={`${inputClass} flex items-center bg-gray-50 font-bold text-gray-700 border-solid`}>
                      GEMINI API
                    </div>
                 </div>
                 
                 <div className="flex flex-col relative">
                    <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Base URL</label>
                    </div>
                    <input 
                      type="text" 
                      className={inputClass} 
                      value={getBaseUrl()}
                      disabled={true} 
                    />
                 </div>
              </div>
          </div>

          <div className={`border-t ${theme.divider} w-full`}></div>

          <div className="pt-3 pb-0 mb-[7px]">
            <div className="grid grid-cols-2 gap-3">
               <div className="flex flex-col relative">
                  <div className="flex items-center justify-between mb-0.5">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Model Name</div>
                      <div className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Auto Updated</div>
                  </div>
                  <div className={`${inputClass} flex items-center bg-gray-50 font-medium overflow-hidden text-ellipsis whitespace-nowrap`}>
                      {geminiModel}
                  </div>
               </div>

               <div className="flex flex-col">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Workers</label>
                      <input 
                          type="number" 
                          min="1" max="10" 
                          className={`${inputClass} text-center font-bold`}
                          placeholder="Max 10"
                          value={workerCount === 0 ? '' : workerCount}
                          onChange={(e) => handleWorkerChange(e.target.value)}
                          disabled={isProcessing}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Delay (s)</label>
                      <input 
                          type="number" 
                          min="1"
                          className={`${inputClass} text-center font-bold`}
                          placeholder="Min 1"
                          value={apiDelay === 0 ? '' : apiDelay}
                          onChange={(e) => handleDelayChange(e.target.value)}
                          disabled={isProcessing}
                      />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className={`border-t ${theme.divider} mb-3`}></div>

        {/* BAGIAN INPUT & LIST API KEY YANG DIKEMBALIKAN */}
        <div className="flex flex-col animate-in fade-in duration-300">
            <div className="flex items-center justify-between leading-none mb-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Google Gemini API Keys
                </label>
                <button 
                    onClick={() => window.open("https://aistudio.google.com/app/api-keys", '_blank')}
                    className="text-[10px] text-blue-500 hover:text-blue-700 underline font-medium flex items-center gap-1"
                >
                    Get Free Key <ExternalLink size={10} />
                </button>
            </div>
            
            <div className="w-full h-[70px] flex gap-2 p-1">
                <textarea 
                    placeholder="Paste your Gemini API Keys here (one per line)..."
                    className="flex-1 h-full p-2 text-xs font-mono border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-white scrollbar-thin scrollbar-thumb-gray-200"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    disabled={isProcessing}
                />
                <div className="flex flex-col shrink-0">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept=".txt" 
                      className="hidden" 
                      onChange={handleLoadTxt} 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="h-full px-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg flex flex-col items-center justify-center gap-1 text-blue-700 hover:bg-blue-100 transition-all shadow-inner disabled:opacity-50"
                    >
                        <FileText size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Load TXT</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
            <div className={`flex items-center justify-center gap-1 p-2 rounded border ${theme.border} ${theme.countBg}`}>
               <span className="text-[11px] font-bold uppercase opacity-70">Stored:</span>
               <span className="text-sm font-bold leading-none">{apiKeys.length}</span>
            </div>
            <button 
               onClick={handleAddKeys}
               disabled={isProcessing || !bulkInput.trim()}
               className={`flex flex-row items-center justify-center gap-1.5 p-2 rounded shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonPrimary} ${theme.buttonPrimaryText} active:scale-[0.98] border border-blue-700`}
            >
              <Plus size={16} />
              <span className="text-sm font-bold uppercase tracking-wide">Add Keys</span>
            </button>
            <button 
               onClick={handleClearAll} 
               disabled={isProcessing || apiKeys.length === 0}
               className="flex flex-row items-center justify-center gap-1.5 p-2 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span className="text-sm font-bold uppercase tracking-wide">Clear All</span>
            </button>
        </div>

        <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden flex flex-col mt-4 shadow-inner h-[200px] shrink-0">
          <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                  <ListOrdered size={14} className="text-gray-500" />
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Active Key Pool</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="relative">
                      <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                          type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-24 pl-6 pr-2 py-1 text-[10px] border border-gray-300 rounded-full bg-white focus:outline-none focus:border-blue-400"
                      />
                  </div>
              </div>
          </div>
          <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 flex-1">
              {filteredKeys.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-60">
                      <ListOrdered size={24} />
                      <span className="text-[11px] font-medium">No API Keys found. Add some to start.</span>
                  </div>
              ) : (
                  filteredKeys.map((k, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded mb-1 last:mb-0 shadow-sm hover:border-blue-200 transition-colors group">
                          <div className={`w-2 h-2 rounded-full shrink-0 bg-green-500`} title="Ready to use" />
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-50 text-[10px] font-bold text-gray-500 rounded shrink-0 select-none border border-gray-200">{idx + 1}</span>
                          <div className="flex-1 min-w-0 font-mono text-[11px] text-gray-600 truncate px-1 select-all">
                              {k.substring(0, 10) + '...' + k.substring(k.length - 6)}
                          </div>
                          <button onClick={() => handleDeleteOne(k)} disabled={isProcessing} className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><XCircle size={14} /></button>
                      </div>
                  ))
              )}
          </div>
        </div>

      </div>

      {/* TOMBOL KOPI DI BAWAH API KEY */}
      <a 
          href="https://lynk.id/isaproject/0581ez0729vx" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-700 transition-all shadow-sm group"
      >
          <Coffee size={18} className="group-hover:animate-bounce" />
          <span className="text-sm font-bold tracking-wide">Buy me a coffee to support updates!</span>
      </a>

    </div>
  );
};

export default ApiKeyPanel;
