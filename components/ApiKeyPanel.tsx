import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Key, Plus, Trash2, XCircle, ListOrdered, Search, Save, FileText, ExternalLink, Palette } from 'lucide-react';
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
  
  workerCount?: number;
  setWorkerCount?: (count: number) => void;

  // New Delay Props
  apiDelay?: number;
  setApiDelay?: (delay: number) => void;

  // Theme Props
  appColor?: string;
  setAppColor?: (color: string) => void;
}

const ApiKeyPanel: React.FC<Props> = ({ 
  apiKeys, 
  setApiKeys, 
  isProcessing, 
  provider = 'GEMINI',
  setProvider,
  geminiModel = 'gemini-3-flash-preview',
  setGeminiModel,
  workerCount,
  setWorkerCount,
  apiDelay = 3,
  setApiDelay,
  appColor = '#3b82f6',
  setAppColor
}) => {
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

  const handleDelayChange = (value: string) => {
    if (!setApiDelay) return;
    let num = parseInt(value);
    if (isNaN(num)) return;
    if (num < 1) num = 1; // Minimal 1 detik
    setApiDelay(num);
  };

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
                      <div className="text-[10px] text-green-600 font-bold uppercase tracking-tight">Auto Updated</div>
                  </div>
                  <input 
                      type="text" 
                      className={`${inputClass} bg-gray-50 font-medium`} 
                      value={geminiModel} 
                      disabled={true} 
                  />
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
                          className={`${inputClass} text-center font-bold bg-blue-50 text-blue-700 border-blue-200`}
                          value={apiDelay}
                          onChange={(e) => handleDelayChange(e.target.value)}
                          disabled={isProcessing}
                      />
                    </div>
                  </div>
               </div>
            </div>
          </div>
          <div className={`border-t ${theme.divider} w-full`}></div>
        </div>
      </div>

      {/* COLOR SETTING CARD */}
      <div className={`bg-white p-4 rounded-lg shadow-sm border ${theme.border} transition-colors flex flex-col`}>
        <div className="flex items-center gap-2 mb-4">
          <Palette className={`w-4 h-4 ${theme.icon}`} />
          <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide leading-none">App Theme</h2>
        </div>
        <div className={`border-t ${theme.divider} mb-3`}></div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col flex-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Accent Color</label>
            <div className="flex gap-2 items-center">
              <input 
                type="color" 
                value={appColor}
                onChange={(e) => setAppColor?.(e.target.value)}
                className="h-8 w-12 cursor-pointer rounded border border-gray-200"
                disabled={isProcessing}
              />
              <input 
                type="text"
                value={appColor.toUpperCase()}
                onChange={(e) => setAppColor?.(e.target.value)}
                className={`${inputClass} font-mono`}
                placeholder="#000000"
                disabled={isProcessing}
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 italic">Gunakan ini untuk merubah warna utama tombol dan elemen dekorasi aplikasi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPanel;
