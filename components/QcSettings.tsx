import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, XCircle, Info, Maximize2, RotateCcw, AlertOctagon } from 'lucide-react';
import { FileItem, ProcessingStatus } from '../types';

interface Props {
  item: FileItem;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onPreview: (item: FileItem) => void;
  disabled: boolean;
}

const QcCard: React.FC<Props> = ({ item, onDelete, onRetry, onPreview, disabled }) => {
  const isVideo = item.type === 'Video';
  const isPending = item.status === ProcessingStatus.Pending;
  const isProcessing = item.status === ProcessingStatus.Processing;
  const isFailed = item.status === ProcessingStatus.Failed;
  const isCompleted = item.status === ProcessingStatus.Completed;

  const result = item.qcResult;

  // Tentukan warna tema berdasarkan status kelulusan QC
  let themeColor = 'bg-gray-50 border-gray-200';
  let badgeColor = 'bg-gray-100 text-gray-500';
  let StatusIcon = Info;

  if (isCompleted && result) {
    if (result.status === 'Pass') {
      themeColor = 'bg-green-50/50 border-green-200';
      badgeColor = 'bg-green-100 text-green-700 border-green-200';
      StatusIcon = CheckCircle2;
    } else if (result.status === 'Warning') {
      themeColor = 'bg-amber-50/50 border-amber-200';
      badgeColor = 'bg-amber-100 text-amber-700 border-amber-200';
      StatusIcon = AlertTriangle;
    } else {
      themeColor = 'bg-red-50/50 border-red-200';
      badgeColor = 'bg-red-100 text-red-700 border-red-200';
      StatusIcon = XCircle;
    }
  } else if (isFailed) {
    themeColor = 'bg-red-50 border-red-200';
  }

  return (
    <div className={`relative flex flex-col bg-white border rounded-xl shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-md ${themeColor}`}>
      
      {/* THUMBNAIL AREA */}
      <div className="relative h-40 w-full bg-gray-100 shrink-0 border-b border-gray-100/50 overflow-hidden">
        <img 
          src={item.thumbnail || item.previewUrl} 
          alt="Preview" 
          className={`w-full h-full object-cover transition-transform duration-500 ${isProcessing ? 'scale-105 blur-sm opacity-50' : 'group-hover:scale-105'}`} 
        />
        
        {/* Lencana Tipe File */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-sm">
          {item.type}
        </div>

        {/* Lencana Skor (Jika Selesai) */}
        {isCompleted && result && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm border border-white/10 flex items-center gap-1">
             Skor: {result.score}
          </div>
        )}

        {/* Lencana Status Processing */}
        <div className="absolute bottom-2 left-2">
          {isPending && <span className="bg-gray-100/90 backdrop-blur text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-gray-200">Menunggu</span>}
          {isProcessing && <span className="bg-blue-100/90 backdrop-blur text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-blue-200 animate-pulse">Memeriksa...</span>}
          {isFailed && <span className="bg-red-100/90 backdrop-blur text-red-600 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-red-200">Gagal</span>}
        </div>

        {/* Tombol Preview (Muncul saat hover) */}
        {!isProcessing && (
          <button 
            onClick={() => onPreview(item)}
            className="absolute inset-0 m-auto w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
          >
            <Maximize2 size={16} />
          </button>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="p-3 flex-1 flex flex-col min-h-0 bg-white/50">
        
        {isFailed ? (
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertOctagon size={14} /> Pengecekan Gagal</div>
            <p className="text-[10px] text-red-500/80 leading-tight line-clamp-3">{item.error || 'Terjadi kesalahan sistem saat menghubungi AI.'}</p>
          </div>
        ) : isCompleted && result ? (
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
             
             {/* Header Status */}
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hasil Kurasi</span>
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border flex items-center gap-1 ${badgeColor}`}>
                   <StatusIcon size={12} /> {result.status}
                </span>
             </div>

             {/* Masalah Hak Cipta (Merah/Fatal) */}
             {result.ipIssues && result.ipIssues.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded p-2">
                   <span className="text-[10px] font-black text-red-800 uppercase tracking-wide block mb-1">⚠️ Pelanggaran Hak Cipta / Rilis</span>
                   <ul className="list-disc list-inside text-[10px] text-red-600 pl-3 leading-tight space-y-0.5">
                     {result.ipIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                     ))}
                   </ul>
                </div>
             )}

             {/* Masalah Teknis (Kuning/Warning) */}
             {result.technicalIssues && result.technicalIssues.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded p-2">
                   <span className="text-[10px] font-black text-amber-800 uppercase tracking-wide block mb-1">🔍 Catatan Teknis</span>
                   <ul className="list-disc list-inside text-[10px] text-amber-700 pl-3 leading-tight space-y-0.5">
                     {result.technicalIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                     ))}
                   </ul>
                </div>
             )}

             {/* Saran Komersial (Biru/Info) */}
             {result.commercialAdvice && (
                <div className="bg-blue-50/50 border border-blue-100 rounded p-2 mt-auto">
                   <span className="text-[10px] font-black text-blue-800 uppercase tracking-wide block mb-1">💡 Saran Komersial</span>
                   <p className="text-[10px] text-blue-700 leading-tight">
                     {result.commercialAdvice}
                   </p>
                </div>
             )}

             {/* Jika Lolos Sempurna */}
             {result.status === 'Pass' && (!result.technicalIssues || result.technicalIssues.length === 0) && (!result.ipIssues || result.ipIssues.length === 0) && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-2 opacity-80">
                   <CheckCircle2 className="w-8 h-8 text-green-500 mb-1" />
                   <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Aset Sempurna</span>
                   <span className="text-[9px] text-green-600 mt-0.5">Siap di-upload ke Agensi!</span>
                </div>
             )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-xs font-bold text-gray-700 truncate">{item.file.name}</span>
            <span className="text-[10px] text-gray-400 mt-0.5">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="border-t border-gray-100 p-2 bg-gray-50 flex items-center justify-between shrink-0">
        <button 
          onClick={() => onDelete(item.id)} 
          disabled={disabled || isProcessing}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          title="Hapus"
        >
          <Trash2 size={14} />
        </button>

        {isFailed && (
          <button 
            onClick={() => onRetry(item.id)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded transition-colors shadow-sm disabled:opacity-50"
          >
            <RotateCcw size={12} /> Coba Lagi
          </button>
        )}
      </div>

    </div>
  );
};

export default QcCard;
