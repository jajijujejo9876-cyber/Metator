import React, { memo } from 'react';
import { Eye, Trash2, Loader2, Video as VideoIcon, Image as ImageIcon, PenTool, Languages, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { FileItem, Language, ProcessingStatus, FileType } from '../types';

interface Props {
  item: FileItem;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onPreview: (item: FileItem) => void;
  language: Language;
  onToggleLanguage: (id: string) => void; 
  disabled: boolean;
}

const QcCard: React.FC<Props> = ({ 
  item, 
  onDelete, 
  onRetry, 
  onPreview,
  language,
  onToggleLanguage,
  disabled
}) => {
  const isCompleted = item.status === ProcessingStatus.Completed;
  const isProcessing = item.status === ProcessingStatus.Processing;
  const isFailed = item.status === ProcessingStatus.Failed;

  const result = item.qcResult;

  const labelClass = "text-[10px] font-bold px-1.5 rounded border uppercase inline-flex items-center select-none tracking-wide h-6 w-[70px] justify-center shrink-0";
  const labelClassFull = "text-[10px] font-bold px-1.5 rounded border uppercase inline-flex items-center select-none tracking-wide h-6 w-full justify-center shrink-0";
  const textBaseClass = "w-full text-xs px-2 py-1.5 rounded border transition-colors leading-relaxed block";
  const viewClass = "border-transparent bg-transparent overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200";
  const viewContainerClass = "border rounded p-1";

  const FileTypeIcon = item.type === FileType.Video ? VideoIcon : item.type === FileType.Vector ? PenTool : ImageIcon;

  // Pewarnaan Status Dinamis (Default: Putih Bergaris, Tanpa Teks)
  let statusBg = 'bg-white border-gray-200';
  let statusText = 'text-transparent'; // Warna transparan agar tidak terlihat jika kosong
  let statusLabel = '';
  let StatusIcon: any = null;

  // Ubah warna dan teks HANYA jika proses sudah selesai dan ada hasilnya
  if (isCompleted && result) {
    if (result.status === 'Pass') {
      statusBg = 'bg-green-50 border-green-200';
      statusText = 'text-green-700';
      statusLabel = language === 'ENG' ? 'PASSED' : 'LULUS';
      StatusIcon = CheckCircle2;
    } else if (result.status === 'Warning') {
      statusBg = 'bg-amber-50 border-amber-200';
      statusText = 'text-amber-700';
      statusLabel = language === 'ENG' ? 'WARNING' : 'PERINGATAN';
      StatusIcon = AlertTriangle;
    } else {
      statusBg = 'bg-red-50 border-red-200';
      statusText = 'text-red-700';
      statusLabel = language === 'ENG' ? 'REJECTED' : 'GAGAL';
      StatusIcon = XCircle;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-200 flex flex-col overflow-hidden relative group hover:shadow-md transition-shadow h-full">
      
      {/* 1. TOP TOOLBAR */}
      <div className="grid grid-cols-3 gap-2 p-2 bg-blue-50/50 border-b border-blue-100">
        <button onClick={() => onPreview(item)} className="flex flex-row items-center justify-center gap-2 py-1.5 rounded border bg-white border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors" title="Preview File">
          <Eye size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tight truncate">Preview</span>
        </button>

        <button onClick={() => onToggleLanguage(item.id)} disabled={disabled || !isCompleted} className={`flex flex-row items-center justify-center gap-2 py-1.5 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'ENG' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} hover:brightness-95`} title="Toggle Language">
           <Languages size={14} />
           <span className="text-[10px] font-bold uppercase tracking-tight truncate">{language}</span>
        </button>

        <button onClick={() => onDelete(item.id)} disabled={disabled} className="flex flex-row items-center justify-center gap-2 py-1.5 rounded border bg-white border-blue-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Delete File">
          <Trash2 size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tight truncate">Delete</span>
        </button>
      </div>

      {/* 2. Filename & Loading Status Row */}
      <div className="px-3 py-2 flex items-center gap-2 border-b border-blue-100 mb-1">
         <div className="shrink-0">
            {isProcessing ? (
              <Loader2 className="animate-spin text-blue-500" size={16} />
            ) : isFailed ? (
              <button onClick={() => onRetry(item.id)} title="Retry" className="text-red-500 hover:text-red-700">
                <RefreshCw size={16} />
              </button>
            ) : (
              <FileTypeIcon size={16} className="text-gray-400" />
            )}
         </div>
         <div className="flex-1 min-w-0">
           <h3 className={`text-sm font-medium truncate ${isFailed ? 'text-red-600' : 'text-gray-700'}`} title={item.file.name}>
             {item.file.name}
           </h3>
         </div>
      </div>

      {/* 3. QC Content Area */}
      <div className="flex flex-col gap-1 px-3 pb-3 flex-1">
         
         {/* STATUS ROW */}
         <div className="flex gap-2 items-center">
           <span className={`${labelClass} bg-green-50 text-green-600 border-green-200`}>STATUS</span>
           <div className="h-6 w-full relative">
              {/* Kotak Status: Latar belakang & garis berubah sesuai kondisi */}
              <div className={`border rounded p-1 h-full px-2 flex items-center justify-between ${statusBg}`}>
                 <div className="flex items-center gap-1.5">
                    {StatusIcon && <StatusIcon size={12} className={statusText} />}
                    <span className={`text-[10px] font-black tracking-widest ${statusText}`}>
                       {statusLabel}
                    </span>
                 </div>
                 {isCompleted && result && (
                    <span className={`text-[10px] font-black mr-1 ${statusText}`}>
                       SCORE: {result.score}/100
                    </span>
                 )}
              </div>
           </div>
         </div>

         {/* QC REPORT ROW */}
         <div className="flex flex-col gap-1 flex-1 mt-1">
            <span className={`${labelClassFull} bg-blue-50 text-blue-600 border-blue-200`}>QC REPORT</span>
            <div className="h-[7.5rem] w-full relative">
                {/* Kotak QC Report dibikin putih solid defaultnya */}
                <div className={`${viewContainerClass} h-full bg-white border-gray-200`}>
                    <div className={`${textBaseClass} ${viewClass} h-full text-gray-700 whitespace-normal break-words !border-0 !p-1`}>
                      
                      {/* Konten HANYA muncul kalau sudah selesai (isCompleted) dan ada result-nya */}
                      {isCompleted && result && (
                         <div className="flex flex-col gap-1.5 pb-1">
                            {/* Hak Cipta / IP Issues */}
                            {result.ipIssues && result.ipIssues.length > 0 && (
                               <div>
                                  <span className="text-[10px] font-bold text-red-600 uppercase block mb-0.5">⚠️ IP / TRADEMARK:</span>
                                  <ul className="list-disc pl-4 text-red-600 text-[10px] leading-tight space-y-0.5">
                                    {result.ipIssues.map((iss, i) => <li key={i}>{iss}</li>)}
                                  </ul>
                               </div>
                            )}

                            {/* Masalah Teknis */}
                            {result.technicalIssues && result.technicalIssues.length > 0 && (
                               <div>
                                  <span className="text-[10px] font-bold text-amber-600 uppercase block mb-0.5">🔍 TECHNICAL:</span>
                                  <ul className="list-disc pl-4 text-amber-700 text-[10px] leading-tight space-y-0.5">
                                    {result.technicalIssues.map((iss, i) => <li key={i}>{iss}</li>)}
                                  </ul>
                               </div>
                            )}

                            {/* Saran Komersial */}
                            {result.commercialAdvice && (
                               <div>
                                  <span className="text-[10px] font-bold text-blue-600 uppercase block mb-0.5">💡 ADVICE:</span>
                                  <p className="text-gray-600 text-[10px] leading-tight">{result.commercialAdvice}</p>
                               </div>
                            )}

                            {/* Jika Lulus Bersih */}
                            {result.status === 'Pass' && (!result.ipIssues || result.ipIssues.length === 0) && (!result.technicalIssues || result.technicalIssues.length === 0) && (
                               <div className="flex items-center justify-center h-full pt-4">
                                  <span className="text-[10px] font-bold text-green-600 tracking-wide text-center">✨ Aset Bersih & Aman.</span>
                               </div>
                            )}
                         </div>
                      )}

                    </div>
                </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default memo(QcCard);
