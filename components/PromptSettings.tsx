import React, { useRef } from 'react';
import { Command, FileText, CheckSquare, Square, UploadCloud, History } from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isProcessing: boolean;
  onRestoreHistory: () => void;
  hasHistory: boolean;
  onFilesUpload?: (files: FileList) => void; // PROPS BARU: Buat lempar file ke layar tengah
}

const PromptSettings: React.FC<Props> = ({ settings, setSettings, isProcessing, onRestoreHistory, hasHistory, onFilesUpload }) => {
  const promptMediaInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: 'promptQuantity' | 'videoFrameCount', value: string) => {
    if (value === '') {
      handleChange(field, 0);
      return;
    }
    let num = parseInt(value);
    if (isNaN(num)) return;
    
    if (num < 0) num = 0;
    
    handleChange(field, num);
  };

  // FUNGSI UPLOAD BARU: Langsung lempar file ke App.tsx (Output Results)
  const handlePromptMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onFilesUpload) {
          onFilesUpload(e.target.files);
      }
    }
    e.target.value = ''; // Reset input biar bisa upload file yang sama lagi kalau butuh
  };

  const inputClass = "w-full text-base p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-400 h-[42px]";
  
  const labelClass = "block text-sm font-medium text-gray-500 h-5 flex items-center whitespace-nowrap overflow-hidden";

  const isFileMode = settings.promptPlatform === 'file';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Command className="w-4 h-4 text-blue-500" />
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">Prompt Setting</h2>
      </div>

      {/* TOGGLE MODE: TEKS vs FILE */}
      <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
        <button
          onClick={() => handleChange('promptPlatform', 'text')}
          disabled={isProcessing}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            !isFileMode ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          TEKS
        </button>
        <button
          onClick={() => handleChange('promptPlatform', 'file')}
          disabled={isProcessing}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            isFileMode ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          FILE
        </button>
      </div>

      {/* AREA INPUT UTAMA */}
      <div className="pt-1">
        {isFileMode ? (
            <div className="animate-in fade-in duration-200">
              <input 
                ref={promptMediaInputRef}
                type="file"
                multiple 
                accept="image/*,video/*,.svg,.eps,.ai,.pdf"
                onChange={handlePromptMediaUpload}
                className="hidden"
              />
              <button 
                onClick={() => promptMediaInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full h-[42px] flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors text-xs font-bold uppercase tracking-wide shadow-sm"
              >
                <UploadCloud size={16} />
                Upload Media Files
              </button>
            </div>
        ) : (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-1">
                <label className={labelClass}>Idea / Niche</label>
              </div>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Cyberpunk Street Food / Jajanan Jalanan..."
                value={settings.promptIdea}
                onChange={(e) => handleChange('promptIdea', e.target.value)}
                disabled={isProcessing}
              />
            </div>
        )}
      </div>

      {/* Description Input */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className={labelClass}>Instruksi Tambahan (Opsional)</label>
        </div>
        <textarea
          className="w-full text-sm p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-300 resize-none h-20"
          placeholder={isFileMode ? "Contoh: Ubah suasananya jadi malam hari, tambahkan efek neon..." : "Detail pencahayaan, suasana, warna..."}
          value={settings.promptDescription}
          onChange={(e) => handleChange('promptDescription', e.target.value)}
          disabled={isProcessing}
        />
      </div>

      {/* Baris Bawah: Frame/Quantity & History */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div className="flex-1 min-w-0">
          {isFileMode ? (
              <div className="animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 mb-1">
                     <label className={labelClass}>Video Frames</label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className={inputClass}
                    value={settings.videoFrameCount || 3}
                    onChange={(e) => handleNumberChange('videoFrameCount', e.target.value)}
                    disabled={isProcessing}
                  />
              </div>
          ) : (
              <div className="animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 mb-1">
                     <label className={labelClass}>Quantity</label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="No limits"
                    className={inputClass}
                    value={settings.promptQuantity === 0 ? '' : settings.promptQuantity}
                    onChange={(e) => handleNumberChange('promptQuantity', e.target.value)}
                    disabled={isProcessing}
                  />
              </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
            <button
                onClick={onRestoreHistory}
                disabled={isProcessing || !hasHistory}
                className={`w-full h-[42px] flex items-center justify-center gap-2 px-3 rounded-md border text-xs font-bold uppercase transition-colors ${
                    hasHistory 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-sm' 
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Restore last generated prompt batch"
            >
                <History size={16} />
                <span>History</span>
            </button>
        </div>
      </div>

      {/* Export Settings */}
      <div className="pt-2 border-t border-blue-100">
        <div className="flex items-center justify-between mb-1">
           <div className="flex items-center gap-2">
             <FileText className="w-4 h-4 text-blue-500" />
             <label className="block text-sm font-medium text-gray-500">
               Custom Filename
             </label>
           </div>
           
           <div className="flex gap-3">
              <button 
                onClick={() => handleChange('outputFormat', 'csv')}
                disabled={isProcessing}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                {settings.outputFormat === 'csv' 
                  ? <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> 
                  : <Square className="w-3.5 h-3.5 text-gray-300" />}
                CSV
              </button>
              <button 
                onClick={() => handleChange('outputFormat', 'txt')}
                disabled={isProcessing}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                {settings.outputFormat === 'txt' 
                  ? <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> 
                  : <Square className="w-3.5 h-3.5 text-gray-300" />}
                TXT
              </button>
           </div>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            className={`${inputClass} pr-12 !bg-white !text-gray-900`} 
            placeholder="IsaPrompt"
            value={settings.csvFilename}
            onChange={(e) => handleChange('csvFilename', e.target.value)}
            disabled={false} 
          />
          <span className="absolute right-3 text-gray-400 font-medium select-none pointer-events-none">
            .{settings.outputFormat}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PromptSettings;
