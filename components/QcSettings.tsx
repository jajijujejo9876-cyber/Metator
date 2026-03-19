import React, { useRef, useState } from 'react';
import { ShieldCheck, FilePlus, FolderPlus, CheckSquare, Square, Info } from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isProcessing: boolean;
  onFilesUpload: (files: FileList) => void;
  hasVideo?: boolean;
}

const QcSettings: React.FC<Props> = ({ settings, setSettings, isProcessing, onFilesUpload, hasVideo = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'file' | 'folder'>('file');
  const [isDragging, setIsDragging] = useState(false);

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

  const handleNumberChange = (field: 'videoFrameCount', value: string) => {
    if (value === '') {
      setSettings(prev => ({ ...prev, [field]: 0 }));
      return;
    }
    let num = parseInt(value);
    if (isNaN(num)) return; 
    
    if (field === 'videoFrameCount') {
      if (num > 5) num = 5;
      if (num < 1) num = 1;
    }

    setSettings(prev => ({ ...prev, [field]: num }));
  };

  const inputClass = "w-full text-base p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-300 h-[42px]";
  const labelClass = "block text-sm font-medium text-gray-500 mb-1 h-5 flex items-center";

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-500" />
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">QC Settings</h2>
      </div>

      <div className="border-t border-blue-100 -my-2"></div>

      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex gap-2 items-start shadow-inner">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="flex flex-col">
           <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-0.5">AI Reviewer Mode</span>
           <span className="text-[11px] text-blue-600 leading-tight">Mengecek kualitas teknis (noise, blur), potensi pelanggaran Hak Cipta (IP/Trademark), dan skor nilai jual komersial.</span>
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

      <div className="grid grid-cols-1 gap-3 pt-2 border-t border-blue-100">
        <div className="col-span-1">
          <label className={labelClass}>Video Frames to Sample</label>
          <div className="flex items-center gap-2">
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
              <span className="text-[10px] text-gray-400 leading-tight w-1/2">Jumlah jepretan frame video yang akan dikirim ke AI.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QcSettings;
