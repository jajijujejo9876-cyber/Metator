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
    <>
      <style>{`
        /* Mengimpor font utama REFORNAM */
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech&display=swap');

        /* Variabel warna dasar mengikuti tema light-clean REFORNAM */
        .refornam-theme {
            --primary: #2563eb;
            --success: #22c55e;
            --card-bg: #ffffff;
            --border: #d1d5db;
            --text: #1f2937;
            --input-bg: #ffffff;
            --log-bg: #f8fafc; /* Sedikit lebih terang dari hitam untuk menyesuaikan panel API */
            --log-text: #334155;
        }

        .rf-container {
            background-color: var(--card-bg);
            width: 100%;
            padding: 20px;
            border-radius: 12px;
            border: 2px solid var(--border);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            font-family: 'Share Tech', sans-serif;
            color: var(--text);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }

        .rf-header {
            color: var(--primary);
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 5px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            width: inline-block;
        }

        .rf-config-grid {
            display: grid;
            gap: 15px;
            margin-bottom: 10px;
        }

        .rf-input-group {
            display: flex;
            flex-direction: column;
        }

        .rf-label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .rf-label {
            font-size: 13px;
            color: var(--primary);
            font-weight: bold;
        }

        .rf-btn-mode {
            background: none;
            border: none;
            color: var(--primary);
            cursor: pointer;
            font-family: 'Share Tech', sans-serif;
            font-size: 11px;
            text-decoration: underline;
            padding: 0;
        }

        /* INPUT FIELDS - 36px */
        .rf-input-field {
            width: 100%;
            background: var(--input-bg);
            border: 1px solid var(--border);
            padding: 8px;
            color: var(--text);
            font-family: 'Share Tech', sans-serif;
            box-sizing: border-box;
            border-radius: 8px;
            font-size: 14px;
            height: 36px;
            transition: all 0.3s ease;
        }

        .rf-input-field:focus {
            outline: none;
            border-color: var(--primary) !important;
            box-shadow: 0 0 8px var(--primary);
        }

        .rf-input-field:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background-color: #f3f4f6;
        }

        /* BUTTONS - 38px (Standard) & 36px (Square) */
        .rf-action-bars {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }

        .rf-btn-main {
            flex: 1;
            border: none;
            padding: 0;
            cursor: pointer;
            font-family: 'Share Tech', sans-serif;
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 8px;
            font-size: 15px;
            position: relative;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: top 0.1s, box-shadow 0.1s;
            top: 0;
        }

        .rf-btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 0 rgba(0,0,0,0.2); }
        .rf-btn-danger { background: #ef4444; color: white; box-shadow: 0 4px 0 #b91c1c; }
        .rf-btn-success { background: var(--success); color: white; box-shadow: 0 4px 0 #15803d; }
        .rf-btn-secondary { background: #f1f5f9; border: 1px solid var(--border); color: var(--text); box-shadow: 0 4px 0 rgba(0,0,0,0.1); }
        .rf-btn-outline { background: white; border: 1px solid var(--border); color: var(--text); box-shadow: 0 4px 0 rgba(0,0,0,0.1); }

        .rf-btn-main:active:not(:disabled) {
            top: 2px;
            box-shadow: 0 2px 0 rgba(0,0,0,0.2) !important;
        }

        .rf-btn-main:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            box-shadow: none !important;
            top: 0 !important;
            transform: none !important;
        }

        .rf-btn-browse {
            background: var(--primary);
            color: white !important;
            border: none;
            cursor: pointer;
            font-family: 'Share Tech', sans-serif;
            border-radius: 8px;
            font-weight: bold;
            height: 36px;
            width: 36px;
            box-shadow: 0 4px 0 rgba(0,0,0,0.2);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: top 0.1s, box-shadow 0.1s;
        }
        
        .rf-btn-browse:active:not(:disabled) {
            top: 2px;
            box-shadow: 0 2px 0 rgba(0,0,0,0.2);
        }
        
        .rf-btn-browse:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            box-shadow: none;
            top: 0;
        }

        /* Area Auth & Load (Sengaja dibuat 40px agar sedikit lebih lega) */
        .rf-auth-container {
            height: 40px;
            margin-bottom: 15px;
            display: flex;
            gap: 8px;
        }

        /* WORKER LOG PANEL */
        .rf-log-panel {
            background: var(--log-bg);
            border: 1px solid var(--border);
            height: 250px;
            flex-shrink: 0;
            padding: 10px;
            overflow-y: auto;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
        }

        .rf-log-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 4px;
        }

        .rf-log-entry {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--card-bg);
            border: 1px solid var(--border);
            padding: 6px 8px;
            margin-bottom: 4px;
            border-radius: 6px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .rf-slot-badge {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e2e8f0;
            color: var(--text);
            font-size: 11px;
            font-weight: bold;
            border-radius: 4px;
            border: 1px solid var(--border);
            flex-shrink: 0;
        }
      `}</style>

      <div className="refornam-theme rf-container">
        
        <div className="rf-header">
          <Key size={20} /> REFORNAM API PANEL
        </div>

        {/* ROW 1: PROVIDER & BASE URL */}
        <div className="rf-config-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
           <div className="rf-input-group">
              <div className="rf-label-row"><label className="rf-label">Provider</label></div>
              <select 
                className="rf-input-field" 
                value={provider} 
                // @ts-ignore
                onChange={(e) => setProvider?.(e.target.value)} 
                disabled={isProcessing}
              >
                <option value="GOOGLE" style={{ fontWeight: 'bold', color: '#2563eb' }}>Login Google (OAuth)</option>
                <option value="GEMINI">Google Gemini API</option>
                <option value="MISTRAL">Mistral AI</option>
                <option value="GROQ">Groq Cloud</option>
                <option value="PUTER">Puter.js</option>
                <option value="CUSTOM">Custom Provider</option>
              </select>
           </div>
           
           <div className="rf-input-group">
              <div className="rf-label-row"><label className="rf-label">Base URL</label></div>
              {provider === 'MISTRAL' || provider === 'CUSTOM' ? (
                <input 
                  type="text" 
                  className="rf-input-field" 
                  value={getBaseUrl()} 
                  onChange={(e) => provider === 'MISTRAL' ? setMistralBaseUrl?.(e.target.value) : setCustomBaseUrl?.(e.target.value)}
                  placeholder="https://api..." 
                />
              ) : (
                <input type="text" className="rf-input-field" value={getBaseUrl()} disabled />
              )}
           </div>
        </div>

        {/* ROW 2: MODEL NAME & WORKERS */}
        <div className="rf-config-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
           <div className="rf-input-group">
              <div className="rf-label-row">
                  <label className="rf-label">Model Name</label>
                  <button onClick={() => setIsManualModel(!isManualModel)} className="rf-btn-mode">
                    {isManualModel ? 'LIST' : 'MANUAL'}
                  </button>
              </div>
              {isManualModel ? (
                  <div style={{ position: 'relative' }}>
                    <input type="text" className="rf-input-field" style={{ paddingRight: '35px' }} placeholder="e.g. gpt-4o" value={currentModelName} onChange={(e) => setCurrentModel(e.target.value)} disabled={isProcessing} />
                    <button onClick={handleToggleCustomModel} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: isCurrentModelCustom ? '#ef4444' : '#2563eb' }}>
                      {isCurrentModelCustom ? <Trash2 size={16} /> : <Save size={16} />}
                    </button>
                  </div>
              ) : (
                  <select className="rf-input-field" value={currentModelName} onChange={(e) => setCurrentModel(e.target.value)} disabled={isProcessing}>
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

           <div className="rf-input-group">
              <div className="rf-label-row"><label className="rf-label">Workers</label></div>
              <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" min="1" max="10" className="rf-input-field" style={{ textAlign: 'center', fontWeight: 'bold' }} value={workerCount === 0 ? '' : workerCount} onChange={(e) => handleWorkerChange(e.target.value)} disabled={isProcessing} />
                  <button onClick={() => window.open(getConnectLink(), '_blank')} disabled={isProcessing || provider === 'GOOGLE'} className="rf-btn-browse">
                      <ExternalLink size={16} />
                  </button>
              </div>
           </div>
        </div>

        {/* AREA AUTH & DATA LOAD */}
        <div className="rf-auth-container">
          {provider === 'GOOGLE' ? (
              <button onClick={handleGoogleLogin} disabled={isProcessing} className="rf-btn-main rf-btn-outline" style={{ width: '100%', height: '40px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#4A90E2" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/></svg>
                  SIGN IN WITH GOOGLE
              </button>
          ) : provider === 'PUTER' ? (
              <button onClick={handlePuterLogin} disabled={isProcessing} className={`rf-btn-main ${isPuterAuthenticated ? 'rf-btn-success' : 'rf-btn-outline'}`} style={{ width: '100%', height: '40px' }}>
                  {isPuterAuthenticated ? <ShieldCheck size={18}/> : <LogIn size={18} color="#1f2937" />}
                  <span style={{ color: isPuterAuthenticated ? 'white' : '#1f2937' }}>{isPuterAuthenticated ? 'PUTER ACTIVE' : 'LOGIN PUTER'}</span>
              </button>
          ) : (
            <>
                <textarea placeholder="Keys (one per line)..." className="rf-input-field" style={{ flex: 1, height: '40px', resize: 'none', padding: '8px', fontSize: '11px', fontFamily: 'monospace' }} value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} />
                <input type="file" ref={fileInputRef} accept=".txt" style={{ display: 'none' }} onChange={handleLoadTxt} />
                <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="rf-btn-browse" style={{ height: '40px', width: '40px', flexDirection: 'column', gap: '2px', background: '#e0f2fe', color: '#0284c7' }}>
                    <FileText size={16} color="#0284c7" />
                </button>
            </>
          )}
        </div>

        {/* ACTION BARS */}
        <div className="rf-action-bars">
          <div className="rf-input-field" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontWeight: 'bold', height: '38px' }}>
             SLOTS: {apiKeys.length}
          </div>
          <button onClick={handleAddKeys} disabled={isProcessing || provider === 'GOOGLE' || (provider === 'PUTER' && !isPuterAuthenticated) || (provider !== 'PUTER' && provider !== 'GOOGLE' && !bulkInput.trim())} className="rf-btn-main rf-btn-primary">
            <Plus size={16} /> {addActionLabel}
          </button>
          <button onClick={handleClearAll} disabled={isProcessing || apiKeys.length === 0} className="rf-btn-main rf-btn-danger">
            <Trash2 size={16} /> CLEAR
          </button>
        </div>

        {/* WORKER LOG PANEL */}
        <div className="rf-log-panel">
          <div className="rf-log-header">
              <label className="rf-label" style={{ color: '#475569' }}>WORKER SLOTS</label>
              <div style={{ position: 'relative' }}>
                  <Search size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="rf-input-field" style={{ height: '26px', width: '100px', paddingLeft: '24px', fontSize: '11px', borderRadius: '12px' }} />
              </div>
          </div>
          
          <div style={{ padding: '4px 0' }}>
              {filteredKeys.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', opacity: 0.8 }}>
                      <ListOrdered size={24} style={{ margin: '0 auto 5px auto' }} />
                      <div style={{ fontSize: '11px', fontWeight: 'bold' }}>NO ACTIVE SLOTS</div>
                  </div>
              ) : (
                  filteredKeys.map((k, idx) => (
                      <div key={idx} className="rf-log-entry">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                              <div className="rf-slot-badge">{idx + 1}</div>
                              <div style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {provider === 'PUTER' ? k : k.substring(0, 15) + '...' + k.substring(k.length - 8)}
                              </div>
                          </div>
                          <button onClick={() => handleDeleteOne(k)} disabled={isProcessing} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                              <XCircle size={16} />
                          </button>
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
