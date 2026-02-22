import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Key, Plus, Trash2, XCircle, ListOrdered, Search, LogIn, ShieldCheck, Save, FileText, ExternalLink } from 'lucide-react';
import { AppMode, ApiProvider } from '../types';
import { PUTER_MODELS } from '../constants';

interface Props {
  apiKeys: string[];
  setApiKeys: (keys: string[]) => void;
  isProcessing: boolean;
  mode?: AppMode | 'logs'; 
  
  provider?: ApiProvider | 'GOOGLE'; 
  setProvider?: (provider: ApiProvider | 'GOOGLE') => void;
  
  // SEMUA PROPS ASLI DIKEMBALIKAN (JANGAN DIHAPUS)
  geminiModel?: string;
  setGeminiModel?: (m: string) => void;
  groqModel?: string;
  setGroqModel?: (m: string) => void;
  puterModel?: string;
  setPuterModel?: (m: string) => void;
  mistralBaseUrl?: string;
  setMistralBaseUrl?: (url: string) => void;
  mistralModel?: string;
  setMistralModel?: (m: string) => void;
  customBaseUrl?: string;
  setCustomBaseUrl?: (url: string) => void;
  customModel?: string;
  setCustomModel?: (model: string) => void;
  
  cooldownKeys?: Map<string, number>;

  // Global Worker Count
  workerCount?: number;
  setWorkerCount?: (count: number) => void;
}

const MISTRAL_PRESETS = [
  { value: 'pixtral-large-latest', label: 'Pixtral Large' },
  { value: 'pixtral-12b-2409', label: 'Pixtral 12B' },
  { value: 'mistral-large-latest', label: 'Mistral Large' }
];

