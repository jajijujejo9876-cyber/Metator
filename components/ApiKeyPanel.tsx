import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Key, Plus, Trash2, XCircle, ListOrdered, Search, Save, FileText, ExternalLink } from 'lucide-react';
import { AppMode, ApiProvider } from '../types';

interface Props {
  apiKeys?: string[];
  setApiKeys?: (keys: string[]) => void;
  isProcessing: boolean;
  mode?: AppMode | 'logs'; 
  
  provider?: string; 
  setProvider?: (provider: string) => void;
  
  geminiModel?: string;
  setGeminiModel?: (m: string) => void;
  
  workerCount?: number;
  setWorkerCount?: (count: number) => void;

  apiDelay?: number;
  setApiDelay?: (delay: number) => void;
}

const API_PRESETS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-3.1-flash', label: 'Gemini 3.1 Flash' },
  { value: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro' },
];

const GROQ_PRESETS = [
  { value: 'moonshotai/kimi-k2-instruct-0905', label: 'Kimi K2 0905 (Idea & Prompt)' },
  { value: 'qwen/qwen3-32b', label: 'Qwen3-32B (Idea & Prompt)' },
  { value: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B (Metadata)' },
];

const CANVAS_PRESETS = [
  { value: 'auto', label: 'Auto Detect (Internal Canvas)' },
];

const ApiKeyPanel: React.FC<Props> = ({ 
  apiKeys = [], 
  setApiKeys = () => {}, 
  isProcessing, 
  provider = 'GEMINI CANVAS',
  setProvider,
  geminiModel = 'auto',
  setGeminiModel,
  workerCount,
  setWorkerCount,
  apiDelay,
  setApiDelay,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [isManualModel, setIsManualModel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userModels, setUserModels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ISA_USER_MODELS');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

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
    if (workerCount === undefined && setWorkerCount) setWorkerCount(5);
    if (apiDelay === undefined && setApiDelay) setApiDelay(3);
  }, [workerCount, apiDelay, setWorkerCount, setApiDelay]);

  useEffect(() => {
    localStorage.setItem('ISA_USER_MODELS', JSON.stringify(userModels));
  }, [userModels]);

  // AUTO-SWITCH MODEL SAAT GANTI PROVIDER
  useEffect(() => {
    if (setGeminiModel) {
        if (provider === 'GROQ API') {
            if (!GROQ_PRESETS.find(p => p.value === geminiModel) && !userModels.includes(geminiModel || '')) {
                setGeminiModel('qwen/qwen3-32b');
            }
        } else if (provider === 'GEMINI API') {
            if (!API_PRESETS.find(p => p.value === geminiModel) && !userModels.includes(geminiModel || '')) {
                setGeminiModel('gemini-2.5-flash');
            }
        } else {
            setGeminiModel('auto');
        }
    }
  }, [provider]);

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

  const isCurrentModelCustom = userModels.includes((geminiModel || '').trim());

  const handleToggleCustomModel = () => {
    const name = (geminiModel || '').trim();
    if (!name || name === 'auto') return;
    if (isCurrentModelCustom) {
      setUserModels(prev => prev.filter(m => m !== name));
    } else {
      setUserModels(prev => [...prev, name]);
    }
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

  // DYNAMIC URL & LABELS
  const getBaseUrl = () => {
    if (provider === 'GEMINI CANVAS') return "https://gemini.google.com/api/canvas";
    if (provider === 'GROQ API') return "https://api.groq.com/openai/v1/chat/completions";
    return "https://generativelanguage.googleapis.com";
  };

  const isCanvasMode = provider === 'GEMINI CANVAS';
  const apiName = provider === 'GROQ API' ? 'Groq' : 'Google Gemini';
  const apiKeyLink = provider === 'GROQ API' ? 'https://console.groq.com/keys' : 'https://aistudio.google.com/app/api-keys';

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
                    <select 
                      className={inputClass}
                      value={provider}
                      onChange={(e) => setProvider && setProvider(e.target.value)}
                      disabled={isProcessing}
                    >
                      <option value="GEMINI CANVAS">Gemini Canvas</option>
                      <option value="GEMINI API">Gemini API</option>
                      <option value="GROQ API">Groq API</option>
                    </select>
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
                      
                      {/* TAMPILAN TOGGLE LIST/MANUAL UNTUK KEDUA MODE */}
                      <button 
                          onClick={() => setIsManualModel(!isManualModel)} 
                          className="text-[10px] text-blue-500 hover:text-blue-700 underline font-medium"
                      >
                          {isManualModel ? 'List' : 'Manual'}
                      </button>
                  </div>
                  
                  {isManualModel ? (
                      <div className="relative">
                        <input 
                            type="text" 
                            className={`${inputClass} pr-8`} 
                            placeholder={provider === 'GROQ API' ? "e.g. qwen/qwen3-32b" : "e.g. gemini-2.5-pro"} 
                            value={geminiModel} 
                            onChange={(e) => setGeminiModel && setGeminiModel(e.target.value)} 
                            disabled={isProcessing} 
                        />
                        <button 
                            onClick={handleToggleCustomModel}
                            title={isCurrentModelCustom ? "Delete from Custom list" : "Save to Custom list"}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${isCurrentModelCustom ? 'text-red-500 hover:text-red-700' : 'text-blue-500 hover:text-blue-700'}`}
                        >
                            {isCurrentModelCustom ? <Trash2 size={14} /> : <Save size={14} />}
                        </button>
                      </div>
                  ) : (
                      <select 
                          className={inputClass}
                          value={geminiModel}
                          onChange={(e) => setGeminiModel && setGeminiModel(e.target.value)}
                          disabled={isProcessing}
                      >
                          <optgroup label="System Models">
                            {isCanvasMode ? (
                                CANVAS_PRESETS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))
                            ) : provider === 'GROQ API' ? (
                                GROQ_PRESETS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))
                            ) : (
                                API_PRESETS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))
                            )}
                          </optgroup>
                          {userModels.length > 0 && (
                            <optgroup label="Custom Saved Models">
                              {userModels.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </optgroup>
                          )}
                      </select>
                  )}
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

        {/* BAGIAN INPUT KOTAK API KEY */}
        <div className={`flex flex-col transition-all duration-300`}>
            <div className="flex items-center justify-between leading-none mb-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {apiName} API Keys
                </label>
                <button 
                    onClick={() => window.open(apiKeyLink, '_blank')}
                    className={`text-[10px] underline font-medium flex items-center gap-1 ${isCanvasMode ? 'text-gray-400 pointer-events-none' : 'text-blue-500 hover:text-blue-700'}`}
                    disabled={isCanvasMode}
                >
                    Get Api Key <ExternalLink size={10} />
                </button>
            </div>
            
            <div className="w-full h-[70px] flex gap-2 p-1">
                <textarea 
                    placeholder={isCanvasMode ? "Using Internal Canvas Routing. Input disabled." : `Paste your ${apiName} API Keys here (one per line)...`}
                    className="flex-1 h-full p-2 text-xs font-mono border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-white scrollbar-thin scrollbar-thumb-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    disabled={isProcessing || isCanvasMode}
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
                        disabled={isProcessing || isCanvasMode}
                        className="h-full px-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg flex flex-col items-center justify-center gap-1 text-blue-700 hover:bg-blue-100 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400"
                    >
                        <FileText size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Load TXT</span>
                    </button>
                </div>
            </div>
        </div>

        {/* TOMBOL ADD & CLEAR (TINGGI H-8 & FONT TEXT-XS) */}
        <div className="grid grid-cols-3 gap-2 mt-2">
            <div className={`flex items-center justify-center gap-1 h-8 rounded border ${isCanvasMode ? 'bg-gray-50 border-gray-200 text-gray-400' : theme.border + ' ' + theme.countBg}`}>
               <span className="text-xs font-bold uppercase opacity-70">Keys:</span>
               <span className="text-xs font-bold leading-none">{apiKeys.length}</span>
            </div>
            <button 
               onClick={handleAddKeys}
               disabled={isProcessing || isCanvasMode || !bulkInput.trim()}
               className={`flex flex-row items-center justify-center gap-1.5 h-8 rounded shadow-sm transition-all active:scale-[0.98] border border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:border-gray-400 disabled:text-gray-500 ${theme.buttonPrimary} ${theme.buttonPrimaryText}`}
            >
              <Plus size={14} />
              <span className="text-xs font-bold uppercase tracking-wide">Add Keys</span>
            </button>
            <button 
               onClick={handleClearAll} 
               disabled={isProcessing || isCanvasMode || apiKeys.length === 0}
               className="flex flex-row items-center justify-center gap-1.5 h-8 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
            >
              <Trash2 size={14} />
              <span className="text-xs font-bold uppercase tracking-wide">Clear All</span>
            </button>
        </div>

        {/* KOTAK DAFTAR API KEY */}
        <div className={`border border-gray-200 rounded-lg bg-gray-50 overflow-hidden flex flex-col mt-4 shadow-inner h-[300px] min-h-[300px] max-h-[300px] shrink-0 transition-opacity ${isCanvasMode ? 'opacity-60 grayscale-[30%]' : ''}`}>
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
                          disabled={isCanvasMode}
                          className="w-24 pl-6 pr-2 py-1 text-[10px] border border-gray-300 rounded-full bg-white focus:outline-none focus:border-blue-400 disabled:bg-gray-100"
                      />
                  </div>
              </div>
          </div>
          
          <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 flex-1">
              {filteredKeys.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-60">
                      <ListOrdered size={24} />
                      <span className="text-[11px] font-medium">No {apiName} Keys found. Add some to start.</span>
                  </div>
              ) : (
                  <div className="flex flex-col">
                      {filteredKeys.map((k, idx) => (
                          <div key={idx} className={`flex items-center gap-2 p-2 bg-white border border-gray-100 rounded mb-1 last:mb-0 shadow-sm transition-colors group ${isCanvasMode ? '' : 'hover:border-blue-200'}`}>
                              <div className={`w-2 h-2 rounded-full shrink-0 ${isCanvasMode ? 'bg-gray-400' : 'bg-green-500'}`} title="Ready to use" />
                              <span className="w-6 h-6 flex items-center justify-center bg-gray-50 text-[10px] font-bold text-gray-500 rounded shrink-0 select-none border border-gray-200">{idx + 1}</span>
                              <div className="flex-1 min-w-0 font-mono text-[11px] text-gray-600 truncate px-1 select-all">
                                  {k.substring(0, 8) + '...' + k.substring(k.length - 4)}
                              </div>
                              <button 
                                  onClick={() => handleDeleteOne(k)} 
                                  disabled={isProcessing || isCanvasMode} 
                                  className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:hover:bg-transparent disabled:hover:text-gray-300"
                              >
                                  <XCircle size={14} />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApiKeyPanel;
