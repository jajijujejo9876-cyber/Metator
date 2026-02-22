
import React, { useRef, useState } from 'react';
import { Database, FileText, UploadCloud, FolderPlus, FilePlus, CheckSquare, Square } from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isProcessing: boolean;
  onFilesUpload: (files: FileList) => void;
  hasVideo?: boolean;
}

const MetadataSettings: React.FC<Props> = ({ settings, setSettings, isProcessing, onFilesUpload, hasVideo = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'file' | 'folder'>('file');
  const [isDragging, setIsDragging] = useState(false);

  const handlePlatformChange = (platform: 'Adobe Stock' | 'Shutterstock') => {
    if (isProcessing) return;
    setSettings(prev => ({ ...prev, metadataPlatform: platform }));
  };

  const handleChange = (field: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: 'titleMin' | 'titleMax' | 'slideKeyword' | 'videoFrameCount', value: string) => {
    if (value === '') {
      setSettings(prev => ({ ...prev, [field]: 0 }));
      return;
    }
    let num = parseInt(value);
    if (isNaN(num)) return; 
    
    if (field === 'titleMin' && num > 100) num = 100;
    if (field === 'titleMax' && num > 150) num = 150;
    if (field === 'slideKeyword') {
      if (num > 50) num = 50; 
      if (num < 0) num = 0;
    } 
    if (field === 'videoFrameCount') {
      if (num > 5) num = 5;
      if (num < 1) num = 1;
    }

    setSettings(prev => ({ ...prev, [field]: num }));
  };

  const handleBlur = (field: 'titleMin' | 'titleMax') => {
    if (field === 'titleMin' && settings.titleMin < 50) setSettings(prev => ({ ...prev, titleMin: 50 }));
    if (field === 'titleMax' && settings.titleMax < 100) setSettings(prev => ({ ...prev, titleMax: 100 }));
  };

  const triggerUpload = () => {
    if (uploadType === 'file') fileInputRef.current?.click();
    else folderInputRef.current?.click();
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesUpload(e.target.files);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesUpload(e.dataTransfer.files);
    }
  };

  const inputClass = "w-full text-base p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-300 h-[42px]";
  const areaClass = "w-full text-base p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-300 h-14";
  const labelClass = "block text-sm font-medium text-gray-500 mb-1 h-5 flex items-center";
  
  const isShutterstock = settings.metadataPlatform === 'Shutterstock';
  const titleLabel = isShutterstock ? 'Description' : 'Title';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-blue-500" />
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">Metadata Settings</h2>
      </div>

      <div className="border-t border-blue-100 -my-2"></div>

      <div className="pt-2">
        <label className={labelClass}>Platform</label>
        <div className={`flex gap-3 p-1 bg-gray-100 rounded-lg w-full h-[46px] ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}>
          {['Adobe Stock', 'Shutterstock'].map((platform) => {
            const isActive = settings.metadataPlatform === platform;
            return (
              <button
                key={platform}
                onClick={() => handlePlatformChange(platform as any)}
                disabled={isProcessing}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium rounded-md transition-all ${
                  isActive ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                {platform}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-1">
        <div className="flex items-center justify-between mb-1.5 h-5">
          <label className="text-sm font-medium text-gray-500 tracking-tight">Source Type</label>
          <div className="flex gap-4">
             <button 
                onClick={() => setUploadType('file')}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-blue-600 transition-colors"
              >
                {uploadType === 'file' ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} className="text-gray-300" />}
                File
              </button>
              <button 
                onClick={() => setUploadType('folder')}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-blue-600 transition-colors"
              >
                {uploadType === 'folder' ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} className="text-gray-300" />}
                Folder
              </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.svg,.eps,.ai,.pdf" onChange={onInputChange} className="hidden" />
        <input ref={folderInputRef} type="file" multiple {...({ webkitdirectory: "", directory: "" } as any)} onChange={onInputChange} className="hidden" />
        
        <button 
          onClick={triggerUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isProcessing}
          className={`w-full h-[70px] border-2 border-dashed rounded-lg transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-[0.99] group ${
            isDragging 
              ? 'bg-blue-100 border-blue-500 scale-[1.02]' 
              : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2.5">
            {uploadType === 'file' ? <FilePlus size={18} className={isDragging ? 'text-blue-700' : 'text-blue-500'} /> : <FolderPlus size={18} className={isDragging ? 'text-blue-700' : 'text-blue-500'} />}
            <span className={`text-xs uppercase tracking-widest ${isDragging ? 'font-black' : ''}`}>{uploadType === 'file' ? 'Upload Assets' : 'Upload Folder'}</span>
          </div>
          <p className={`text-[9px] font-bold uppercase tracking-tighter ${isDragging ? 'text-blue-600' : 'text-gray-400'}`}>
            JPG, PNG, WEBP, HEIC, MP4, MOV, SVG, EPS, AI, PDF
          </p>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Custom {titleLabel}</label>
              <textarea
                  className={`${areaClass} resize-none text-xs font-mono scrollbar-thin scrollbar-thumb-gray-200 leading-tight`}
                  placeholder={`Priority ${titleLabel.toLowerCase()}...`}
                  value={settings.customTitle}
                  onChange={(e) => handleChange('customTitle', e.target.value)}
                  disabled={isProcessing}
                  spellCheck={false}
              />
            </div>
            <div>
              <label className={labelClass}>Custom Keyword</label>
              <textarea
                  className={`${areaClass} resize-none text-xs font-mono scrollbar-thin scrollbar-thumb-gray-200 leading-tight`}
                  placeholder="Priority keyword..."
                  value={settings.customKeyword}
                  onChange={(e) => handleChange('customKeyword', e.target.value)}
                  disabled={isProcessing}
                  spellCheck={false}
              />
            </div>
        </div>
        
        <div className="col-span-1">
          <label className={labelClass}>Negative {titleLabel} & Keyword</label>
          <textarea
            className={`${areaClass} resize-none text-xs font-mono scrollbar-thin scrollbar-thumb-gray-200 leading-tight`}
            placeholder="Daftar kata yang dilarang muncul..."
            value={settings.negativeMetadata}
            onChange={(e) => handleChange('negativeMetadata', e.target.value)}
            disabled={isProcessing}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 pt-2 border-t border-blue-100">
        <div className="col-span-5">
          <label className={labelClass}>Length (Min-Max)</label>
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded p-1 h-[42px]">
              <input
                type="number"
                min="50"
                max="100"
                placeholder="50"
                className="w-full text-center text-sm p-1 focus:outline-none"
                value={settings.titleMin === 0 ? '' : settings.titleMin}
                onChange={(e) => handleNumberChange('titleMin', e.target.value)}
                onBlur={() => handleBlur('titleMin')}
                disabled={isProcessing}
              />
              <span className="text-gray-400 font-bold px-1">-</span>
              <input
                type="number"
                min="100"
                max="150"
                placeholder="100"
                className="w-full text-center text-sm p-1 focus:outline-none"
                value={settings.titleMax === 0 ? '' : settings.titleMax}
                onChange={(e) => handleNumberChange('titleMax', e.target.value)}
                onBlur={() => handleBlur('titleMax')}
                disabled={isProcessing}
              />
          </div>
        </div>
        <div className="col-span-3">
          <label className={labelClass}>Keywords</label>
          <input
            type="number"
            min="0"
            max="50"
            placeholder="Max 50"
            className={inputClass}
            value={settings.slideKeyword === 0 ? '' : settings.slideKeyword}
            onChange={(e) => handleNumberChange('slideKeyword', e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div className="col-span-4">
          <label className={labelClass}>Video Frames</label>
          <input
            type="number"
            min="1"
            max="5"
            placeholder="Max 5"
            className={inputClass}
            value={settings.videoFrameCount === 0 ? '' : settings.videoFrameCount}
            onChange={(e) => handleNumberChange('videoFrameCount', e.target.value)}
            disabled={isProcessing || !hasVideo}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-blue-100">
        <div className="flex items-center justify-between mb-1">
           <div className="flex items-center gap-2">
             <FileText className="w-4 h-4 text-blue-500" />
             <label className="block text-sm font-medium text-gray-500 h-5 flex items-center">Custom {settings.outputFormat.toUpperCase()} Filename</label>
           </div>
        </div>
        <div className="relative flex items-center">
          <input
            type="text"
            className={`${inputClass} pr-12 !bg-white !text-gray-900`} 
            placeholder="IsaMetadata"
            value={settings.csvFilename}
            onChange={(e) => handleChange('csvFilename', e.target.value)}
            disabled={false} 
          />
          <span className="absolute right-3 text-gray-400 font-medium select-none pointer-events-none">.{settings.outputFormat}</span>
        </div>
      </div>
    </div>
  );
};

export default MetadataSettings;
