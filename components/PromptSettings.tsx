
import React, { useRef } from 'react';
import { Command, FileText, CheckSquare, Square, List, ImageIcon, UploadCloud, X, History } from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isProcessing: boolean;
  onRestoreHistory: () => void;
  hasHistory: boolean;
}

const PRESET_MEDIA_TYPES = [
  'Photo/Image',
  'Vector',
  'Illustration',
  'Video / Footage'
];

const PromptSettings: React.FC<Props> = ({ settings, setSettings, isProcessing, onRestoreHistory, hasHistory }) => {
  const promptMediaInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: 'promptQuantity', value: string) => {
    if (value === '') {
      handleChange(field, 0);
      return;
    }
    let num = parseInt(value);
    if (isNaN(num)) return;
    
    if (num < 0) num = 0;
    
    handleChange(field, num);
  };

  const handlePromptMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Enforce Max 5 Files limit
      const filesArray = Array.from(e.target.files).slice(0, 5);
      setSettings(prev => ({ ...prev, promptSourceFiles: filesArray }));
    }
    e.target.value = '';
  };

  const inputClass = "w-full text-base p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-400 h-[42px]";
  
  const labelClass = "block text-sm font-medium text-gray-500 h-5 flex items-center whitespace-nowrap overflow-hidden";

  const isCustomMedia = !PRESET_MEDIA_TYPES.includes(settings.promptPlatform) && settings.promptPlatform !== 'file' && settings.promptPlatform !== 'CUSTOM_TRIGGER';
  const showFileInput = settings.promptPlatform === 'file';
  const sourceFiles = settings.promptSourceFiles || [];
  const fileCount = sourceFiles.length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Command className="w-4 h-4 text-blue-500" />
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">Prompt Setting</h2>
      </div>

      <div className="border-t border-blue-100 -my-2"></div>

      {/* Idea / Niche Input */}
      <div className="pt-2">
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

      {/* Description Input */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className={labelClass}>Description (Optional)</label>
        </div>
        <textarea
          className="w-full text-base p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-300 resize-none h-20"
          placeholder="Specific details, lighting, mood, colors / Detail pencahayaan, suasana..."
          value={settings.promptDescription}
          onChange={(e) => handleChange('promptDescription', e.target.value)}
          disabled={isProcessing}
        />
      </div>

      {/* Media Type Selector */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className={labelClass}>Media Type</label>
        </div>
        
        {isCustomMedia ? (
             <div className="flex gap-3 animate-in fade-in duration-200">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. 3D Render"
                  value={settings.promptPlatform}
                  onChange={(e) => handleChange('promptPlatform', e.target.value)}
                  disabled={isProcessing}
                  autoFocus
                />
                <button
                  onClick={() => handleChange('promptPlatform', 'Photo/Image')} 
                  className="w-10 shrink-0 flex items-center justify-center bg-gray-100 text-gray-500 border border-gray-300 rounded hover:bg-gray-200 transition-colors h-[42px]"
                  title="Back to Presets"
                  disabled={isProcessing}
                >
                    <List size={16} />
                </button>
            </div>
        ) : showFileInput ? (
            <div className="flex gap-3 animate-in fade-in duration-200">
                <div className="relative flex-1 min-w-0">
                    <input 
                        ref={promptMediaInputRef}
                        type="file"
                        multiple 
                        accept="image/*,video/*,.svg,.eps,.ai,.pdf"
                        onChange={handlePromptMediaUpload}
                        className="hidden"
                    />
                    <button 
                        onClick={() => fileCount === 0 && promptMediaInputRef.current?.click()}
                        disabled={isProcessing}
                        className={`w-full h-full min-h-[42px] px-3 border rounded flex items-center justify-between gap-2 transition-all ${
                            fileCount > 0
                            ? 'bg-blue-50 border-blue-300 text-blue-700' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <ImageIcon size={16} className={`shrink-0 ${fileCount > 0 ? "text-blue-500" : "text-gray-400"}`} />
                            <span className="text-sm truncate block w-full text-left font-medium">
                                {fileCount > 0 
                                ? (fileCount === 1 ? sourceFiles[0].name : `${fileCount} Files Selected`) 
                                : "Upload Images/Videos/Vectors... (Max 5)"}
                            </span>
                        </div>
                        
                        {fileCount > 0 && (
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isProcessing) {
                                        setSettings(prev => ({ ...prev, promptSourceFiles: [] })); 
                                        if(promptMediaInputRef.current) promptMediaInputRef.current.value = '';
                                    }
                                }}
                                className="p-1 hover:bg-blue-200 rounded-full cursor-pointer transition-colors shrink-0"
                            >
                                <X size={14} />
                            </div>
                        )}
                    </button>
                </div>
                <button
                    onClick={() => handleChange('promptPlatform', 'Photo/Image')} 
                    className="w-10 shrink-0 flex items-center justify-center bg-gray-100 text-gray-500 border border-gray-300 rounded hover:bg-gray-200 transition-colors h-[42px]"
                    title="Back to Presets"
                    disabled={isProcessing}
                >
                    <List size={16} />
                </button>
            </div>
        ) : (
             <div className="relative">
                <select
                    className={inputClass}
                    value={settings.promptPlatform}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'CUSTOM_TRIGGER') {
                            handleChange('promptPlatform', ''); 
                        } else {
                            handleChange('promptPlatform', val);
                        }
                    }}
                    disabled={isProcessing}
                >
                    {PRESET_MEDIA_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                    <option value="file">From File (Image/Video/Vector)</option>
                    <option value="CUSTOM_TRIGGER">Custom (Your Media Type)</option>
                </select>
             </div>
        )}
      </div>

      {/* Quantity & History Row (50:50) */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div className="flex-1 min-w-0">
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
