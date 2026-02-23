import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Key, Plus, Trash2, XCircle, ListOrdered, Search, Save, FileText, ExternalLink } from 'lucide-react';
import { AppMode, ApiProvider } from '../types';

interface Props {
  apiKeys: string[];
  setApiKeys: (keys: string[]) => void;
  isProcessing: boolean;
  mode?: AppMode | 'logs'; 
  
  provider?: ApiProvider | 'CUSTOM';
  setProvider?: (provider: ApiProvider | 'CUSTOM') => void;
  
  // Specific model props
  geminiModel?: string;
  setGeminiModel?: (m: string) => void;
  groqModel?: string;
  setGroqModel?: (m: string) => void;
  mistralModel?: string;
  setMistralModel?: (m: string) => void;
  
  // Custom props
  customBaseUrl?: string;
  setCustomBaseUrl?: (url: string) => void;
  customModel?: string;
  setCustomModel?: (m: string) => void;
  
  cooldownKeys?: Map<string, number>;

  // Global Worker Count
  workerCount?: number;
  setWorkerCount?: (count: number) => void;
}

const GEMINI_PRESETS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro' },
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' }
];

const MISTRAL_PRESETS = [
  { value: 'pixtral-large-latest', label: 'Pixtral Large' },
  { value: 'pixtral-12b-2409', label: 'Pixtral 12B' },
  { value: 'mistral-large-latest', label: 'Mistral Large' }
];

const GROQ_PRESETS = [
  { value: 'llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick' },
  { value: 'llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout' }
];