const GROQ_PRESETS = [
  { value: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick' },
  { value: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout' }
];

const GEMINI_PRESETS = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
];

const ApiKeyPanel: React.FC<Props> = ({ 
  apiKeys, 
  setApiKeys, 
  isProcessing, 
  // @ts-ignore
  provider = 'GOOGLE', 
  setProvider,
  geminiModel,
  setGeminiModel,
  puterModel,
  setPuterModel,
  groqModel,
  setGroqModel,
  mistralBaseUrl,
  setMistralBaseUrl,
  mistralModel,
  setMistralModel,
  customBaseUrl,
  setCustomBaseUrl,
  customModel,
  setCustomModel,
  cooldownKeys,
  workerCount,
  setWorkerCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPuterAuthenticated, setIsPuterAuthenticated] = useState(false);
  const [isManualModel, setIsManualModel] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userModels, setUserModels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ISA_USER_MODELS');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // STYLE REFORNAM TRANSLATION
  const styles = {
    card: "bg-white p-6 rounded-xl border-2 border-gray-300 shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col font-['Share_Tech']",
    input: "w-full h-[36px] text-[14px] px-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-['Share_Tech'] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all disabled:bg-gray-50",
    label: "text-[13px] font-bold text-blue-600 uppercase tracking-widest mb-1 block font-['Share_Tech']",
    btnBase: "flex items-center justify-center border-none font-['Share_Tech'] font-bold uppercase tracking-wider rounded-lg transition-all active:translate-y-[2px] disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none",
    shadow3D: "shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_rgba(0,0,0,0.2)]"
  };

  useEffect(() => {
    const checkPuterAuth = async () => {
      const puter = (window as any).puter;
      if (puter) {
        const isSignedIn = await puter.auth.isSignedIn();
        setIsPuterAuthenticated(isSignedIn);
      }
    };
    checkPuterAuth();
    const interval = setInterval(checkPuterAuth, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('ISA_USER_MODELS', JSON.stringify(userModels));
  }, [userModels]);

  const getCurrentModel = () => {
    switch(provider) {
        case 'GOOGLE':
        case 'GEMINI': return geminiModel;
        case 'MISTRAL': return mistralModel;
        case 'GROQ': return groqModel;
        case 'PUTER': return puterModel;
        // @ts-ignore
        case 'CUSTOM': return customModel;
        default: return '';
    }
  };

  const setCurrentModel = (val: string) => {
    switch(provider) {
        case 'GOOGLE':
        case 'GEMINI': setGeminiModel?.(val); break;
        case 'MISTRAL': setMistralModel?.(val); break;
        case 'GROQ': setGroqModel?.(val); break;
        case 'PUTER': setPuterModel?.(val); break;
        // @ts-ignore
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

  const handleGoogleLogin = () => {
    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: 'PASTE_CLIENT_ID_ANDA_DISINI.apps.googleusercontent.com', 
        scope: 'https://www.googleapis.com/auth/generative-language.retriever',
        callback: (response: any) => {
          if (response.access_token) {
            setApiKeys([...apiKeys, response.access_token]);
          }
        },
      });
      client.requestAccessToken({ prompt: 'select_account' }); 
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Script Google belum siap. Pastikan sudah ada di index.html");
    }
  };

  const handleAddKeys = () => {
    if (provider === 'PUTER') {
        if (!isPuterAuthenticated) return;
        setApiKeys([...apiKeys, `Slot_${apiKeys.length + 1}`]);
        return;
    }
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
      if (value === '') { setWorkerCount(0); return; }
      let num = parseInt(value);
      if (isNaN(num)) return;
      if (num > 10) num = 10;
      if (num < 0) num = 0;
      setWorkerCount(num);
  };

  const handlePuterLogin = async () => {
    const puter = (window as any).puter;
    if (!puter) return;
    try {
      await puter.auth.signIn();
      const isSignedIn = await puter.auth.isSignedIn();
      setIsPuterAuthenticated(isSignedIn);
    } catch (e) { console.error("Puter login failed", e); }
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
        case 'GOOGLE':
        case 'GEMINI': return "https://generativelanguage.googleapis.com";
        case 'MISTRAL': return mistralBaseUrl || "https://api.mistral.ai";
        case 'GROQ': return "https://api.groq.com/openai/v1/chat/completions";
        case 'PUTER': return "js.puter.com/v2/";
        // @ts-ignore
        case 'CUSTOM': return customBaseUrl || "";
        default: return "";
    }
  };

  const getConnectLink = () => {
    switch(provider) {
        case 'GOOGLE': return "https://console.cloud.google.com/apis/credentials";
        case 'GEMINI': return "https://aistudio.google.com/app/api-keys";
        case 'MISTRAL': return "https://console.mistral.ai/api-keys";
        case 'GROQ': return "https://console.groq.com/keys";
        case 'PUTER': return "https://puter.com";
        default: return "#";
    }
  };

  const getModelPresets = () => {
    switch(provider) {
        case 'GOOGLE':
        case 'GEMINI': return GEMINI_PRESETS;
        case 'MISTRAL': return MISTRAL_PRESETS;
        case 'GROQ': return GROQ_PRESETS;
        case 'PUTER': return PUTER_MODELS.filter(m => m.group === 'MULTI');
        default: return [];
    }
  };

  const addActionLabel = (provider === 'PUTER' || provider === 'GOOGLE') ? 'Add Slot' : 'Add Key';

  return (
    <div className={styles.card}>
      <div className="flex items-center gap-2 mb-4 border-b-2 border-blue-600 pb-2 w-fit">
        <Key className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-blue-600 uppercase tracking-[0.2em] leading-none">API Settings</h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* ROW 1: PROVIDER & BASE URL */}
        <div className="grid grid-cols-2 gap-4">
           <div className="flex flex-col">
              <label className={styles.label}>Provider</label>
              <select 
                className={styles.input} 
                value={provider} 
                // @ts-ignore
                onChange={(e) => setProvider?.(e.target.value)} 
                disabled={isProcessing}
              >
                <option value="GOOGLE" className="font-bold text-blue-600">Login Google (OAuth)</option>
                <option value="GEMINI">Google Gemini API</option>
                <option value="MISTRAL">Mistral AI</option>
                <option value="GROQ">Groq Cloud</option>
                <option value="PUTER">Puter.js</option>
                <option value="CUSTOM">Custom Provider</option>
              </select>
           </div>
           <div className="flex flex-col">
              <label className={styles.label}>Base URL</label>
              {provider === 'MISTRAL' || provider === 'CUSTOM' ? (
                <input 
                  type="text" 
                  className={styles.input} 
                  value={getBaseUrl()} 
                  onChange={(e) => provider === 'MISTRAL' ? setMistralBaseUrl?.(e.target.value) : setCustomBaseUrl?.(e.target.value)}
                  placeholder="https://api..."
                />
              ) : (
                <input type="text" className={`${styles.input} bg-gray-50 text-gray-400`} value={getBaseUrl()} disabled />
              )}
           </div>
        </div>

        {/* ROW 2: MODEL NAME & WORKERS */}
        <div className="grid grid-cols-2 gap-4">
           <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                  <label className={styles.label}>Model Name</label>
                  <button onClick={() => setIsManualModel(!isManualModel)} className="text-[11px] text-blue-500 underline font-bold tracking-tighter">
                    {isManualModel ? 'LIST' : 'MANUAL'}
                  </button>
              </div>
              {isManualModel ? (
                  <div className="relative">
                    <input type="text" className={`${styles.input} pr-10`} placeholder="e.g. gpt-4o" value={currentModelName} onChange={(e) => setCurrentModel(e.target.value)} disabled={isProcessing} />
                    <button onClick={handleToggleCustomModel} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isCurrentModelCustom ? 'text-red-500' : 'text-blue-500'}`}>
                      {isCurrentModelCustom ? <Trash2 size={16} /> : <Save size={16} />}
                    </button>
                  </div>
              ) : (
                  <select className={styles.input} value={currentModelName} onChange={(e) => setCurrentModel(e.target.value)} disabled={isProcessing}>
                      <optgroup label="System Models">
                        {getModelPresets().map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                      </optgroup>
                      {userModels.length > 0 && (
                        <optgroup label="Custom Models">
                          {userModels.map(m => (<option key={m} value={m}>{m}</option>))}
                        </optgroup>
                      )}
                  </select>
              )}
           </div>

           <div className="flex flex-col">
              <label className={styles.label}>Workers</label>
              <div className="flex gap-2">
                  <input type="number" min="1" max="10" className={`${styles.input} text-center font-bold flex-1`} value={workerCount === 0 ? '' : workerCount} onChange={(e) => handleWorkerChange(e.target.value)} disabled={isProcessing} />
                  <button onClick={() => window.open(getConnectLink(), '_blank')} disabled={isProcessing || provider === 'GOOGLE'} className={`${styles.btnBase} ${styles.shadow3D} w-[36px] h-[36px] bg-blue-50 text-blue-600 border-2 border-blue-600`}>
                      <ExternalLink size={18} />
                  </button>
              </div>
           </div>
        </div>

        <div className="border-t-2 border-gray-100 my-1"></div>

        {/* DYNAMIC AUTH AREA (H-64) */}
        <div className="h-[64px] flex flex-col justify-end">
          {provider === 'GOOGLE' ? (
              <button onClick={handleGoogleLogin} disabled={isProcessing} className={`${styles.btnBase} ${styles.shadow3D} w-full h-[40px] bg-white border-2 border-gray-300 text-gray-700 gap-3`}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#4A90E2" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/></svg>
                  <span className="tracking-widest">SIGN IN WITH GOOGLE</span>
              </button>
          ) : provider === 'PUTER' ? (
              <button onClick={handlePuterLogin} disabled={isProcessing} className={`${styles.btnBase} ${styles.shadow3D} w-full h-[40px] border-2 ${isPuterAuthenticated ? 'bg-green-50 border-green-500 text-green-700' : 'bg-blue-50 border-blue-500 text-blue-700'}`}>
                  {isPuterAuthenticated ? <ShieldCheck className="mr-2" size={20}/> : <LogIn className="mr-2" size={20}/>}
                  <span className="tracking-widest">{isPuterAuthenticated ? 'PUTER ACTIVE' : 'LOGIN PUTER'}</span>
              </button>
          ) : (
            <div className="flex gap-2">
                <textarea placeholder="Keys (one per line)..." className={`${styles.input} h-[44px] py-2 resize-none font-mono text-[11px] border-2`} value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} />
                <input type="file" ref={fileInputRef} accept=".txt" className="hidden" onChange={handleLoadTxt} />
                <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className={`${styles.btnBase} ${styles.shadow3D} w-[44px] h-[44px] bg-blue-50 border-2 border-blue-600 text-blue-600 flex-col gap-0`}>
                    <FileText size={18} />
                    <span className="text-[8px] font-black leading-none">LOAD</span>
                </button>
            </div>
          )}
        </div>

        {/* ACTION ROW */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`${styles.btnBase} h-[38px] border-2 border-blue-200 bg-blue-50 text-blue-800 text-[14px] cursor-default shadow-none active:translate-y-0`}>
             SLOTS: {apiKeys.length}
          </div>
          <button onClick={handleAddKeys} disabled={isProcessing || provider === 'GOOGLE' || (provider === 'PUTER' && !isPuterAuthenticated) || (provider !== 'PUTER' && provider !== 'GOOGLE' && !bulkInput.trim())} className={`${styles.btnBase} ${styles.shadow3D} h-[38px] bg-blue-600 text-white border-2 border-blue-800`}>
            <Plus size={18} className="mr-1" /> {addActionLabel}
          </button>
          <button onClick={handleClearAll} disabled={isProcessing || apiKeys.length === 0} className={`${styles.btnBase} ${styles.shadow3D} h-[38px] bg-red-500 text-white border-2 border-red-700`}>
            <Trash2 size={18} className="mr-1" /> CLEAR
          </button>
        </div>

        {/* WORKER CAPACITY LIST */}
        <div className="border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden flex flex-col h-[280px] shadow-inner">
          <div className="bg-gray-200 px-3 py-2 border-b-2 border-gray-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <ListOrdered size={14} className="text-gray-500" />
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest leading-none">Worker Capacity Slots</span>
              </div>
              <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-24 pl-6 pr-2 py-1 text-[10px] border-2 border-gray-300 rounded-full bg-white focus:outline-none focus:border-blue-400 font-['Share_Tech']" />
              </div>
          </div>
          <div className="overflow-y-auto p-2 flex-1 scrollbar-thin scrollbar-thumb-gray-300">
              {filteredKeys.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-60">
                      <ListOrdered size={24} />
                      <span className="text-[11px] font-bold uppercase tracking-widest font-['Share_Tech']">No Active Slots</span>
                  </div>
              ) : (
                  filteredKeys.map((k, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white border-2 border-gray-100 rounded-lg mb-1 last:mb-0 shadow-sm hover:border-blue-400 transition-colors group">
                          <div className="w-2 h-2 rounded-full shrink-0 bg-green-500" />
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-50 text-[10px] font-bold text-gray-500 rounded border-2 border-gray-200">{idx + 1}</span>
                          <div className="flex-1 min-w-0 font-mono text-[11px] text-gray-600 truncate px-1 select-all">
                              {provider === 'PUTER' ? k : k.substring(0, 15) + '...' + k.substring(k.length - 8)}
                          </div>
                          <button onClick={() => handleDeleteOne(k)} disabled={isProcessing} className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><XCircle size={14} /></button>
                      </div>
                  ))
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPanel;
