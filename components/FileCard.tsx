import React, { useState, useEffect, memo } from 'react';
import { Edit2, Check, RefreshCw, Eye, Trash2, Loader2, Video as VideoIcon, Image as ImageIcon, PenTool, Languages } from 'lucide-react';
import { FileItem, Language, ProcessingStatus, FileType } from '../types';
// IMPORT KAMUS DREAMSTIME
import { CATEGORIES, SHUTTERSTOCK_CATEGORIES, SHUTTERSTOCK_VIDEO_CATEGORIES, DREAMSTIME_CATEGORIES } from '../constants';
import { getCategoryName } from '../utils/helpers';

interface Props {
  item: FileItem;
  onDelete: (id: string) => void;
  // TAMBAHAN: Masukkan 'categoryDream' agar bisa di-save
  onUpdate: (id: string, field: 'title' | 'description' | 'keywords' | 'category' | 'categoryShutter' | 'categoryDream', value: string, language: Language) => void; 
  onRetry: (id: string) => void;
  onPreview: (item: FileItem) => void;
  language: Language;
  onToggleLanguage: (id: string) => void; 
  disabled: boolean;
  platform?: string;
}

const FileCard: React.FC<Props> = ({ 
  item, 
  onDelete, 
  onUpdate, 
  onRetry, 
  onPreview,
  language,
  onToggleLanguage,
  disabled,
  platform = 'Adobe Stock'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const isShutterstock = platform === 'Shutterstock';
  const isDreamstime = platform === 'Dreamstime';
  const usesCategory = ['Adobe Stock', 'Shutterstock'].includes(platform);
  
  // === DETEKTOR KELOMPOK PLATFORM ===
  const isGroup1 = ['Freepik', 'MiriCanvas'].includes(platform);
  const isGroup2 = ['Dreamstime', 'Vecteezy', 'Arabstock'].includes(platform);
  const usesDescription = ['Shutterstock', ...['Dreamstime', 'Vecteezy', 'Arabstock']].includes(platform);
  
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  
  // LACI UNTUK SHUTTER / ADOBE
  const [editCategory1, setEditCategory1] = useState('');
  const [editCategory2, setEditCategory2] = useState('');
  
  // LACI KHUSUS DREAMSTIME (3 Kotak)
  const [editCategoryDream1, setEditCategoryDream1] = useState('');
  const [editCategoryDream2, setEditCategoryDream2] = useState('');
  const [editCategoryDream3, setEditCategoryDream3] = useState('');
  
  const currentTitle = language === 'ENG' ? item.metadata.en.title : item.metadata.ind.title;
  const currentDescription = language === 'ENG' ? (item.metadata.en.description || '') : (item.metadata.ind.description || '');
  const currentKeywords = language === 'ENG' ? item.metadata.en.keywords : item.metadata.ind.keywords;
  
  const keywordCount = currentKeywords ? currentKeywords.split(',').filter(k => k.trim().length > 0).length : 0;

  const currentCategory = isShutterstock ? (item.metadata.categoryShutter || '') : (item.metadata.category || '');
  const currentCategoryDream = item.metadata.categoryDream || '';

  const displayCats = currentCategory ? currentCategory.split(',').map(c => c.trim()) : [];
  const cat1Name = displayCats[0] ? getCategoryName(displayCats[0], language, platform) : "";
  const cat2Name = displayCats[1] ? getCategoryName(displayCats[1], language, platform) : "";

  // Pecah angka Dreamstime (Misal: "112, 145, 105")
  const dreamCats = currentCategoryDream ? currentCategoryDream.split(',').map(c => c.trim()) : [];

  const activeCategories = isShutterstock 
      ? (item.type === FileType.Video ? SHUTTERSTOCK_VIDEO_CATEGORIES : SHUTTERSTOCK_CATEGORIES) 
      : CATEGORIES;

  useEffect(() => {
    setEditTitle(currentTitle);
    setEditDescription(currentDescription);
    setEditKeywords(currentKeywords);
    
    if (isShutterstock) {
        setEditCategory1(displayCats[0] || '');
        setEditCategory2(displayCats[1] || '');
    } else {
        setEditCategory1(displayCats[0] || '');
        setEditCategory2('');
    }

    if (isDreamstime) {
        // SETTING DARI USER: Kosongkan jika tidak ada
        setEditCategoryDream1(dreamCats[0] || '');
        setEditCategoryDream2(dreamCats[1] || '');
        setEditCategoryDream3(dreamCats[2] || '');
    }
  }, [item.metadata, language, isEditing, isShutterstock, isDreamstime, currentCategory, currentCategoryDream, currentDescription]);

  const toggleEdit = () => {
    if (isEditing) {
      if (editTitle !== currentTitle) onUpdate(item.id, 'title', editTitle, language);
      if (editDescription !== currentDescription) onUpdate(item.id, 'description', editDescription, language);
      if (editKeywords !== currentKeywords) onUpdate(item.id, 'keywords', editKeywords, language);
      
      const newCategory = isShutterstock 
          ? [editCategory1, editCategory2].filter(Boolean).join(', ') 
          : editCategory1;

      if (newCategory !== currentCategory && usesCategory) {
          onUpdate(item.id, isShutterstock ? 'categoryShutter' : 'category', newCategory, language);
      }

      // SIMPAN KATEGORI DREAMSTIME
      if (isDreamstime) {
          // Bersihkan item kosong sebelum di-join
          const newDreamCategory = [editCategoryDream1, editCategoryDream2, editCategoryDream3]
                                      .filter(Boolean).join(', ');
          if (newDreamCategory !== currentCategoryDream) {
              onUpdate(item.id, 'categoryDream', newDreamCategory, language);
          }
      }
      
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const isCompleted = item.status === ProcessingStatus.Completed;
  const isProcessing = item.status === ProcessingStatus.Processing;
  const isFailed = item.status === ProcessingStatus.Failed;

  const labelClass = "text-[10px] font-bold px-1.5 rounded border uppercase inline-flex items-center select-none tracking-wide h-6 w-[70px] justify-center shrink-0";
  const labelClassFull = "text-[10px] font-bold px-1.5 rounded border uppercase inline-flex items-center select-none tracking-wide h-6 w-full justify-center shrink-0";
  const textBaseClass = "w-full text-xs px-2 py-1.5 rounded border transition-colors leading-relaxed block";
  const viewClass = "border-transparent bg-transparent overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200";
  const editClass = "border-gray-300 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none";
  const viewContainerClass = "border border-blue-200 rounded p-1 bg-blue-50/10";

  const FileTypeIcon = item.type === FileType.Video ? VideoIcon : item.type === FileType.Vector ? PenTool : ImageIcon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-200 flex flex-col overflow-hidden relative group hover:shadow-md transition-shadow">
      
      {/* 1. TOP TOOLBAR */}
      <div className="grid grid-cols-4 gap-2 p-2 bg-blue-50/50 border-b border-blue-100">
        <button onClick={() => onPreview(item)} className="flex flex-row items-center justify-center gap-2 py-1.5 rounded border bg-white border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors" title="Preview File">
          <Eye size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tight truncate">Preview</span>
        </button>

        <button onClick={toggleEdit} disabled={disabled || !isCompleted} className={`flex flex-row items-center justify-center gap-2 py-1.5 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isEditing ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-blue-200 text-gray-600 hover:bg-gray-50'}`} title="Edit Metadata">
          {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
          <span className="text-[10px] font-bold uppercase tracking-tight truncate">{isEditing ? 'Save' : 'Edit'}</span>
        </button>

        <button onClick={() => !isEditing && onToggleLanguage(item.id)} disabled={isEditing || disabled || !isCompleted} className={`flex flex-row items-center justify-center gap-2 py-1.5 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'ENG' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} hover:brightness-95`} title="Toggle Language">
           <Languages size={14} />
           <span className="text-[10px] font-bold uppercase tracking-tight truncate">{language}</span>
        </button>

        <button onClick={() => onDelete(item.id)} disabled={disabled} className="flex flex-row items-center justify-center gap-2 py-1.5 rounded border bg-white border-blue-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Delete File">
          <Trash2 size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tight truncate">Delete</span>
        </button>
      </div>

      {/* 2. Filename Row */}
      <div className="px-3 h-8 flex items-center gap-2 border-b border-blue-100 mb-1">
         <div className="shrink-0 w-5 flex justify-center items-center">
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

      {/* 3. Metadata Content */}
      <div className="flex flex-col gap-1 px-3 pb-3 flex-1">
         
         {/* ==== APARTEMEN LANTAI 1, 2, (& 3 KHUSUS DREAMSTIME) ==== */}
         {isGroup2 ? (
            // JIKA GRUP 2: Tinggi melar dikit kalau Dreamstime
            <div className={`flex flex-col gap-1 w-full ${isDreamstime ? 'h-[6rem]' : 'h-[4.25rem]'} shrink-0`}>
               
               {/* LANTAI 1 (TITLE) */}
               <div className="flex gap-2 items-start h-[2rem]">
                 <span className={`${labelClass} bg-blue-50 text-blue-600 border-blue-200`}>TITLE</span>
                 <div className="w-full relative h-full">
                    {isEditing ? (
                       <textarea value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={`${textBaseClass} ${editClass} h-full py-0.5 text-[11px] leading-tight`} spellCheck={false} />
                    ) : (
                       <div className={`${viewContainerClass} h-full !py-0.5 overflow-hidden`}>
                          <div className={`${textBaseClass} ${viewClass} h-full font-medium text-gray-800 !border-0 !p-0 block whitespace-normal text-[11px] leading-tight`}>
                            {currentTitle || '\u00A0'}
                          </div>
                       </div>
                    )}
                 </div>
               </div>
               
               {/* LANTAI 2 (DESCRIPTION) */}
               <div className="flex gap-2 items-start h-[2rem]">
                 <span className={`${labelClass} bg-amber-50 text-amber-600 border-amber-200`}>DESC</span>
                 <div className="w-full relative h-full">
                    {isEditing ? (
                       <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={`${textBaseClass} ${editClass} h-full py-0.5 text-[11px] leading-tight`} spellCheck={false} />
                    ) : (
                       <div className={`${viewContainerClass} h-full !py-0.5 overflow-hidden`}>
                          <div className={`${textBaseClass} ${viewClass} h-full text-gray-600 !border-0 !p-0 block whitespace-normal text-[11px] leading-tight`}>
                            {currentDescription || '\u00A0'}
                          </div>
                       </div>
                    )}
                 </div>
               </div>

               {/* LANTAI 3 (KATEGORI KHUSUS DREAMSTIME DIBELAH 3) */}
               {isDreamstime && (
                 <div className="flex gap-2 items-center h-[1.5rem]">
                   {/* LABEL DIGANTI JADI CATEGORY SESUAI REQUEST PENGGUNA */}
                   <span className={`${labelClass} bg-green-50 text-green-600 border-green-200`}>CATEGORY</span>
                   <div className="h-full w-full relative flex gap-1">
                     {isEditing ? (
                        <>
                           {/* Waktu di-edit: Muncul Teks Lengkap dengan opsi siluman */}
                           <select value={editCategoryDream1} onChange={(e) => setEditCategoryDream1(e.target.value)} className={`flex-1 ${textBaseClass} ${editClass} h-full py-0 pl-1 text-[10px]`}>
                              <option value="" disabled hidden style={{ display: 'none' }}></option>
                              {DREAMSTIME_CATEGORIES.map(cat => (
                                 <option key={cat.id} value={cat.id}>{cat.id} - {language === 'ENG' ? cat.en : cat.id_lang}</option>
                              ))}
                           </select>
                           <select value={editCategoryDream2} onChange={(e) => setEditCategoryDream2(e.target.value)} className={`flex-1 ${textBaseClass} ${editClass} h-full py-0 pl-1 text-[10px]`}>
                              <option value="" disabled hidden style={{ display: 'none' }}></option>
                              {DREAMSTIME_CATEGORIES.map(cat => (
                                 <option key={cat.id} value={cat.id}>{cat.id} - {language === 'ENG' ? cat.en : cat.id_lang}</option>
                              ))}
                           </select>
                           <select value={editCategoryDream3} onChange={(e) => setEditCategoryDream3(e.target.value)} className={`flex-1 ${textBaseClass} ${editClass} h-full py-0 pl-1 text-[10px]`}>
                              <option value="" disabled hidden style={{ display: 'none' }}></option>
                              {DREAMSTIME_CATEGORIES.map(cat => (
                                 <option key={cat.id} value={cat.id}>{cat.id} - {language === 'ENG' ? cat.en : cat.id_lang}</option>
                              ))}
                           </select>
                        </>
                     ) : (
                        <>
                           {/* Waktu dilihat (View): Cuma Muncul Angkanya Aja, KOSONG jika string kosong */}
                           <div className={`flex-1 ${viewContainerClass} h-full !p-0 px-1 overflow-hidden`}>
                              <div className={`${textBaseClass} ${viewClass} h-full flex items-center justify-center font-bold !py-0 !border-0 !p-0 truncate text-[10px] text-gray-600`}>
                                 {dreamCats[0] || '\u00A0'}
                              </div>
                           </div>
                           <div className={`flex-1 ${viewContainerClass} h-full !p-0 px-1 overflow-hidden`}>
                              <div className={`${textBaseClass} ${viewClass} h-full flex items-center justify-center font-bold !py-0 !border-0 !p-0 truncate text-[10px] text-gray-600`}>
                                 {dreamCats[1] || '\u00A0'}
                              </div>
                           </div>
                           <div className={`flex-1 ${viewContainerClass} h-full !p-0 px-1 overflow-hidden`}>
                              <div className={`${textBaseClass} ${viewClass} h-full flex items-center justify-center font-bold !py-0 !border-0 !p-0 truncate text-[10px] text-gray-600`}>
                                 {dreamCats[2] || '\u00A0'}
                              </div>
                           </div>
                        </>
                     )}
                   </div>
                 </div>
               )}
            </div>
         ) : (
            // BUKAN GRUP 2: Tampilkan kotak biasa (Melar untuk Grup 1, Normal untuk yang lain)
            <div className="flex gap-2 items-start">
              <span className={`${labelClass} ${isShutterstock ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                 {isShutterstock ? 'DESC' : 'TITLE'}
              </span>
              <div className={`w-full relative ${isGroup1 ? 'h-[4.25rem]' : 'h-10'}`}>
                 {isEditing ? (
                    <textarea 
                       value={isShutterstock ? editDescription : editTitle} 
                       onChange={(e) => isShutterstock ? setEditDescription(e.target.value) : setEditTitle(e.target.value)} 
                       className={`${textBaseClass} ${editClass} h-full`} 
                       spellCheck={false} 
                    />
                 ) : (
                    <div className={`${viewContainerClass} h-full`}>
                       <div className={`${textBaseClass} ${viewClass} h-full font-medium text-gray-800 !border-0 !p-0 block whitespace-normal`}>
                         {isShutterstock ? (currentDescription || '\u00A0') : (currentTitle || '\u00A0')}
                       </div>
                    </div>
                 )}
              </div>
            </div>
         )}
         
         {/* KOTAK KATEGORI (ADOBE & SHUTTERSTOCK): Sembunyikan jika Grup 1 atau Grup 2 */}
         {!isGroup1 && !isGroup2 && (
             <div className="flex gap-2 items-center">
               <span className={`${labelClass} ${usesCategory ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>CATEGORY</span>
               <div className={`h-6 w-full relative ${isShutterstock && usesCategory ? 'flex gap-1' : ''}`}>
                  {!usesCategory ? (
                      <div className={`${viewContainerClass} h-full w-full !p-0 px-1 bg-gray-50/50 border-gray-200 opacity-60`}>
                         <div className={`${textBaseClass} ${viewClass} h-full flex items-center justify-center text-gray-400 !py-0 !border-0 !p-0 text-[10px] uppercase tracking-widest font-bold`}>
                            AUTO / NOT REQUIRED
                         </div>
                      </div>
                  ) : isEditing ? (
                     isShutterstock ? (
                        <>
                           <select value={editCategory1} onChange={(e) => setEditCategory1(e.target.value)} className={`flex-1 ${textBaseClass} ${editClass} h-full py-0 pl-1 text-[10px]`}>
                             <option value="" disabled hidden style={{ display: 'none' }}></option>
                             {activeCategories.map(cat => (
                               <option key={cat.id} value={cat.id}>
                                 {language === 'ENG' ? cat.en : cat.id_lang}
                               </option>
                             ))}
                           </select>
                           <select value={editCategory2} onChange={(e) => setEditCategory2(e.target.value)} className={`flex-1 ${textBaseClass} ${editClass} h-full py-0 pl-1 text-[10px]`}>
                             <option value="" disabled hidden style={{ display: 'none' }}></option>
                             {activeCategories.map(cat => (
                               <option key={cat.id} value={cat.id}>
                                 {language === 'ENG' ? cat.en : cat.id_lang}
                               </option>
                             ))}
                           </select>
                        </>
                     ) : (
                        <select value={editCategory1} onChange={(e) => setEditCategory1(e.target.value)} className={`${textBaseClass} ${editClass} h-full py-0 pl-1 text-[10px]`}>
                           <option value="" disabled hidden style={{ display: 'none' }}></option>
                           {activeCategories.map(cat => (
                             <option key={cat.id} value={cat.id}>
                               {language === 'ENG' ? cat.en : cat.id_lang}
                             </option>
                           ))}
                        </select>
                     )
                  ) : (
                     isShutterstock ? (
                        <>
                           <div className={`flex-1 ${viewContainerClass} h-full !p-0 px-1 overflow-hidden`}>
                              <div className={`${textBaseClass} ${viewClass} h-full flex items-center !py-0 !border-0 !p-0 truncate text-[10px] text-gray-600`}>
                                {cat1Name || '\u00A0'}
                              </div>
                           </div>
                           <div className={`flex-1 ${viewContainerClass} h-full !p-0 px-1 overflow-hidden`}>
                              <div className={`${textBaseClass} ${viewClass} h-full flex items-center !py-0 !border-0 !p-0 truncate text-[10px] text-gray-600`}>
                                {cat2Name || '\u00A0'}
                              </div>
                           </div>
                        </>
                     ) : (
                        <div className={`${viewContainerClass} h-full w-full !p-0 px-1`}>
                           <div className={`${textBaseClass} ${viewClass} h-full flex items-center !py-0 !border-0 !p-0 truncate text-[10px] text-gray-600`}>
                             {cat1Name || '\u00A0'}
                           </div>
                        </div>
                     )
                  )}
               </div>
             </div>
         )}

         {/* LANTAI TERAKHIR: KEYWORDS (Dipangkas otomatis kalau mode Dreamstime biar tingginya rata) */}
         <div className="flex flex-col gap-1 flex-1">
            <span className={`${labelClassFull} bg-violet-50 text-violet-600 border-violet-200`}>
                KEYWORDS = {keywordCount}
            </span>
            <div className={`w-full relative ${isDreamstime ? 'h-[4rem]' : 'h-[5.5rem]'}`}>
                {isEditing ? (
                  <textarea value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} className={`${textBaseClass} ${editClass} h-full`} spellCheck={false} />
                ) : (
                  <div className={`${viewContainerClass} h-full`}>
                      <div className={`${textBaseClass} ${viewClass} h-full text-gray-500 whitespace-normal break-words !border-0 !p-0`}>
                        {currentKeywords || '\u00A0'}
                      </div>
                  </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default memo(FileCard);
