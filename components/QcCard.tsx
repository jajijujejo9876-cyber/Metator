import React, { memo } from 'react';
import { Check, Eye, Trash2, Loader2, Video as VideoIcon, Image as ImageIcon, PenTool, Languages, RefreshCw, CheckCircle, XCircle, Info } from 'lucide-react';
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

  let statusBg = 'bg-gray-50 border-gray-200';
  let statusText = 'text-gray-600';
  let statusLabel = 'MENUNGGU';
  let StatusIcon = Loader2;

  if (isCompleted && result) {
    if (result.status === 'Pass') {
      statusBg = 'bg-green-50 border-green-200';
      statusText = 'text-green-700';
      statusLabel = language === 'ENG' ? 'PASSED' : 'LULUS';
      StatusIcon = CheckCircle;
    } else if (result.status === 'Warning') {
      statusBg = 'bg-amber-50 border-amber-200';
      statusText = 'text-amber-700';
      statusLabel = language === 'ENG' ? 'WARNING' : 'PERINGATAN';
      StatusIcon = Info;
    } else {
      statusBg = 'bg-red-50 border-red-200';
      statusText = 'text-red-700';
      statusLabel = language === 'ENG' ? 'REJECTED' : 'GAGAL';
      StatusIcon = XCircle;
    }
  } else if (isFailed) {
    statusBg = 'bg-red-50 border-red-200';
    statusText = 'text-red-700';
    statusLabel = 'ERROR';
    StatusIcon = XCircle;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden relative group hover:shadow-md transition-shadow h-full">
      
      <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50/50 border-b border-slate-100">
        <button onClick={() => onPreview(item)} className="flex flex-row items-center justify-center gap-2 py-1.5 rounded border bg-white border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors" title="Preview File">
          <Eye size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tight truncate">Preview</span>
        </button>

        <button onClick={() => onToggleLanguage(item.id)} disabled={disabled || !isCompleted} className={`flex flex-row items-center justify-center gap-2 py-1.5 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'ENG' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} hover:brightness-95`} title="Toggle Language">
           <Languages size={14} />
           <span className="text-[10px] font-bold uppercase tracking-tight truncate">{language}</span>
        </button>

        <button onClick={() => onDelete(item.id)} disabled={disabled} className="flex flex-row items-center justify-center gap-2 py-1.5 rounded border bg-white border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Delete File">
          <Trash2 size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tight truncate">Delete</span>
        </button>
      </div>

      <div className="px-3 py-2 flex items-center gap-2 border-b border-slate-100 mb-1">
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

      <div className="flex flex-col gap-2 px-3 pb-3 flex-1 min-h-[140px]">
         
         <div className="flex gap-2 items-center">
           <span className={`${labelClass} bg-slate-50 text-slate-600 border-slate-200`}>STATUS</span>
           <div className="h-6 w-full relative">
              <div className={`${viewContainerClass} h-full !p-0 px-2 flex items-center justify-between ${statusBg}`}>
                 <div className="flex items-center gap-1.5">
                    <StatusIcon size={12} className={statusText} />
                    <span className={`text-[10px] font-black tracking-wider ${statusText}`}>{statusLabel}</span>
                 </div>
                 {result && (
                    <span className={`text-[10px] font-black ${statusText}`}>SKOR: {result.score}/100</span>
                 )}
              </div>
           </div>
         </div>

         <div className="flex flex-col gap-1 flex-1">
            <span className={`${labelClassFull} bg-violet-50 text-violet-600 border-violet-200`}>QC REPORT</span>
            <div className="flex-1 h-[6.5rem] w-full relative">
                <div className={`${viewContainerClass} h-full bg-slate-50/30 border-slate-200`}>
                    <div className={`${textBaseClass} ${viewClass} h-full text-gray-600 whitespace-normal break-words !border-0 !p-1.5 flex flex-col gap-2`}>
                      
                      {isProcessing && <span className="text-blue-500 text-xs animate-pulse">Sedang menganalisis visual...</span>}
                      {isFailed && <span className="text-red-500 text-xs">{item.error || 'Gagal menganalisis.'}</span>}
                      
                      {isCompleted && result && (
                         <>
                            {result.ipIssues && result.ipIssues.length > 0 && (
                               <div>
                                  <span className="text-[10px] font-bold text-red-600 uppercase block mb-0.5">⚠️ IP / Trademark:</span>
                                  <ul className="list-disc pl-4 text-red-500 text-[10px] leading-tight space-y-0.5">
                                    {result.ipIssues.map((iss, i) => <li key={i}>{iss}</li>)}
                                  </ul>
                               </div>
                            )}

                            {result.technicalIssues && result.technicalIssues.length > 0 && (
                               <div>
                                  <span className="text-[10px] font-bold text-amber-600 uppercase block mb-0.5">🔍 Technical Issues:</span>
                                  <ul className="list-disc pl-4 text-amber-600 text-[10px] leading-tight space-y-0.5">
                                    {result.technicalIssues.map((iss, i) => <li key={i}>{iss}</li>)}
                                  </ul>
                               </div>
                            )}

                            {result.commercialAdvice && (
                               <div>
                                  <span className="text-[10px] font-bold text-blue-600 uppercase block mb-0.5">💡 Commercial Advice:</span>
                                  <p className="text-blue-700/80 text-[10px] leading-tight">{result.commercialAdvice}</p>
                               </div>
                            )}

                            {result.status === 'Pass' && (!result.ipIssues || result.ipIssues.length === 0) && (!result.technicalIssues || result.technicalIssues.length === 0) && (
                               <p className="text-green-600 text-[10px] font-medium text-center mt-2">✨ Tidak ditemukan masalah. File siap dijual!</p>
                            )}
                         </>
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
