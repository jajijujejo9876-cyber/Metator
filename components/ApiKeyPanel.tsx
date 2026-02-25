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
  const [isManualModel, setIsManualModel] = useState(false);
  
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

  const getBaseUrl = () => {
    return "https://generativelanguage.googleapis.com";
  };

  const getModelPresets = () => {
    return GEMINI_PRESETS;
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
                  <div className={`${inputClass} flex items-center bg-gray-50 font-bold text-blue-600 border-dashed`}>
                    Api Canvas
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
                    <div className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed">
                        <ExternalLink size={14} />
                    </div>
                </div>
             </div>
          </div>
        </div>
        <div className={`border-t ${theme.divider} w-full`}></div>
      </div>
    </div>
  );
};

export default ApiKeyPanel;
