import React, { useState, useEffect } from 'react';
import { Play, Pause, Search, BookOpen, Volume2, RefreshCw } from 'lucide-react';

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
  onPlay: (surahId: number, audioUrl: string, surahName: string, reciterName: string) => void;
  onTogglePlay: () => void;
}

const QuranPanel: React.FC<Props> = ({ currentSurahId, isPlaying, onPlay, onTogglePlay }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciterId, setSelectedReciterId] = useState<number>(73); // Default ID 73 = Syaikh Sudais di mp3quran v3
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoadingSurah, setIsLoadingSurah] = useState(true);
  const [isLoadingReciter, setIsLoadingReciter] = useState(true);

  useEffect(() => {
    // 1. Fetch Daftar 114 Surat
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

    // 2. Fetch 150+ Daftar Syaikh / Qari
    fetch('https://mp3quran.net/api/v3/reciters?language=eng')
      .then(res => res.json())
      .then(data => {
        const recitersList = data.reciters.map((r: any) => ({
          id: r.id,
          name: r.name,
          server: r.moshaf[0]?.server || '' // Mengambil URL server audio
        })).filter((r: Reciter) => r.server !== ''); // Buang yang servernya kosong
        
        setReciters(recitersList);
        
        // Pastikan Syaikh Sudais ada, kalau tidak ada fallback ke urutan pertama
        const hasSudais = recitersList.find((r: Reciter) => r.id === 73);
        if (!hasSudais && recitersList.length > 0) {
            setSelectedReciterId(recitersList[0].id);
        }
        setIsLoadingReciter(false);
      })
      .catch(err => {
        console.error("Gagal memuat daftar Qari", err);
        setIsLoadingReciter(false);
      });
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.name_simple.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayClick = (surah: Surah) => {
    // Kalau surat yang diklik sudah aktif (lagi jalan), maka fungsi pause/resume
    if (currentSurahId === surah.id) {
      onTogglePlay();
      return;
    }

    // Kalau surat baru yang diklik, kita rakit URL MP3-nya
    const reciter = reciters.find(r => r.id === selectedReciterId);
    if (!reciter) return;

    // URL Server formatnya: server/001.mp3, server/002.mp3, dst
    const formattedSurahId = String(surah.id).padStart(3, '0');
    const baseUrl = reciter.server.endsWith('/') ? reciter.server : `${reciter.server}/`;
    const audioUrl = `${baseUrl}${formattedSurahId}.mp3`;

    // Lempar data ke pemutar musik pusat di App.tsx
    onPlay(surah.id, audioUrl, surah.name_simple, reciter.name);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-emerald-200 flex flex-col gap-0">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <BookOpen size={18} />
            <h2 className="text-base font-bold uppercase tracking-wide leading-none">Murottal</h2>
          </div>
        </div>

        {/* DROPDOWN PILIH SYAIKH */}
        <div className="flex flex-col mb-3">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pilih Qari / Syaikh (150+ Pilihan)</label>
          <select 
            className="w-full h-9 text-xs px-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
            value={selectedReciterId}
            onChange={(e) => setSelectedReciterId(Number(e.target.value))}
            disabled={isLoadingReciter}
          >
            {isLoadingReciter ? (
              <option>Memuat daftar Qari...</option>
            ) : (
              reciters.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))
            )}
          </select>
        </div>

        {/* INPUT PENCARIAN SURAT */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari surat (ex: Kahf, Yaseen)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-8 pr-3 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* KOTAK DAFTAR SURAT */}
        <div className="border border-gray-200 rounded-md bg-gray-50 flex flex-col h-[380px] md:h-[450px] overflow-hidden">
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
                    className={`flex items-center justify-between p-2 mb-1 rounded-md transition-colors group ${
                      isActive ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-gray-100 hover:border-emerald-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 flex items-center justify-center rounded text-[11px] font-bold shrink-0 shadow-sm ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                        {surah.id}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-800' : 'text-gray-700'}`}>{surah.name_simple}</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest">{surah.verses_count} Ayat</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-arabic ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-400'}`} dir="rtl">{surah.name_arabic}</span>
                      <button 
                        onClick={() => handlePlayClick(surah)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shadow-sm ${
                          isActive 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                            : 'bg-gray-50 hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 border border-gray-200'
                        }`}
                      >
                        {isActive && isPlaying ? <Pause size={14} className="fill-current" /> : (isActive ? <Volume2 size={14} className="animate-pulse" /> : <Play size={14} className="fill-current ml-0.5" />)}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredSurahs.length === 0 && (
                 <div className="h-full flex items-center justify-center text-xs text-gray-400">Surat tidak ditemukan.</div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default QuranPanel;
