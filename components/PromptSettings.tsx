import React, { useRef, useState } from 'react';
import { Command, FileText, CheckSquare, Square, UploadCloud, History, Type, File, ImageIcon } from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isProcessing: boolean;
  onRestoreHistory: () => void;
  hasHistory: boolean;
  onFilesUpload?: (files: FileList) => void; 
  hasVideo?: boolean; // <--- INI SAYA TAMBAHIN BIAR GAK ERROR
}

const PromptSettings: React.FC<Props> = ({ settings, setSettings, isProcessing, onRestoreHistory, hasHistory, onFilesUpload, hasVideo }) => {
  const promptMediaInputRef = useRef<HTMLInputElement>(null);
  const [hasVideoUploaded, setHasVideoUploaded] = useState(false);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: 'promptQuantity' | 'videoFrameCount', value: string) => {
    if (value === '') {
      handleChange(field, 0); // Diset ke 0 agar input bisa kosong di UI
      return;
    }
    let num = parseInt(value);
    if (isNaN(num)) return;
    if (num < 0) num = 0;
    
    // Khusus video frame count, kita batasi maksimal 5 sesuai placeholder
    if (field === 'videoFrameCount' && num > 5) num = 5;

    handleChange(field, num);
  };

  const handlePromptMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const isVideoPresent = Array.from(e.target.files).some(file => file.type.startsWith('video/'));
      setHasVideoUploaded(isVideoPresent);

      if (onFilesUpload) {
          onFilesUpload(e.target.files);
      }
    }
    e.target.value = ''; 
  };

  const inputClass = "w-full text-base p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-400 h-[42px]";
  const labelClass = "block text-sm font-medium text-gray-500 h-5 flex items-center whitespace-nowrap overflow-hidden";

  const isFileMode = settings.promptPlatform === 'file';
  const defaultFilename = isFileMode ? 'IsaPrompt_File' : 'IsaPrompt_Teks';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Command className="w-4 h-4 text-blue-500" />
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">Prompt Setting</h2>
      </div>

      <div className="border-t border-blue-100 -my-2"></div>

      {/* TOGGLE MODE */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-1">
             <label className={labelClass}>Operating Mode</label>
        </div>
        <div className={`flex gap-2 p-1 bg-gray-100 rounded-lg w-full h-[48px] ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}>
          <button
            onClick={() => handleChange('promptPlatform', 'text')}
            disabled={isProcessing}
            className={`flex-1 flex items-center justify-center gap-2 py-1 text-base font-medium tracking-wide rounded-md transition-all border ${
              !isFileMode ? 'bg-white text-blue-600 shadow-sm border-blue-100' : 'border-transparent text-gray-500 hover:bg-gray-200'
            } ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <Type size={14} className={!isFileMode ? 'text-blue-500' : 'text-gray-400'} />
            <span>Mode Teks</span>
          </button>

          <button
            onClick={() => handleChange('promptPlatform', 'file')}
            disabled={isProcessing}
            className={`flex-1 flex items-center justify-center gap-2 py-1 text-base font-medium tracking-wide rounded-md transition-all border ${
              isFileMode ? 'bg-white text-blue-600 shadow-sm border-blue-100' : 'border-transparent text-gray-500 hover:bg-gray-200'
            } ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <File size={14} className={isFileMode ? 'text-blue-600' : 'text-gray-400'} />
            <span>Mode File</span>
          </button>
        </div>
      </div>

      {/* AREA INPUT */}
      <div className="">
        {isFileMode ? (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-1">
                <label className={labelClass}>Media Source</label>
              </div>
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
                className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-wait min-h-[42px]"
              >
                <UploadCloud size={16} /> 
                Upload Images / Videos / Vectors
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

      {/* DIBUAT RAPAT: Description & Quantity dibungkus gap-2 */}
      <div className="flex flex-col gap-2">
          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className={labelClass}>Instruction / Description (Optional)</label>
            </div>
            <textarea
              className="w-full text-sm p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-300 resize-none h-20"
              placeholder={isFileMode ? "Instruksi spesifik. Contoh: Ubah suasananya jadi malam hari..." : "Detail pencahayaan, suasana, warna..."}
              value={settings.promptDescription}
              onChange={(e) => handleChange('promptDescription', e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* Frame / Quantity & History */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="flex-1 min-w-0">
              {isFileMode ? (
                  <div className="animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 mb-1">
                         <label className={labelClass} title="Hanya aktif jika upload Video">Video Frames</label>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Max 5"
                        className={inputClass}
                        // LOGIKA BARU: Kalau 0 tampilkan kosong agar placeholder muncul
                        value={settings.videoFrameCount === 0 ? '' : settings.videoFrameCount}
                        onChange={(e) => handleNumberChange('videoFrameCount', e.target.value)}
                        disabled={isProcessing || !hasVideo} 
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
            placeholder={defaultFilename}
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
