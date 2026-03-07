import React, { useState, useEffect } from 'react';
import { Play, Pause, Search, BookOpen, Volume2 } from 'lucide-react';

interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

interface Props {
  currentSurah: number | null;
  isPlaying: boolean;
  onPlaySurah: (id: number) => void;
  onTogglePlay: () => void;
}

const QuranPanel: React.FC<Props> = ({ currentSurah, isPlaying, onPlaySurah, onTogglePlay }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mengambil daftar nama 114 Surat langsung dari API (Sangat Ringan)
    fetch('https://api.quran.com/api/v4/chapters?language=id')
      .then(res => res.json())
      .then(data => {
        setSurahs(data.chapters);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat daftar surat", err);
        setIsLoading(false);
      });
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.name_simple.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-emerald-200 flex flex-col gap-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <BookOpen size={18} />
            <h2 className="text-base font-bold uppercase tracking-wide leading-none">Murottal</h2>
          </div>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Syaikh Sudais</span>
        </div>

        <div className="text-xs text-gray-500 mb-3 leading-relaxed">
          Putar lantunan suci Al-Quran untuk menemani aktivitas *generate* AI Anda. Streaming langsung tanpa membebani memori aplikasi.
        </div>

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

        <div className="border border-gray-200 rounded-md bg-gray-50 flex flex-col h-[380px] overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-emerald-500">
              <RefreshCw size={20} className="animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-gray-200">
              {filteredSurahs.map(surah => {
                const isActive = currentSurah === surah.id;
                return (
                  <div 
                    key={surah.id} 
                    className={`flex items-center justify-between p-2 mb-1 rounded-md transition-colors ${
                      isActive ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-gray-100 hover:border-emerald-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold shrink-0 ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {surah.id}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-800' : 'text-gray-700'}`}>{surah.name_simple}</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest">{surah.verses_count} Ayat</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-arabic ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} dir="rtl">{surah.name_arabic}</span>
                      <button 
                        onClick={() => isActive ? onTogglePlay() : onPlaySurah(surah.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shadow-sm ${
                          isActive 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                            : 'bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-500 border border-gray-200'
                        }`}
                      >
                        {isActive && isPlaying ? <Pause size={14} className="fill-current" /> : (isActive ? <Volume2 size={14} className="animate-pulse" /> : <Play size={14} className="fill-current ml-0.5" />)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuranPanel;