const ApiKeyPanel: React.FC<Props> = ({ 
  apiKeys, 
  setApiKeys, 
  isProcessing, 
  provider = 'GEMINI',
  setProvider,
  geminiModel,
  setGeminiModel,
  groqModel,
  setGroqModel,
  mistralModel,
  setMistralModel,
  customBaseUrl,
  setCustomBaseUrl,
  customModel,
  setCustomModel,
  workerCount,
  setWorkerCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualModel, setIsManualModel] = useState(false);
  const [isManualBaseUrl, setIsManualBaseUrl] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom user models list persistence
  const [userModels, setUserModels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ISA_USER_MODELS');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // Custom user base URLs list persistence
  const [userBaseUrls, setUserBaseUrls] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ISA_USER_BASEURLS');
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
    localStorage.setItem('ISA_USER_MODELS', JSON.stringify(userModels));
  }, [userModels]);

  useEffect(() => {
    localStorage.setItem('ISA_USER_BASEURLS', JSON.stringify(userBaseUrls));
  }, [userBaseUrls]);

  const getCurrentModel = () => {
    switch(provider) {
        case 'GEMINI': return geminiModel;
        case 'MISTRAL': return mistralModel;
        case 'GROQ': return groqModel;
        case 'CUSTOM': return customModel;
        default: return geminiModel;
    }
  };

  const setCurrentModel = (val: string) => {
    switch(provider) {
        case 'GEMINI': setGeminiModel?.(val); break;
        case 'MISTRAL': setMistralModel?.(val); break;
        case 'GROQ': setGroqModel?.(val); break;
        case 'CUSTOM': setCustomModel?.(val); break;
    }
  };

  const currentModelName = getCurrentModel();
  const isCurrentModelCustom = userModels.includes((currentModelName || '').trim());

  const handleToggleCustomModel = () => {
    const name = (currentModelName || '').trim();
    if (!name) return;
    if (isCurrentModelCustom) {
      setUserModels(prev => prev.filter(m => m !== name));
    } else {
      setUserModels(prev => [...prev, name]);
    }
  };

  const currentCustomUrl = (customBaseUrl || '').trim();
  const isCurrentUrlCustomSaved = userBaseUrls.includes(currentCustomUrl);

  const handleToggleCustomUrl = () => {
    if (!currentCustomUrl) return;
    if (isCurrentUrlCustomSaved) {
        setUserBaseUrls(prev => prev.filter(u => u !== currentCustomUrl));
    } else {
        setUserBaseUrls(prev => [...prev, currentCustomUrl]);
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

  const handleWorkerChange = (value: string) => {
      if (!setWorkerCount) return;
      if (value === '') {
          setWorkerCount(0);
          return;
      }
      let num = parseInt(value);
      if (isNaN(num)) return;
      if (num > 10) num = 10;
      if (num < 0) num = 0;
      setWorkerCount(num);
  };

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
    switch(provider) {
        case 'GEMINI': return "https://generativelanguage.googleapis.com";
        case 'MISTRAL': return "https://api.mistral.ai/v1/";
        case 'GROQ': return "https://api.groq.com/openai/v1/";
        default: return "";
    }
  };

  const getConnectLink = () => {
    switch(provider) {
        case 'GEMINI': return "https://aistudio.google.com/app/api-keys";
        case 'MISTRAL': return "https://console.mistral.ai/api-keys";
        case 'GROQ': return "https://console.groq.com/keys";
        default: return "#";
    }
  };

  const getModelPresets = () => {
    switch(provider) {
        case 'GEMINI': return GEMINI_PRESETS;
        case 'MISTRAL': return MISTRAL_PRESETS;
        case 'GROQ': return GROQ_PRESETS;
        case 'CUSTOM': return []; 
        default: return GEMINI_PRESETS;
    }
  };

  return (
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
                    onChange={(e) => setProvider?.(e.target.value as ApiProvider | 'CUSTOM')}
                    disabled={isProcessing}
                  >
                    <option value="GEMINI" className="font-bold text-blue-600">Google Gemini API</option>
                    <option value="MISTRAL">Mistral AI</option>
                    <option value="GROQ">Groq Cloud</option>
                    <option value="CUSTOM">Custom Provider</option>
                  </select>
               </div>
               
               {/* KOLOM BASE URL DENGAN LOGIKA CUSTOM */}
               <div className="flex flex-col relative">
                  <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Base URL</label>
                      {provider === 'CUSTOM' && (
                          <button 
                          onClick={() => setIsManualBaseUrl(!isManualBaseUrl)} 
                          className="text-[10px] text-blue-500 hover:text-blue-700 underline font-medium"
                          >
                          {isManualBaseUrl ? 'List' : 'Manual'}
                          </button>
                      )}
                  </div>
                  
                  {provider === 'CUSTOM' ? (
                      isManualBaseUrl ? (
                          <div className="relative">
                              <input 
                                  type="text" 
                                  className={`${inputClass} pr-8`} 
                                  placeholder="https://your-api..." 
                                  value={customBaseUrl || ''} 
                                  onChange={(e) => setCustomBaseUrl?.(e.target.value)} 
                                  disabled={isProcessing} 
                              />
                              <button 
                                  onClick={handleToggleCustomUrl}
                                  title={isCurrentUrlCustomSaved ? "Delete from list" : "Save to list"}
                                  className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${isCurrentUrlCustomSaved ? 'text-red-500 hover:text-red-700' : 'text-blue-500 hover:text-blue-700'}`}
                              >
                                  {isCurrentUrlCustomSaved ? <Trash2 size={14} /> : <Save size={14} />}
                              </button>
                          </div>
                      ) : (
                          <select 
                              className={inputClass}
                              value={customBaseUrl || ''}
                              onChange={(e) => setCustomBaseUrl?.(e.target.value)}
                              disabled={isProcessing}
                          >
                              <option value="">-- Select Saved URL --</option>
                              {userBaseUrls.map(url => (
                                  <option key={url} value={url}>{url}</option>
                              ))}
                          </select>
                      )
                  ) : (
                      <input 
                        type="text" 
                        className={inputClass} 
                        value={getBaseUrl()}
                        disabled={true} 
                      />
                  )}
               </div>
            </div>
        </div>

        <div className={`border-t ${theme.divider} w-full`}></div>

        <div className="pt-3 pb-0 mb-[7px]">
          <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col relative">
                <div className="flex items-center justify-between mb-0.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Model Name</div>
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
                          placeholder="e.g. gemini-2.5-pro" 
                          value={currentModelName} 
                          onChange={(e) => setCurrentModel(e.target.value)} 
                          disabled={isProcessing} 
                      />
                      <button 
                        onClick={handleToggleCustomModel}
                        title={isCurrentModelCustom ? "Delete from list" : "Save to list"}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${isCurrentModelCustom ? 'text-red-500 hover:text-red-700' : 'text-blue-500 hover:text-blue-700'}`}
                      >
                        {isCurrentModelCustom ? <Trash2 size={14} /> : <Save size={14} />}
                      </button>
                    </div>
                ) : (
                    <select 
                        className={inputClass}
                        value={currentModelName}
                        onChange={(e) => setCurrentModel(e.target.value)}
                        disabled={isProcessing}
                    >
                        {getModelPresets().length > 0 && (
                            <optgroup label="System Models">
                              {getModelPresets().map(m => (
                                  <option key={m.value} value={m.value}>
                                      {m.label}
                                  </option>
                              ))}
                            </optgroup>
                        )}
                        {userModels.length > 0 && (
                          <optgroup label="Custom Models">
                            {userModels.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </optgroup>
                        )}
                    </select>
                )}
             </div>

             <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Workers</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
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
                    {/* Tombol Link Connect - Hanya disabled jika CUSTOM provider dipilih karena tidak ada link spesifik */}
                    <button 
                        onClick={() => window.open(getConnectLink(), '_blank')}
                        disabled={isProcessing || provider === 'CUSTOM'}
                        className={`h-8 w-8 flex items-center justify-center rounded border transition-all shrink-0 shadow-sm ${provider === 'CUSTOM' ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                        title="Get API Key / Connect"
                    >
                        <ExternalLink size={14} />
                    </button>
                </div>
             </div>
          </div>
        </div>

        <div className={`border-t ${theme.divider} w-full`}></div>
      </div>

      <div className={`border-t ${theme.divider} mb-2`}></div>

      {/* TINGGI TEXTAREA DITAMBAH MENJADI h-[76px] */}
      <div className="mt-1 h-[76px] flex flex-col overflow-hidden">
        <div className="flex flex-col animate-in fade-in duration-300 h-full">
            <div className="flex items-center justify-between leading-none mb-[4px]">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {provider} API Keys
                </label>
            </div>
            
            <div className="w-full flex-1 flex gap-2 p-1">
                <textarea 
                    placeholder="Keys (one per line)..."
                    className="flex-1 h-full p-2 text-[10px] font-mono border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-white scrollbar-thin scrollbar-thumb-gray-200"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                />
                <div className="flex flex-col shrink-0 h-full">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept=".txt" 
                      className="hidden" 
                      onChange={handleLoadTxt} 
                    />
                    {/* TINGGI TOMBOL MENGIKUTI CONTAINER (h-full) DENGAN URUTAN TEKS BARU */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="w-[60px] h-full border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg flex flex-col items-center justify-center gap-0.5 text-blue-700 hover:bg-blue-100 transition-all shadow-inner"
                    >
                        <FileText size={18} className="mb-0.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Load</span>
                        <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">TXT</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-2">
          <div className={`flex items-center justify-center gap-1 h-8 px-2 rounded border ${theme.border} ${theme.countBg}`}>
             <span className="text-[11px] font-bold uppercase opacity-70">Slots:</span>
             <span className="text-xs font-bold leading-none">{apiKeys.length}</span>
          </div>
          <button 
             onClick={handleAddKeys}
             disabled={isProcessing || (!bulkInput.trim())}
             className={`flex flex-row items-center justify-center gap-1.5 h-8 px-2 rounded shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonPrimary} ${theme.buttonPrimaryText} active:scale-[0.98] border border-blue-700`}
          >
            <Plus size={14} />
            <span className="text-xs font-bold uppercase tracking-wide">Add Key</span>
          </button>
          <button 
             onClick={handleClearAll} 
             disabled={isProcessing || apiKeys.length === 0}
             className="flex flex-row items-center justify-center gap-1.5 h-8 px-2 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm"
          >
            <Trash2 size={14} />
            <span className="text-xs font-bold uppercase tracking-wide">Clear All</span>
          </button>
      </div>

      <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden flex flex-col mt-4 shadow-inner h-[280px] shrink-0">
        <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
                <ListOrdered size={14} className="text-gray-500" />
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Worker Capacity Slots</span>
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
                    <span className="text-[11px] font-medium">No active slots found.</span>
                </div>
            ) : (
                filteredKeys.map((k, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded mb-1 last:mb-0 shadow-sm hover:border-blue-200 transition-colors group">
                        <div className={`w-2 h-2 rounded-full shrink-0 bg-green-500`} />
                        <span className="w-6 h-6 flex items-center justify-center bg-gray-50 text-[10px] font-bold text-gray-500 rounded shrink-0 select-none border border-gray-200">{idx + 1}</span>
                        <div className="flex-1 min-w-0 font-mono text-[11px] text-gray-600 truncate px-1 select-all">
                            {k.length > 50 ? k.substring(0, 15) + '...' + k.substring(k.length - 8) : k}
                        </div>
                        <button onClick={() => handleDeleteOne(k)} disabled={isProcessing} className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><XCircle size={14} /></button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPanel;
