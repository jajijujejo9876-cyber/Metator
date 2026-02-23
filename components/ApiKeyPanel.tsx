import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Key, Plus, Trash2, XCircle, ListOrdered, Search, LogIn, ShieldCheck, Save, FileText, ExternalLink } from 'lucide-react';
import { AppMode, ApiProvider } from '../types';

interface Props {
  apiKeys: string[];
  setApiKeys: (keys: string[]) => void;
  isProcessing: boolean;
  mode?: AppMode | 'logs'; 
  
  provider?: ApiProvider;
  setProvider?: (provider: ApiProvider) => void;
  
  // Specific model props
  geminiModel?: string;
  setGeminiModel?: (m: string) => void;
  
  cooldownKeys?: Map<string, number>;

  // Global Worker Count
  workerCount?: number;
  setWorkerCount?: (count: number) => void;
}

const GEMINI_PRESETS = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
];

const ApiKeyPanel: React.FC<Props> = ({ 
  apiKeys, 
  setApiKeys, 
  isProcessing, 
  // 1. DEFAULT DIUBAH MENJADI GOOGLE
  provider = 'GOOGLE', 
  setProvider,
  geminiModel,
  setGeminiModel,
  workerCount,
  setWorkerCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualModel, setIsManualModel] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom user models list persistence
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
    localStorage.setItem('ISA_USER_MODELS', JSON.stringify(userModels));
  }, [userModels]);

  const getCurrentModel = () => {
    return geminiModel;
  };

  const setCurrentModel = (val: string) => {
    setGeminiModel?.(val);
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

  // FUNGSI UTAMA LOGIN GOOGLE (Multi-Account Supported)
  const handleGoogleLogin = () => {
    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: '151782765319-5klk78b5lqrcnaaqqu7k0mqiqhbmonf1.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/generative-language.retriever',
        callback: (response: any) => {
          if (response.access_token) {
            // Memasukkan Token langsung ke dalam antrean Slots
            setApiKeys([...apiKeys, response.access_token]);
          }
        },
      });
      // Memaksa muncul popup pilih akun agar bisa Multi-Email
      client.requestAccessToken({ prompt: 'select_account' }); 
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Script Google belum siap. Pastikan sudah ada di index.html");
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
    return "https://proxy-gemini-anda.vercel.app/";
  };

  const getConnectLink = () => {
    if (provider === 'GOOGLE') {
        return "https://console.cloud.google.com/apis/credentials";
    }
    return "https://aistudio.google.com/app/api-keys";
  };

  const getModelPresets = () => {
    return GEMINI_PRESETS;
  };

  const addActionLabel = provider === 'GOOGLE' ? 'Add Slot' : 'Add Key';

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
                    onChange={(e) => setProvider?.(e.target.value as ApiProvider)}
                    disabled={isProcessing}
                  >
                    <option value="GOOGLE" className="font-bold text-blue-600">Login Google (OAuth)</option>
                    <option value="GEMINI">Google Gemini API</option>
                  </select>
               </div>
               <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Base URL</label>
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
                        <optgroup label="System Models">
                          {getModelPresets().map(m => (
                              <option key={m.value} value={m.value}>
                                  {m.label}
                              </option>
                          ))}
                        </optgroup>
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
                    {/* Tombol Link Connect - Tetap h-8 menyesuaikan tinggi input worker */}
                    <button 
                        onClick={() => window.open(getConnectLink(), '_blank')}
                        disabled={isProcessing || provider === 'GOOGLE'}
                        className={`h-8 w-8 flex items-center justify-center rounded border transition-all shrink-0 shadow-sm ${
                            provider === 'GOOGLE'
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
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

      {/* Container h-[76px] untuk konsistensi layout */}
      <div className="mt-1 h-[76px] flex flex-col overflow-hidden">
          {provider === 'GOOGLE' ? (
            <div className="flex flex-col animate-in fade-in duration-300">
                <div className="flex items-center justify-between leading-none mb-[4px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Google Authentication
                    </label>
                </div>
                <div className="w-full h-[60px] flex items-center justify-center rounded-md bg-white p-1">
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={isProcessing}
                        className="w-full h-full py-1.5 border-2 border-dashed rounded-lg text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-inner"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#4A90E2" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/></svg>
                        <span>Sign In with Google</span>
                    </button>
                </div>
            </div>
          ) : (
            <div className="flex flex-col animate-in fade-in duration-300">
                <div className="flex items-center justify-between leading-none mb-[4px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {provider} API Keys
                    </label>
                </div>
                
                <div className="w-full h-[60px] flex gap-2 p-1">
                    <textarea 
                        placeholder="Keys (one per line)..."
                        className="flex-1 h-full p-2 text-[10px] font-mono border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-white scrollbar-thin scrollbar-thumb-gray-200"
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                    />
                    <div className="flex flex-col shrink-0">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          accept=".txt" 
                          className="hidden" 
                          onChange={handleLoadTxt} 
                        />
                        {/* 2. TOMBOL LOAD DIBUAT BUJUR SANGKAR: w-[60px] h-[60px] agar pas dengan kontainernya */}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing}
                            className="w-[60px] h-[60px] border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg flex flex-col items-center justify-center gap-1 text-blue-700 hover:bg-blue-100 transition-all shadow-inner"
                        >
                            <FileText size={18} />
                            <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Load</span>
                        </button>
                    </div>
                </div>
            </div>
          )}
      </div>
      
      {/* 3. TINGGI BARIS INI DISAMAKAN DENGAN TINGGI INPUT (h-8) */}
      <div className="grid grid-cols-3 gap-2 mt-2">
          <div className={`flex items-center justify-center gap-1 h-8 px-2 rounded border ${theme.border} ${theme.countBg}`}>
             <span className="text-[11px] font-bold uppercase opacity-70">Slots:</span>
             <span className="text-xs font-bold leading-none">{apiKeys.length}</span>
          </div>
          <button 
             onClick={handleAddKeys}
             disabled={isProcessing || provider === 'GOOGLE' || (!bulkInput.trim())}
             className={`flex flex-row items-center justify-center gap-1.5 h-8 px-2 rounded shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonPrimary} ${theme.buttonPrimaryText} active:scale-[0.98] border border-blue-700`}
          >
            <Plus size={14} />
            <span className="text-xs font-bold uppercase tracking-wide">{addActionLabel}</span>
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
                            {/* Memotong token akses Google yang sangat panjang agar rapi di layar */}
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
