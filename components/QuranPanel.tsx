import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, Search, BookOpen, Volume2, RefreshCw, Repeat1, ListVideo, CheckSquare, Square } from 'lucide-react';

interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

interface Reciter {
  id: number;
  name: string;
  server: string;
}

interface Props {
  currentSurahId: number | null;
  isPlaying: boolean;
  onPlay: (surahId: number, audioUrl: string, surahName: string, reciterName: string, baseUrl?: string, surahsList?: any[]) => void;
  onTogglePlay: () => void;
  playbackMode: 'normal' | 'loop' | 'autonext';
  setPlaybackMode: (mode: 'normal' | 'loop' | 'autonext') => void;
}

const QuranPanel: React.FC<Props> = ({ currentSurahId, isPlaying, onPlay, onTogglePlay, playbackMode, setPlaybackMode }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  
  // STATE BARU: Pencarian Ganda
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'surat' | 'qari'>('surat');
  
  // Baca memori pilihan Qari terakhir
  const [selectedReciterId, setSelectedReciterId] = useState<number>(() => {
      const saved = localStorage.getItem('ISA_LAST_QARI');
      return saved ? parseInt(saved, 10) : 0; 
  });
  
  const [isLoadingSurah, setIsLoadingSurah] = useState(true);
  const [isLoadingReciter, setIsLoadingReciter] = useState(true);

  useEffect(() => {
    fetch('https://api.quran.com/api/v4/chapters?language=id')
      .then(res => res.json())
      .then(data => {
        setSurahs(data.chapters);
        setIsLoadingSurah(false);
      })
      .catch(err => {
        console.error("Gagal memuat daftar surat", err);
        setIsLoadingSurah(false);
      });

    fetch('https://mp3quran.net/api/v3/reciters?language=eng')
      .then(res => res.json())
      .then(data => {
        const recitersList = data.reciters.map((r: any) => ({
          id: r.id,
          name: r.name,
          server: r.moshaf[0]?.server || '' 
        })).filter((r: Reciter) => r.server !== ''); 
        
        setReciters(recitersList);
        
        // Logika Pilihan Default/Memori
        const savedId = localStorage.getItem('ISA_LAST_QARI');
        if (savedId && recitersList.some(r => r.id === parseInt(savedId, 10))) {
            setSelectedReciterId(parseInt(savedId, 10));
        } else if (recitersList.length > 0) {
            setSelectedReciterId(recitersList[0].id); // Default urutan paling atas
        }
        
        setIsLoadingReciter(false);
      })
      .catch(err => {
        console.error("Gagal memuat daftar Qari", err);
        setIsLoadingReciter(false);
      });
  }, []);

  // Simpan ke memori tiap kali milih Qari beda
  useEffect(() => {
      if (selectedReciterId !== 0) {
          localStorage.setItem('ISA_LAST_QARI', selectedReciterId.toString());
      }
  }, [selectedReciterId]);

  // === LOGIKA PENCARIAN GANDA ===
  const filteredSurahs = useMemo(() => {
    if (searchMode === 'qari') return surahs; // Kalau nyari Qari, daftar surat tampil utuh
    if (!searchTerm) return surahs;
    return surahs.filter(s => 
      s.name_simple.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.name_arabic.includes(searchTerm) ||
      s.id.toString() === searchTerm
    );
  }, [surahs, searchTerm, searchMode]);

  const filteredReciters = useMemo(() => {
    if (searchMode === 'surat') return reciters; // Kalau nyari Surat, daftar Qari tampil utuh
    if (!searchTerm) return reciters;
    return reciters.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reciters, searchTerm, searchMode]);

  // Auto-select Qari pertama jika hasil filter Qari berubah dan pilihan saat ini tidak ada di list
  useEffect(() => {
    if (searchMode === 'qari' && filteredReciters.length > 0) {
        const isCurrentReciterVisible = filteredReciters.some(r => r.id === selectedReciterId);
        if (!isCurrentReciterVisible) {
            setSelectedReciterId(filteredReciters[0].id);
        }
    }
  }, [filteredReciters, searchMode, selectedReciterId]);

  const handlePlayClick = (surah: Surah) => {
    if (currentSurahId === surah.id) {
      onTogglePlay();
      return;
    }

    const reciter = reciters.find(r => r.id === selectedReciterId);
    if (!reciter) return;

    const formattedSurahId = String(surah.id).padStart(3, '0');
    const baseUrl = reciter.server.endsWith('/') ? reciter.server : `${reciter.server}/`;
    const audioUrl = `${baseUrl}${formattedSurahId}.mp3`;

    onPlay(surah.id, audioUrl, surah.name_simple, reciter.name, baseUrl, surahs);
  };

  const labelClass = "block text-sm font-medium text-gray-500 mb-1 h-5 flex items-center justify-between";
  const inputClass = "w-full text-base p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-300 h-[42px]";

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-emerald-200 flex flex-col gap-4 animate-in fade-in duration-300">
      
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-emerald-500" />
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">Murottal Settings</h2>
      </div>

      <div className="border-t border-emerald-100 -my-2"></div>

      <div className="pt-2">
         <label className="block text-sm font-medium text-gray-500 mb-1 h-5 flex items-center">Mode Pemutaran</label>
         <div className="flex gap-3 p-1 bg-gray-100 rounded-lg w-full h-[46px]">
            <button
               onClick={() => setPlaybackMode('autonext')}
               className={`flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium rounded-md transition-all ${
                 playbackMode === 'autonext' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-500 hover:bg-gray-200'
               }`}
            >
               <ListVideo size={16} />
               Lanjut Otomatis
            </button>
            <button
               onClick={() => setPlaybackMode('loop')}
               className={`flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium rounded-md transition-all ${
                 playbackMode === 'loop' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-500 hover:bg-gray-200'
               }`}
            >
               <Repeat1 size={16} />
               Ulangi Surat
            </button>
         </div>
      </div>

      <div className="pt-1">
        <div className="flex items-center justify-between mb-1.5 h-5">
           <label className="text-sm font-medium text-gray-500 tracking-tight">Cari Data</label>
           {/* SWITCH GAYA FILE/FOLDER/EPS (Diubah jadi Surat/Qari) */}
           <div className="flex gap-4">
              <button 
                onClick={() => { setSearchMode('surat'); setSearchTerm(''); }}
                className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-colors ${searchMode === 'surat' ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-emerald-600'}`}
              >
                {searchMode === 'surat' ? <CheckSquare size={14} className="text-emerald-500" /> : <Square size={14} className="text-gray-300" />}
                Surat
              </button>
              <button 
                onClick={() => { setSearchMode('qari'); setSearchTerm(''); }}
                className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-colors ${searchMode === 'qari' ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-emerald-600'}`}
              >
                {searchMode === 'qari' ? <CheckSquare size={14} className="text-emerald-500" /> : <Square size={14} className="text-gray-300" />}
                Qari
              </button>
           </div>
        </div>
        
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={searchMode === 'surat' ? "Cari surat (ex: Kahf, Yaseen)..." : "Cari nama Qari (ex: Mishary, Sudais)..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      <div className="pt-0">
        <label className={labelClass}>
            <span>Qari / Syaikh</span>
            {searchMode === 'qari' && searchTerm && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold tracking-wider">DITEMUKAN: {filteredReciters.length}</span>
            )}
        </label>
        <select 
          className={inputClass}
          value={selectedReciterId}
          onChange={(e) => setSelectedReciterId(Number(e.target.value))}
          disabled={isLoadingReciter}
        >
          {isLoadingReciter ? (
            <option>Memuat daftar Qari...</option>
          ) : filteredReciters.length === 0 ? (
            <option disabled>Qari tidak ditemukan</option>
          ) : (
            filteredReciters.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))
          )}
        </select>
      </div>

      <div className="pt-1">
         <label className="block text-sm font-medium text-gray-500 mb-1 h-5 flex items-center">Daftar Surat</label>
         <div className="border border-gray-200 rounded-md bg-gray-50 flex flex-col h-[350px] md:h-[400px] overflow-hidden shadow-inner">
           {isLoadingSurah ? (
             <div className="flex-1 flex flex-col items-center justify-center text-emerald-500 gap-2 opacity-50">
               <RefreshCw size={24} className="animate-spin" />
               <span className="text-xs font-medium uppercase tracking-widest">Menyiapkan Surah...</span>
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-gray-200">
               {filteredSurahs.map(surah => {
                 const isActive = currentSurahId === surah.id;
                 return (
                   <div 
                     key={surah.id} 
                     className={`flex items-center justify-between p-2.5 mb-1 rounded-md transition-colors group ${
                       isActive ? 'bg-emerald-100 border border-emerald-300 shadow-sm' : 'bg-white border border-gray-100 hover:border-emerald-200 shadow-sm'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <div className={`w-7 h-7 flex items-center justify-center rounded text-[11px] font-bold shrink-0 shadow-sm ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                         {surah.id}
                       </div>
                       <div className="flex flex-col">
                         <span className={`text-sm font-bold leading-none ${isActive ? 'text-emerald-800' : 'text-gray-700'}`}>{surah.name_simple}</span>
                         <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">{surah.verses_count} Ayat</span>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-3">
                       <span className={`text-lg font-arabic font-medium hidden sm:block ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-400'}`} dir="rtl">{surah.name_arabic}</span>
                       <button 
                         onClick={() => handlePlayClick(surah)}
                         className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shadow-sm shrink-0 active:scale-95 ${
                           isActive 
                             ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' 
                             : 'bg-gray-50 hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 border border-gray-200'
                         }`}
                       >
                         {isActive && isPlaying ? <Pause size={16} className="fill-current" /> : (isActive ? <Volume2 size={16} className="animate-pulse" /> : <Play size={16} className="fill-current ml-0.5" />)}
                       </button>
                     </div>
                   </div>
                 );
               })}
               {filteredSurahs.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium uppercase tracking-wider">Surat tidak ditemukan.</div>
               )}
             </div>
           )}
         </div>
      </div>

    </div>
  );
};

export default QuranPanel;
