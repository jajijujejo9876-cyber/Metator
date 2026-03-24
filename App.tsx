import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Download, Trash2, Wand2, UploadCloud, FolderOutput, CheckCircle, XCircle, Clock, Database, Activity, Sparkles, Eraser, Lightbulb, Command, Settings, Pause, Play, Copy, Loader2, Menu, PlayCircle, Coffee, Volume2, X, ShieldCheck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import ApiKeyPanel from './components/ApiKeyPanel';
import MetadataSettings from './components/MetadataSettings';
import IdeaSettings from './components/IdeaSettings';
import PromptSettings from './components/PromptSettings';
import FileCard from './components/FileCard';
import IdeaListComponent from './components/IdeaListComponent'; 
import PromptListComponent from './components/PromptListComponent';
import PreviewModal from './components/PreviewModal';
import QuranPanel from './components/QuranPanel'; 
import QcSettings from './components/QcSettings'; 
import QcCard from './components/QcCard';         
import { generateMetadataForFile, translateMetadataContent } from './services/geminiService';
import { downloadCSV, downloadTXT, extractSlugFromUrl } from './utils/helpers';
import { AppSettings, FileItem, FileType, ProcessingStatus, Language, AppMode, ApiProvider } from './types';
import { INITIAL_METADATA } from './constants';

// === KOMPONEN WIDGET MELAYANG (DRAGGABLE) ===
const DraggablePlayer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const updatePos = (newPos: { x: number, y: number }) => {
    setPos(newPos);
    posRef.current = newPos;
  };

  const handleStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    dragStart.current = { x: clientX - posRef.current.x, y: clientY - posRef.current.y };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    updatePos({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onUp = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center animate-in slide-in-from-bottom-4"
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      <div 
        className="w-full h-6 bg-emerald-100/90 backdrop-blur-md rounded-t-xl flex items-center justify-center cursor-grab active:cursor-grabbing border border-b-0 border-emerald-200"
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      >
        <div className="w-10 h-1.5 bg-emerald-300/80 rounded-full" />
      </div>
      <div className="bg-white/95 backdrop-blur-md border border-t-0 border-emerald-200 shadow-2xl rounded-b-xl w-64 pointer-events-auto">
         {children}
      </div>
    </div>
  );
};
// ============================================

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  mode?: AppMode | 'system'; 
}

const DEFAULT_FORBIDDEN_WORDS = "Apple, Samsung, Nike, Adidas, Gucci, Rolex, Coca-Cola, Pepsi, Disney, Lego, Microsoft, Google, Sony, Nikon, Canon, Facebook, Instagram, Twitter, TikTok, iPhone, iPad, Galaxy, Eiffel Tower Night, Hollywood Sign, Red Cross, Olympic Rings, United Nations, Vatican City, 4K, HD, High Quality, Award Winning, Best, Professional, Photo, Image, Shot on, Shot with, Watermark, Logo, Signature, Copyright, Trademark, Brand, Patent, Patent Pending, All Rights Reserved, Blurred, Out of focus, Grainy, Noisy, Low resolution, Porn, Sex, Nude, Violence, Bloody, Israel, North Korea, Crimea, Restricted Area, Top Secret";

const IDEA_FORBIDDEN_WORDS = "porn, sex, nude, naked, xxx, erotic, boobs, tits, pussy, fuck, dick, cock, penis, vagina, ass, orgasm, masturbate, bitch, whore, slut, milf, fetish, bdsm, rape, incest, anal, blowjob, cum, ejaculate, hentai, stripper, escort, hot girl, 18+, adult, bathroom, toilet, change clothes, undress, bhabhi, auntie, desi, upskirt, birth, pregnant, bloody, injury, gore";

const rawStringify = (val: any): string => {
    if (val === null || val === undefined) return String(val);
    if (typeof val === 'string') return val;
    if (val instanceof Error) {
        return `[Error] ${val.message}${val.stack ? `\nStack: ${val.stack}` : ''}`;
    }
    try {
        return JSON.stringify(val, Object.getOwnPropertyNames(val), 2);
    } catch (e) {
        return String(val);
    }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppMode | 'logs' | 'apikeys' | 'quran'>('apikeys');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logViewMode, setLogViewMode] = useState<'transparent' | 'clipped'>('clipped');   
  const [showErrorDict, setShowErrorDict] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isMounted, setIsMounted] = useState(false);
  
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const settingBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { 
      setIsMounted(true); 
      setTimeout(() => {
          if (menuScrollRef.current && settingBtnRef.current) {
              const offsetLeft = settingBtnRef.current.offsetLeft;
              menuScrollRef.current.scrollTo({
                  left: offsetLeft - 6,
                  behavior: 'smooth'
              });
          }
      }, 300);
  }, []);

  const [ispaidUnlocked, setIspaidUnlocked] = useState(false);

  // === STATE & REF UNTUK RADIO GAIB (MUROTTAL) ===
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentSurahId, setCurrentSurahId] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentSurahName, setCurrentSurahName] = useState("");
  const [currentReciterName, setCurrentReciterName] = useState("");
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  
  const [playbackMode, setPlaybackMode] = useState<'normal' | 'loop' | 'autonext'>('autonext');
  
  const [audioBaseUrl, setAudioBaseUrl] = useState("");
  const [quranSurahs, setQuranSurahs] = useState<any[]>([]);

  const handlePlayAudio = (surahId: number, audioUrl: string, surahName: string, reciterName: string, baseUrl?: string, surahsList?: any[]) => {
    if (audioRef.current) {
      if (currentSurahId !== surahId) {
        audioRef.current.src = audioUrl;
        setCurrentSurahId(surahId);
        setCurrentSurahName(surahName);
        setCurrentReciterName(reciterName);
        if (baseUrl) setAudioBaseUrl(baseUrl);
        if (surahsList) setQuranSurahs(surahsList);
      }
      audioRef.current.play();
      setIsAudioPlaying(true);
      setShowMiniPlayer(true); 
    }
  };

  const handleToggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        audioRef.current.play();
        setIsAudioPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    if (!audioRef.current) return;

    if (playbackMode === 'loop') {
      audioRef.current.play(); 
    } else if (playbackMode === 'autonext' && currentSurahId && currentSurahId < 114 && audioBaseUrl && quranSurahs.length > 0) {
      const nextId = currentSurahId + 1;
      const nextSurah = quranSurahs.find(s => s.id === nextId);
      const formattedId = String(nextId).padStart(3, '0');
      const nextUrl = `${audioBaseUrl}${formattedId}.mp3`;
      handlePlayAudio(nextId, nextUrl, nextSurah?.name_simple || `Surah ${nextId}`, currentReciterName, audioBaseUrl, quranSurahs);
    } else {
      setIsAudioPlaying(false);
    }
  };

  const closeMiniPlayer = () => {
      setShowMiniPlayer(false);
  };
  // ===============================================

  // === LACI MEMORI API KEMBAR (GEMINI & GROQ) ===
  const [apiKeys, setApiKeys] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('ISA_GEMINI_KEYS');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });
  const [groqKeys, setGroqKeys] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('ISA_GROQ_KEYS');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });

  useEffect(() => {
      localStorage.setItem('ISA_GEMINI_KEYS', JSON.stringify(apiKeys));
  }, [apiKeys]);
  useEffect(() => {
      localStorage.setItem('ISA_GROQ_KEYS', JSON.stringify(groqKeys));
  }, [groqKeys]);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaultSettings: AppSettings = {
      apiProvider: 'GEMINI CANVAS', 
      geminiModel: 'gemini-2.5-flash',
      customTitle: '',
      customKeyword: '',
      negativeMetadata: DEFAULT_FORBIDDEN_WORDS,
      ideaNegativeContext: IDEA_FORBIDDEN_WORDS,
      metadataPlatform: 'Adobe Stock',
      titleMin: 50, 
      titleMax: 100,
      slideKeyword: 40,
      videoFrameCount: 3,
      workerCount: 5,
      apiDelay: 3,      
      ideaMode: 'free', 
      ideaQuantity: 30, 
      ideaCategory: 'auto',
      ideaCustomInput: '',
      ideaCustomInstruction: '', 
      ideaSourceFiles: [], 
      ideaFromRow: 1, 
      ideaBatchSize: 10, 
      ideaSourceLines: [],
      ideaWorkerCount: 50,
      promptIdea: '',
      promptDescription: '',
      promptQuantity: 30,
      promptPlatform: 'text',
      promptSourceFiles: [],
      csvFilename: '',
      outputFormat: 'csv',
    };

    try {
      const savedSettings = localStorage.getItem('ISA_APP_SETTINGS');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return { 
          ...defaultSettings, 
          ...parsed, 
          ideaSourceFiles: [], 
          promptSourceFiles: [], 
        };
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    return defaultSettings;
  });
  
  const [filesMap, setFilesMap] = useState<Record<string, FileItem[]>>({
    metadata_universal: [],
    idea_free: [],
    idea_paid: [],
    prompt_text: [], 
    prompt_file: [],
    qc: []
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [processingMode, setProcessingMode] = useState<AppMode | null>(null);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const [fileLanguages, setFileLanguages] = useState<Record<string, Language>>({});

  const processingRef = useRef(false);
  const pausedRef = useRef(false);
  const activeWorkersRef = useRef(0);
  const queueRef = useRef<string[]>([]);
  const globalCooldownRef = useRef<number>(0);

  const activeKeysRef = useRef<Set<string>>(new Set());
  const cooldownKeysRef = useRef<Map<string, number>>(new Map());
  const nextKeyIdxRef = useRef(0);
  
  const processingFilesRef = useRef<FileItem[]>([]); 

  const sidebarContentRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const getActiveDataKey = () => {
    if (activeTab === 'idea') return settings.ideaMode === 'free' ? 'idea_free' : 'idea_paid';
    if (activeTab === 'prompt') return settings.promptPlatform === 'file' ? 'prompt_file' : 'prompt_text';
    if (activeTab === 'metadata') return 'metadata_universal';
    if (activeTab === 'qc') return 'qc';
    return activeTab as string;
  };

  const activeDataKey = getActiveDataKey();
  const activeMode: AppMode = (activeTab === 'logs' || activeTab === 'apikeys' || activeTab === 'quran') ? 'metadata' : (activeTab as AppMode);
  const currentFiles = filesMap[activeDataKey] || [];
  
  const [hasHistory, setHasHistory] = useState(() => {
    try { return !!localStorage.getItem('ISA_LAST_IDEA_BATCH'); } catch(e) { return false; }
  });
  const [hasPromptTextHistory, setHasPromptTextHistory] = useState(() => {
    try { return !!localStorage.getItem('ISA_LAST_PROMPT_TEXT_BATCH'); } catch(e) { return false; }
  });
  const [hasPromptFileHistory, setHasPromptFileHistory] = useState(() => {
    try { return !!localStorage.getItem('ISA_LAST_PROMPT_FILE_BATCH'); } catch(e) { return false; }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const settingsToSave = { ...settings, ideaSourceFiles: [], promptSourceFiles: [] };
    localStorage.setItem('ISA_APP_SETTINGS', JSON.stringify(settingsToSave));
  }, [settings]);

  useEffect(() => {
    if (logsContainerRef.current && !showErrorDict) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, activeTab, logViewMode, showErrorDict]);

  useEffect(() => {
    if (!isProcessing || !processingMode) return;

    const heartbeat = setInterval(() => {
        if (processingFilesRef.current) {
            const processingDataKey = (() => {
                if (processingMode === 'idea') return settings.ideaMode === 'free' ? 'idea_free' : 'idea_paid';
                if (processingMode === 'prompt') return settings.promptPlatform === 'file' ? 'prompt_file' : 'prompt_text';
                if (processingMode === 'qc') return 'qc';
                return 'metadata_universal';
            })();

            setFilesMap(prev => ({
                ...prev,
                [processingDataKey]: [...processingFilesRef.current]
            }));
        }
    }, 500); 

    return () => clearInterval(heartbeat);
  }, [isProcessing, processingMode, settings.ideaMode, settings.metadataPlatform, settings.promptPlatform]);

  useLayoutEffect(() => {
    if (sidebarContentRef.current) sidebarContentRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab, settings.metadataPlatform, settings.promptPlatform]);

  const handleNavigation = (tab: AppMode | 'logs' | 'apikeys' | 'quran') => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0'); 
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', mode: AppMode | 'system' = 'system') => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, {
      id: uuidv4(),
      time: timeString,
      message,
      type,
      mode
    }]);
  };

  const handleClearLogs = () => {
    setLogs([]);
    addLog('Logs cleared by user.', 'info', 'system');
  };

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    const logText = logs.map(l => `[${l.time}] [${(l.mode || 'sys').toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    addLog('All logs copied to clipboard.', 'success', 'system');
  };

  const processFiles = (fileList: FileList, targetMode: AppMode) => {
    const count = fileList.length;
    addLog(`Uploaded ${count} files to ${targetMode.toUpperCase()}.`, 'info', targetMode);

    const createdItems: FileItem[] = Array.from(fileList)
      .filter(file => {
        const type = file.type.toLowerCase();
        const name = file.name.toLowerCase();
        const isImg = type.startsWith('image/') && !type.includes('svg');
        const isVid = type.startsWith('video/');
        const isVec = type === 'image/svg+xml' || type === 'application/pdf' || name.endsWith('.svg') || name.endsWith('.eps') || name.endsWith('.ai') || name.endsWith('.pdf');
        return isImg || isVid || isVec;
      })
      .map((file: File) => {
        const type = file.type.toLowerCase();
        const name = file.name.toLowerCase();
        let fileType = FileType.Image;
        if (type.startsWith('video/')) fileType = FileType.Video;
        else if (type === 'image/svg+xml' || type === 'application/pdf' || name.endsWith('.svg') || name.endsWith('.eps') || name.endsWith('.ai') || name.endsWith('.pdf')) {
            fileType = FileType.Vector;
        }
        
        return {
            id: uuidv4(),
            file,
            previewUrl: URL.createObjectURL(file), 
            type: fileType,
            status: ProcessingStatus.Pending,
            metadata: JSON.parse(JSON.stringify(INITIAL_METADATA)), 
        };
      });
      
    setFilesMap(prev => {
      const newState = { ...prev };
      newState[activeDataKey] = [...(prev[activeDataKey] || []), ...createdItems];
      return newState;
    });
  };

  const handleClearAll = () => {
    if (activeTab === 'logs' || activeTab === 'apikeys' || activeTab === 'quran') return;
    if (isProcessing && processingMode === activeTab && !isPaused) return;

    const count = filesMap[activeDataKey].length;
    filesMap[activeDataKey].forEach(f => {
      URL.revokeObjectURL(f.previewUrl);
      if (f.generatedImageUrl && f.generatedImageUrl.startsWith('blob:')) URL.revokeObjectURL(f.generatedImageUrl);
    });
    
    setFilesMap(prev => ({ ...prev, [activeDataKey]: [] }));
    
    setSettings(prev => ({ ...prev, epsMode: false })); 
    
    if (processingMode === activeTab) {
        setIsProcessing(false);
        setIsPaused(false);
        setProcessingMode(null);
        processingRef.current = false;
        pausedRef.current = false;
    }
    
    addLog(`Cleared all ${count} files from ${activeDataKey.toUpperCase()}.`, 'warning', activeTab as AppMode);
  };

  const handleRestoreHistory = () => {
      try {
          const saved = localStorage.getItem('ISA_LAST_IDEA_BATCH');
          if (saved) {
              const parsed = JSON.parse(saved);
              const restoredFiles: FileItem[] = parsed.map((item: any) => ({
                  ...item,
                  file: new File([""], item.file?.name || "restored_idea", { type: item.file?.type || 'text/plain' }),
                  status: ProcessingStatus.Completed 
              }));
              
              const key = settings.ideaMode === 'free' ? 'idea_free' : 'idea_paid';
              
              setFilesMap(prev => ({ 
                ...prev, 
                [key]: restoredFiles 
              }));
              
              addLog(`Restored ${restoredFiles.length} items from history.`, 'success', 'idea');
          }
      } catch (e) {
          console.error("Failed to restore history", e);
          addLog("Failed to restore history.", 'error', 'idea');
      }
  };

  const handleRestorePromptHistory = () => {
      try {
          const isFileMode = settings.promptPlatform === 'file';
          const storageKey = isFileMode ? 'ISA_LAST_PROMPT_FILE_BATCH' : 'ISA_LAST_PROMPT_TEXT_BATCH';
          const saved = localStorage.getItem(storageKey);
          
          if (saved) {
              const parsed = JSON.parse(saved);
              const restoredFiles: FileItem[] = parsed.map((item: any) => ({
                  ...item,
                  file: new File([""], item.file?.name || "restored_prompt", { type: item.file?.type || 'text/plain' }),
                  status: ProcessingStatus.Completed 
              }));
              
              setFilesMap(prev => ({ ...prev, [isFileMode ? 'prompt_file' : 'prompt_text']: restoredFiles }));
              addLog(`Restored ${restoredFiles.length} prompts from ${isFileMode ? 'File' : 'Text'} history.`, 'success', 'prompt');
          }
      } catch (e) {
          console.error("Failed to restore prompt history", e);
          addLog("Failed to restore prompt history.", 'error', 'prompt');
      }
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'logs' || activeTab === 'apikeys' || activeTab === 'quran') return;
    const file = filesMap[activeDataKey].find(f => f.id === id);
    if (file && file.status === ProcessingStatus.Processing) {
        addLog("Cannot delete item while it is processing.", 'warning', activeTab as AppMode);
        return;
    }
    if (file) {
      URL.revokeObjectURL(file.previewUrl);
      if (file.generatedImageUrl && file.generatedImageUrl.startsWith('blob:')) URL.revokeObjectURL(file.generatedImageUrl);
      addLog(`Deleted item: ${file.file.name}`, 'warning', activeTab as AppMode);
    }
    setFilesMap(prev => {
        const newState = {
            ...prev,
            [activeDataKey]: prev[activeDataKey].filter(f => f.id !== id)
        };
        if (activeTab === 'prompt') {
            const isFileMode = settings.promptPlatform === 'file';
            const storageKey = isFileMode ? 'ISA_LAST_PROMPT_FILE_BATCH' : 'ISA_LAST_PROMPT_TEXT_BATCH';
            
            if (newState[activeDataKey].length > 0) {
              localStorage.setItem(storageKey, JSON.stringify(newState[activeDataKey]));
              if (isFileMode) setHasPromptFileHistory(true); else setHasPromptTextHistory(true);
            } else {
              localStorage.removeItem(storageKey);
              if (isFileMode) setHasPromptFileHistory(false); else setHasPromptTextHistory(false);
            }
        }
        if (activeTab === 'idea') {
            if (newState[activeDataKey].length > 0) {
              localStorage.setItem('ISA_LAST_IDEA_BATCH', JSON.stringify(newState[activeDataKey]));
              setHasHistory(true);
            } else {
              localStorage.removeItem('ISA_LAST_IDEA_BATCH');
              setHasHistory(false);
            }
        }
        return newState;
    });
  };

  const handleUpdateMetadata = async (id: string, field: 'title' | 'description' | 'keywords' | 'category' | 'categoryShutter', value: string, language: Language) => {
    if (activeTab === 'logs' || activeTab === 'apikeys' || activeTab === 'quran') return;
    
    setFilesMap(prev => ({
      ...prev,
      [activeDataKey]: prev[activeDataKey].map(f => {
        if (f.id !== id) return f;
        const newMeta = { ...f.metadata };
        if (field === 'category' || field === 'categoryShutter') {
           newMeta[field] = value;
        } else {
           if (language === 'ENG') {
             newMeta.en = { ...newMeta.en, [field]: value };
           } else {
             newMeta.ind = { ...newMeta.ind, [field]: value };
           }
        }
        return { ...f, metadata: newMeta };
      })
    }));

    if (field === 'title' || field === 'keywords') {
      const file = filesMap[activeDataKey].find(f => f.id === id);
      if (!file) return; 
      
      try {
        const currentSourceMeta = language === 'ENG' 
          ? { ...file.metadata.en, [field]: value } 
          : { ...file.metadata.ind, [field]: value };
        
        const translated = await translateMetadataContent(currentSourceMeta, language, "");
        
        setFilesMap(prev => ({
          ...prev,
          [activeDataKey]: prev[activeDataKey].map(f => {
            if (f.id !== id) return f;
            const newMeta = { ...f.metadata };
            // FIX: Gunakan spread operator biar data 'description' tidak terhapus saat auto-translate!
            if (language === 'ENG') {
              newMeta.ind = { ...newMeta.ind, title: translated.title, keywords: translated.keywords };
            } else {
              newMeta.en = { ...newMeta.en, title: translated.title, keywords: translated.keywords };
            }
            return { ...f, metadata: newMeta };
          })
        }));
      } catch (error) {
        console.error("Sync translation failed", error);
      }
    }
  };
  
  const handleToggleLanguage = (id: string) => {
    setFileLanguages(prev => ({
      ...prev,
      [id]: prev[id] === 'IND' ? 'ENG' : 'IND'
    }));
  };

  const getLanguage = (id: string): Language => {
    return fileLanguages[id] || 'ENG';
  };

  const handleDownload = async (customFilename?: string) => {
    if (activeTab === 'logs' || activeTab === 'apikeys' || activeTab === 'quran') return;
    
    const completedItems = filesMap[activeDataKey].filter(f => f.status === ProcessingStatus.Completed);
    if (completedItems.length === 0) return;
    if (isProcessing && processingMode === activeTab && !isPaused) return;

    let defaultBase = 'IsaMetadata';
    if (activeTab === 'idea') {
        defaultBase = settings.ideaMode === 'free' ? 'IsaIdea_Mode1' : 'IsaIdea_Mode2';
    }
    if (activeTab === 'prompt') {
        defaultBase = settings.promptPlatform === 'file' ? 'IsaPrompt_File' : 'IsaPrompt_Teks';
    }

    const filenameToUse = settings.csvFilename.trim() || defaultBase;
    const targetFiles = filesMap[activeDataKey];

    if ((activeTab === 'idea' || activeTab === 'prompt') && settings.outputFormat === 'txt') {
        const filename = downloadTXT(targetFiles, filenameToUse);
        addLog(`Exported TXT: ${filename}`, 'success', activeTab as AppMode);
    } else {
        const filename = downloadCSV(targetFiles, filenameToUse, settings.metadataPlatform, settings);
        addLog(`Exported CSV: ${filename}`, 'success', activeTab as AppMode);
    }
  };

  const startProcessing = () => {
      if (activeTab === 'logs' || activeTab === 'apikeys' || activeTab === 'quran') return;
      const currentMode = activeTab as AppMode;

      if (isProcessing) {
          alert(`Sistem sedang memproses mode ${processingMode?.toUpperCase()}. Silakan tunggu atau pause proses tersebut sebelum memulai yang baru.`);
          return;
      }

      // === LOGIKA CEK KUNCI PROVIDER YANG BENAR ===
      if (settings.apiProvider === 'GEMINI API' && apiKeys.length === 0) {
          alert("Kamu memilih mode GEMINI API tapi belum memasukkan API Key satupun. Silakan masukkan API Key di menu Settings.");
          return;
      }
      if (settings.apiProvider === 'GROQ API' && groqKeys.length === 0) {
          alert("Kamu memilih mode GROQ API tapi belum memasukkan API Key satupun. Silakan masukkan API Key di menu Settings.");
          return;
      }
      
      // ==================== MODE PROMPT ====================
      if (currentMode === 'prompt') {
         const isFileMode = settings.promptPlatform === 'file';
  
         if (isFileMode) {
             const targetFiles = filesMap['prompt_file'].filter(f => f.status === ProcessingStatus.Pending || f.status === ProcessingStatus.Failed);
             if (targetFiles.length === 0) {
                 const resetFiles = filesMap['prompt_file'].map(f => ({ ...f, status: ProcessingStatus.Pending, error: undefined }));
                 setFilesMap(prev => ({ ...prev, prompt_file: resetFiles }));
                 runQueue(resetFiles, currentMode);
             } else {
                 runQueue(targetFiles, currentMode);
             }
             return;
         } else {
             const virtualFiles: FileItem[] = [];
             const quantity = settings.promptQuantity;
             for (let i = 0; i < quantity; i++) {
               virtualFiles.push({
                 id: uuidv4(),
                 file: new File([""], `Prompt_${i+1}`, { type: 'text/plain' }),
                 previewUrl: "",
                 type: FileType.Image,
                 status: ProcessingStatus.Pending,
                 metadata: JSON.parse(JSON.stringify(INITIAL_METADATA)),
                 sourceData: { id: i + 1, originalTitle: settings.promptIdea, originalKeywords: settings.promptDescription }
               });
             }
             addLog(`Generated ${quantity} prompt slots. Idea: ${settings.promptIdea}`, 'info', 'prompt');
             setFilesMap(prev => ({ ...prev, prompt_text: virtualFiles }));
             runQueue(virtualFiles, currentMode);
             return;
         }
      }
  
      // ==================== MODE IDEA ====================
      if (currentMode === 'idea') {
        let virtualFiles: FileItem[] = [];
  
        if (settings.ideaMode === 'free') {
            if (settings.ideaCategory === 'custom' && !settings.ideaCustomInput) { alert("Enter custom topic."); return; }
  
            const sourceFiles = settings.ideaSourceFiles || [];
            if (settings.ideaCategory === 'file' && sourceFiles.length === 0) { alert("Upload Image/Video files."); return; }
            
            let contextLabel = settings.ideaCategory === 'custom' ? settings.ideaCustomInput : settings.ideaCategory;
            const quantityPerItem = settings.ideaQuantity || 30; 
            
            if (settings.ideaCategory === 'file' && sourceFiles.length > 0) {
                sourceFiles.forEach((file, fileIdx) => {
                   for (let i = 0; i < quantityPerItem; i++) {
                       let type = file.type.startsWith('video') ? FileType.Video : FileType.Image;
                       virtualFiles.push({
                           id: uuidv4(),
                           file: file, 
                           previewUrl: URL.createObjectURL(file),
                           type: type,
                           status: ProcessingStatus.Pending,
                           metadata: JSON.parse(JSON.stringify(INITIAL_METADATA)),
                           sourceData: { id: (fileIdx * quantityPerItem) + i + 1, originalTitle: `File: ${file.name}`, originalKeywords: settings.ideaCategory }
                        });
                   }
                });
            } else {
                for (let i = 0; i < quantityPerItem; i++) {
                   virtualFiles.push({
                       id: uuidv4(),
                       file: new File([""], `Idea_${i+1}`, { type: 'text/plain' }),
                       previewUrl: "",
                       type: FileType.Image,
                       status: ProcessingStatus.Pending,
                       metadata: JSON.parse(JSON.stringify(INITIAL_METADATA)),
                       sourceData: { id: i + 1, originalTitle: contextLabel, originalKeywords: settings.ideaCategory }
                    });
                }
            }
            setFilesMap(prev => ({ ...prev, idea_free: virtualFiles }));
            runQueue(virtualFiles, currentMode);
            
        } else {
            const from = settings.ideaFromRow || 1;
            const batchSize = settings.ideaBatchSize || 0; 
            const sourceLines = settings.ideaSourceLines || [];
            if (sourceLines.length === 0) { alert("Please upload a file."); return; }
            const slicedLines = sourceLines.slice(Math.max(0, from - 1), Math.min(sourceLines.length, Math.max(0, from - 1) + batchSize));
            
            virtualFiles = slicedLines.map((line, index) => {
              const cleanSlug = extractSlugFromUrl(line); 
              const meta = JSON.parse(JSON.stringify(INITIAL_METADATA));
              meta.en.title = cleanSlug;
              meta.ind.title = cleanSlug;
              return {
                id: uuidv4(),
                file: new File([""], `Idea_Row_${from + index}`, { type: 'text/plain' }), 
                previewUrl: "", 
                type: FileType.Image, 
                status: ProcessingStatus.Pending, 
                metadata: meta,
                sourceData: { id: from + index, originalTitle: cleanSlug, originalKeywords: line }
              };
            });
            setFilesMap(prev => ({ ...prev, idea_paid: virtualFiles }));
            
            runQueue(virtualFiles, currentMode); 
        }
        return;
      }
  
      // ==================== MODE METADATA & QC ====================
      const targetList = filesMap[activeDataKey];
      const targetFiles = targetList.filter(f => f.status === ProcessingStatus.Pending || f.status === ProcessingStatus.Failed);
      
      if (targetFiles.length === 0) {
        const resetFiles = targetList.map(f => ({ ...f, status: ProcessingStatus.Pending, error: undefined }));
        setFilesMap(prev => ({ ...prev, [activeDataKey]: resetFiles }));
        runQueue(resetFiles, currentMode);
        return;
      }
      
      runQueue(targetFiles, currentMode);
  };
  
  const runQueue = (filesToProcess: FileItem[], mode: AppMode) => {
      setIsProcessing(true);
      setIsPaused(false);
      setProcessingMode(mode);
      processingRef.current = true;
      pausedRef.current = false;
      activeWorkersRef.current = 0;
      
      const processingDataKey = (() => {
        if (mode === 'idea') return settings.ideaMode === 'free' ? 'idea_free' : 'idea_paid';
        if (mode === 'prompt') return settings.promptPlatform === 'file' ? 'prompt_file' : 'prompt_text';
        if (mode === 'qc') return 'qc';
        return 'metadata_universal';
      })();

      setFilesMap(currentMap => {
          processingFilesRef.current = [...currentMap[processingDataKey]];
          return currentMap;
      });
  
      queueRef.current = filesToProcess.map(f => f.id); 
      activeKeysRef.current.clear(); 
      
      const isLocalExtraction = mode === 'idea' && settings.ideaMode === 'paid';
      const userMaxWorkers = isLocalExtraction ? (settings.ideaWorkerCount || 50) : (settings.workerCount || 5);
      
      // === LOGIKA BOTTLENECK CERDAS UNTUK WORKER ===
      let maxConcurrency = Math.min(userMaxWorkers, filesToProcess.length);
      
      if (settings.apiProvider === 'GEMINI API' && apiKeys.length > 0) {
          maxConcurrency = Math.min(maxConcurrency, apiKeys.length);
      } else if (settings.apiProvider === 'GROQ API' && groqKeys.length > 0) {
          maxConcurrency = Math.min(maxConcurrency, groqKeys.length);
      }
      
      maxConcurrency = Math.max(1, maxConcurrency);
        
      addLog(`Menjalankan ${maxConcurrency} worker menggunakan ${settings.apiProvider}...`, 'info', mode);
  
      for (let i = 0; i < maxConcurrency; i++) {
        setTimeout(() => spawnWorker(i + 1, mode), i * 100);
      }
  };
  
  const togglePause = () => {
      if (!isProcessing) return;
      const nextPausedState = !isPaused;
      setIsPaused(nextPausedState);
      pausedRef.current = nextPausedState;
      addLog(nextPausedState ? "Proses dihentikan sementara (Paused)." : "Proses dilanjutkan (Resumed).", nextPausedState ? 'warning' : 'info', processingMode || 'metadata');
  };
  
  const spawnWorker = async (workerId: number, mode: AppMode) => {
      if (!processingRef.current) return;
      if (pausedRef.current) {
          setTimeout(() => spawnWorker(workerId, mode), 500);
          return;
      }

      const now = Date.now();

      if (globalCooldownRef.current && now < globalCooldownRef.current) {
          setTimeout(() => spawnWorker(workerId, mode), 1000);
          return;
      }

      const fileId = queueRef.current.shift();
      if (!fileId) {
        checkCompletion(mode);
        return;
      }
  
      activeWorkersRef.current++;

      let selectedKey: string = "";
      
      // === AMBIL LACI KUNCI YANG SESUAI PROVIDER ===
      const currentKeyList = settings.apiProvider === 'GROQ API' ? groqKeys : apiKeys;
      const totalKeys = currentKeyList.length;

      if ((settings.apiProvider === 'GEMINI API' || settings.apiProvider === 'GROQ API') && totalKeys > 0) {
          for (const [key, expiry] of cooldownKeysRef.current.entries()) {
            if (now > expiry) cooldownKeysRef.current.delete(key);
          }
      
          for (let i = 0; i < totalKeys; i++) {
            const idx = (nextKeyIdxRef.current + i) % totalKeys;
            const keyCandidate = currentKeyList[idx];
            if (!activeKeysRef.current.has(keyCandidate) && !cooldownKeysRef.current.has(keyCandidate)) {
              selectedKey = keyCandidate;
              nextKeyIdxRef.current = (idx + 1) % totalKeys;
              break;
            }
          }

          if (!selectedKey) {
            queueRef.current.unshift(fileId);
            activeWorkersRef.current--;
            setTimeout(() => spawnWorker(workerId, mode), 2000); 
            return;
          }
          activeKeysRef.current.add(selectedKey);
      }

      const isLocalExtraction = mode === 'idea' && settings.ideaMode === 'paid';
      const fileIndex = processingFilesRef.current.findIndex(f => f.id === fileId);

      if (fileIndex !== -1) {
          processingFilesRef.current[fileIndex] = { ...processingFilesRef.current[fileIndex], status: ProcessingStatus.Processing, error: undefined };
      }
      
      const currentFileItem = processingFilesRef.current[fileIndex];
  
      try {
        if (!currentFileItem) throw new Error("File aborted or not found");

        if (isLocalExtraction) {
             if (fileIndex !== -1) {
                 processingFilesRef.current[fileIndex] = { 
                     ...processingFilesRef.current[fileIndex], 
                     status: ProcessingStatus.Completed 
                 };
             }
        } else {
             const { metadata, thumbnail, generatedImageUrl, qcResult } = await generateMetadataForFile(currentFileItem, settings, selectedKey, mode);
      
             if (fileIndex !== -1) {
                 processingFilesRef.current[fileIndex] = { 
                     ...processingFilesRef.current[fileIndex], 
                     status: ProcessingStatus.Completed, 
                     metadata, thumbnail, generatedImageUrl, qcResult 
                 };
             }
             
             const keyLabel = settings.apiProvider === 'GEMINI CANVAS' ? `Canvas Routing` : `Key ${currentKeyList.indexOf(selectedKey) + 1}`;
             addLog(`Worker ${workerId} (${keyLabel}) [Sukses] ${currentFileItem.file.name}`, 'success', mode);
             if (selectedKey) activeKeysRef.current.delete(selectedKey);
        }

      } catch (error: any) {
        if (selectedKey) activeKeysRef.current.delete(selectedKey);

        const rawErrorMsg = rawStringify(error);
        const errorMsgLower = rawErrorMsg.toLowerCase();
        
        if (errorMsgLower.includes('file aborted')) return; 
  
        const isTemporaryError = errorMsgLower.includes('429') || errorMsgLower.includes('quota') || errorMsgLower.includes('overloaded') || errorMsgLower.includes('timeout') || errorMsgLower.includes('fetch failed');
  
        if (isTemporaryError) {
          queueRef.current.push(fileId);
          
          if ((settings.apiProvider === 'GEMINI API' || settings.apiProvider === 'GROQ API') && selectedKey) {
             cooldownKeysRef.current.set(selectedKey, Date.now() + 60000); 
             addLog(`Worker ${workerId} Terlimit (Ganti Kunci / Cooldown 60s). Detail: ${rawErrorMsg}`, 'warning', mode);
          } else {
             globalCooldownRef.current = Date.now() + 60000; 
             addLog(`LIMIT SERVER ${settings.apiProvider}! Semua worker istirahat 60 detik. Detail: ${rawErrorMsg}`, 'warning', mode);
          }
          
          if (fileIndex !== -1) {
              processingFilesRef.current[fileIndex] = { ...processingFilesRef.current[fileIndex], status: ProcessingStatus.Pending };
          }
        } else {
          console.error("Worker Execution Failed:", error);
          if (fileIndex !== -1) {
              processingFilesRef.current[fileIndex] = { 
                  ...processingFilesRef.current[fileIndex], 
                  status: ProcessingStatus.Failed, 
                  error: rawErrorMsg
              };
          }
          addLog(`Worker ${workerId} [Gagal] ${rawErrorMsg}`, 'error', mode);
        }
      }
      
      activeWorkersRef.current--;
      const delayInMs = isLocalExtraction ? 10 : (settings.apiDelay && settings.apiDelay >= 1 ? settings.apiDelay : 1) * 1000;
      setTimeout(() => spawnWorker(workerId, mode), delayInMs);
  };
  
  const checkCompletion = (mode: AppMode) => {
      if (activeWorkersRef.current === 0) {
        setTimeout(() => {
          if (queueRef.current.length === 0 && activeWorkersRef.current === 0) {
              setIsProcessing(false);
              setIsPaused(false);
              setProcessingMode(null);
              processingRef.current = false;
              pausedRef.current = false;
              
              const processingDataKey = (() => {
                if (mode === 'idea') return settings.ideaMode === 'free' ? 'idea_free' : 'idea_paid';
                if (mode === 'prompt') return settings.promptPlatform === 'file' ? 'prompt_file' : 'prompt_text';
                if (mode === 'qc') return 'qc';
                return 'metadata_universal';
              })();

              setFilesMap(prev => {
                 const newState = {
                    ...prev,
                    [processingDataKey]: [...processingFilesRef.current]
                 };
                 
                 if (mode === 'idea' && settings.ideaMode === 'free') {
                    localStorage.setItem('ISA_LAST_IDEA_BATCH', JSON.stringify(processingFilesRef.current));
                    setHasHistory(true);
                 } else if (mode === 'prompt') {
                    const isFileMode = settings.promptPlatform === 'file';
                    const storageKey = isFileMode ? 'ISA_LAST_PROMPT_FILE_BATCH' : 'ISA_LAST_PROMPT_TEXT_BATCH';
                    localStorage.setItem(storageKey, JSON.stringify(processingFilesRef.current));
                    if (isFileMode) setHasPromptFileHistory(true); else setHasPromptTextHistory(true);
                 }
  
                 return newState;
              });
  
              addLog('Semua worker selesai.', 'success', mode);
          }
        }, 1000);
      }
  };
  
  const displayTotalFiles = (() => {
      if (activeTab === 'idea') {
          if (currentFiles.length > 0) return currentFiles.length;
          if (settings.ideaMode === 'free') {
             if (settings.ideaCategory === 'file' && settings.ideaSourceFiles && settings.ideaSourceFiles.length > 0) {
                return (settings.ideaQuantity || 0) * settings.ideaSourceFiles.length;
             }
             return settings.ideaQuantity || 0;
          } else {
             return settings.ideaBatchSize || 0;
          }
      }
      if (activeTab === 'prompt') {
          if (currentFiles.length > 0) return currentFiles.length;
          if (settings.promptPlatform === 'text') return settings.promptQuantity || 0;
          return 0; 
      }
      return currentFiles.length;
  })();
  
  const completedCount = currentFiles.filter(f => f.status === ProcessingStatus.Completed).length;
  const failedCount = currentFiles.filter(f => f.status === ProcessingStatus.Failed).length;
  
  const filteredLogs = logs;
  
  const activeModeLabel = 
        activeTab === 'apikeys' ? 'API Configuration'
        : activeTab === 'logs' ? 'System Logs'
        : activeTab === 'quran' ? 'Murottal Al-Quran'
        : activeTab === 'idea' ? 'Idea Generation' 
        : activeTab === 'prompt' ? 'Prompt Engineering'
        : activeTab === 'qc' ? 'Quality Control'
        : 'Metadata Extraction';
  
  const getStatusBorderColor = () => {
        if (isProcessing && processingMode === activeTab && !isPaused) return 'border-blue-400 shadow-md ring-1 ring-blue-200';
        if (isProcessing && processingMode === activeTab && isPaused) return 'border-amber-400 shadow-md ring-1 ring-amber-200';
        if (failedCount > 0) return 'border-red-200';
        if (completedCount > 0 && completedCount === displayTotalFiles) return 'border-green-300';
        return 'border-gray-200';
  };
  
  const getLoadingButtonStyle = () => {
        if (isPaused) return 'from-amber-50 to-amber-100 text-amber-700 border-amber-200';
        return 'from-blue-50 to-blue-100 text-blue-700 border-blue-200';
  };
  
  const getLoadingIconColor = () => {
        if (isPaused) return 'text-amber-600';
        return 'text-blue-600';
  };

  const hasVideoFiles = currentFiles.some(f => 
    f.type === FileType.Video || 
    f.file.name.toLowerCase().endsWith('.mp4') || 
    f.file.name.toLowerCase().endsWith('.mov')
  );
  
  const canGenerate = (() => {
      if (isProcessing) return false;

      // === LOGIKA CEK API KEY GANDA ===
      const isApiKeyEmpty = (settings.apiProvider === 'GEMINI API' && apiKeys.length === 0) || (settings.apiProvider === 'GROQ API' && groqKeys.length === 0);
      const isIdeaMode2 = activeMode === 'idea' && settings.ideaMode === 'paid';
      
      if (isApiKeyEmpty && !isIdeaMode2) return false;

      if (activeMode === 'idea') {
          if (settings.ideaMode === 'free') {
               if (!settings.ideaQuantity || settings.ideaQuantity <= 0) return false;
               if (settings.ideaCategory === 'file' && (!settings.ideaSourceFiles || settings.ideaSourceFiles.length === 0)) return false;
               if (settings.ideaCategory === 'custom' && !settings.ideaCustomInput) return false;
               return true;
          } else {
               return settings.ideaSourceLines && settings.ideaSourceLines.length > 0 && 
                      (settings.ideaFromRow || 0) > 0 && 
                      (settings.ideaBatchSize || 0) > 0 &&
                      (settings.ideaWorkerCount || 0) > 0; 
          }
      }
      if (activeMode === 'prompt') {
          if (settings.promptPlatform === 'file') {
              if (currentFiles.length === 0) return false;
              if (hasVideoFiles && (!settings.videoFrameCount || settings.videoFrameCount <= 0)) return false;
              return true;
          } else {
              return !!settings.promptIdea && (settings.promptQuantity || 0) > 0;
          }
      }
      if (activeMode === 'metadata' || activeMode === 'qc') {
          if (currentFiles.length === 0) return false;
          if (activeMode === 'metadata') {
             if (!settings.titleMin || settings.titleMin <= 0) return false;
             if (!settings.titleMax || settings.titleMax <= 0) return false;
             if (!settings.slideKeyword || settings.slideKeyword <= 0) return false;
          }
          if (hasVideoFiles && (!settings.videoFrameCount || settings.videoFrameCount <= 0)) return false;
          return true;
      }
      return false;
  })();
  
  const getGenerateButtonColor = () => {
      if (!canGenerate) return 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400';
      return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700';
  };
  
  const getGenerateButtonText = () => {
        if (activeMode === 'idea') return "Generate Ideas";
        if (activeMode === 'prompt') return "Generate Prompts";
        if (activeMode === 'qc') return "Start QC Check";
        return "Generate Metadata";
  };
  
  const getExportLabel = () => `Export ${settings.outputFormat.toUpperCase()}`;
  
  const getThemeColor = () => 'text-blue-500';
  
  const isSidebarOnlyMode = activeTab === 'apikeys' || activeTab === 'logs' || activeTab === 'quran';

  const isCurrentTabProcessing = isProcessing && processingMode === activeTab;
  const isCurrentTabPaused = isCurrentTabProcessing && isPaused;

  if (!isMounted) {
      return (
          <div className="flex items-center justify-center w-full h-screen bg-gray-50">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin opacity-50" />
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden relative">
      <audio ref={audioRef} onEnded={handleAudioEnded} preload="none" />

      {/* POSISI WIDGET MENGUDARA DI LUAR MAIN CONTAINER AGAR TIDAK TERHAPUS OLEH TAB APA PUN */}
      {showMiniPlayer && currentSurahId && (
        <DraggablePlayer>
            <div className="p-3">
                <div className="flex items-start justify-between mb-2 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Volume2 size={16} className={`text-emerald-500 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider leading-none">Sedang Diputar</span>
                      <span className="text-xs font-medium text-gray-700 truncate w-40">{currentSurahName} - {currentReciterName}</span>
                    </div>
                  </div>
                  <button onClick={closeMiniPlayer} className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 p-1 rounded-md transition-colors shadow-sm border border-red-100">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => handleNavigation('quran' as any)} className="text-[10px] font-medium text-gray-500 hover:text-emerald-600 underline">Buka Daftar Surat</button>
                  <button 
                    onClick={handleToggleAudio}
                    className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-all active:scale-95"
                  >
                    {isAudioPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                  </button>
                </div>
            </div>
        </DraggablePlayer>
      )}

      <header className="w-full bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between shrink-0 shadow-sm z-50 relative">
      <div className="flex items-center">
        <h1 className="text-5xl font-share-tech font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent tracking-tighter leading-none select-none">IsaProject</h1>
      </div>
        <div className="flex flex-col items-end justify-center text-gray-800">
           <span className="text-2xl leading-none tracking-tight tabular-nums">{formatTime(currentTime)}</span>
           <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5 tabular-nums">{formatDate(currentTime)}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative">
        <aside className={`w-full md:w-[380px] md:ml-2 bg-gray-50 md:border-r border-gray-200 flex flex-col z-20 order-1 md:h-full md:overflow-hidden ${isSidebarOnlyMode ? 'flex-1 md:flex-none' : 'shrink-0'}`}>
  
          <div className="flex flex-col bg-white border-b border-gray-200 shrink-0 overflow-hidden">
              <div ref={menuScrollRef} className="flex items-center gap-1.5 p-1.5 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
                  
                  {/* MUROTTAL (Sembunyi di kiri) */}
                  <button 
                      onClick={() => handleNavigation('quran' as any)} 
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center border transition-all ${
                          activeTab === 'quran' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-300 shadow-sm' 
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                      <PlayCircle className="w-5 h-5" />
                  </button>

                  <div className="w-px h-6 bg-gray-200 shrink-0 mx-0.5"></div>

                  <button 
                      ref={settingBtnRef}
                      onClick={() => handleNavigation('apikeys')} 
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center border transition-all ${
                          activeTab === 'apikeys' 
                          ? 'bg-blue-50 text-blue-700 border-blue-300' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                      <Settings className="w-5 h-5" />
                  </button>

                  <button 
                      onClick={() => handleNavigation('idea' as any)} 
                      className={`px-4 h-9 rounded-lg text-xs font-bold border transition-all flex flex-row items-center justify-center gap-1.5 ${
                          activeTab === 'idea' 
                          ? 'bg-blue-50 text-blue-700 border-blue-300' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                      <Lightbulb className="w-4 h-4" />
                      <span>IDEA</span>
                  </button>

                  <button 
                      onClick={() => handleNavigation('prompt' as any)} 
                      className={`px-4 h-9 rounded-lg text-xs font-bold border transition-all flex flex-row items-center justify-center gap-1.5 ${
                          activeTab === 'prompt' 
                          ? 'bg-blue-50 text-blue-700 border-blue-300' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                      <Command className="w-4 h-4" />
                      <span>PROMPT</span>
                  </button>

                  <button 
                      onClick={() => handleNavigation('metadata' as any)} 
                      className={`px-4 h-9 rounded-lg text-xs font-bold border transition-all flex flex-row items-center justify-center gap-1.5 ${
                          activeTab === 'metadata' 
                          ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                      <Database className="w-4 h-4" />
                      <span>METADATA</span>
                  </button>

                  <button 
                      onClick={() => handleNavigation('qc' as any)} 
                      className={`px-4 h-9 rounded-lg text-xs font-bold border transition-all flex flex-row items-center justify-center gap-1.5 ${
                          activeTab === 'qc' 
                          ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                      <ShieldCheck className="w-4 h-4" />
                      <span>QC</span>
                  </button>

                  <button 
                      onClick={() => handleNavigation('logs')} 
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center border transition-all ${
                          activeTab === 'logs' 
                          ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm' 
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                      <Activity className="w-5 h-5" />
                  </button>

                  <div className="w-px h-6 bg-gray-200 shrink-0 mx-0.5"></div>

                  {/* SUPPORT (Sembunyi di kanan) */}
                  <button 
                      onClick={() => window.open('https://lynk.id/isaproject/0581ez0729vx', '_blank')} 
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center border bg-white text-amber-600 border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-all`}
                  >
                      <Coffee className="w-5 h-5" />
                  </button>

              </div>
          </div>
  
          <div ref={sidebarContentRef} className="flex-1 bg-gray-50 flex flex-col overflow-y-visible md:overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200">
              <div className="p-4 flex flex-col gap-4">
                  {activeTab === 'quran' && (
                      <QuranPanel 
                        currentSurahId={currentSurahId}
                        isPlaying={isAudioPlaying}
                        onPlay={handlePlayAudio}
                        onTogglePlay={handleToggleAudio}
                        playbackMode={playbackMode}
                        setPlaybackMode={setPlaybackMode}
                      />
                  )}

                  {activeTab === 'idea' && (
                      <IdeaSettings 
                          settings={settings} setSettings={setSettings} isProcessing={isCurrentTabProcessing} 
                          ispaidUnlocked={ispaidUnlocked} setIspaidUnlocked={setIspaidUnlocked} 
                          onRestoreHistory={handleRestoreHistory} hasHistory={hasHistory}
                      />
                  )}
                  {activeTab === 'prompt' && (
                      <PromptSettings 
                        settings={settings} 
                        setSettings={setSettings} 
                        isProcessing={isCurrentTabProcessing} 
                        onRestoreHistory={handleRestorePromptHistory} 
                        hasHistory={settings.promptPlatform === 'file' ? hasPromptFileHistory : hasPromptTextHistory} 
                        onFilesUpload={(fl) => processFiles(fl, 'prompt')}
                        hasVideo={hasVideoFiles}
                      />
                  )}
                  {activeTab === 'metadata' && (
                  <MetadataSettings 
                      settings={settings} 
                      setSettings={setSettings} 
                      isProcessing={isCurrentTabProcessing} 
                      onFilesUpload={(fl) => processFiles(fl, 'metadata')}
                      hasVideo={hasVideoFiles}
                  />
                  )}
                  {activeTab === 'qc' && (
                  <QcSettings 
                      settings={settings} 
                      setSettings={setSettings} 
                      isProcessing={isCurrentTabProcessing} 
                      onFilesUpload={(fl) => processFiles(fl, 'qc')}
                      hasVideo={hasVideoFiles}
                  />
                  )}
                  {activeTab === 'apikeys' && (
                      <ApiKeyPanel 
                          // MENGIRIM KUNCI YANG SESUAI DENGAN PROVIDER YANG DIPILIH
                          apiKeys={settings.apiProvider === 'GROQ API' ? groqKeys : apiKeys}
                          setApiKeys={settings.apiProvider === 'GROQ API' ? setGroqKeys : setApiKeys}
                          isProcessing={isProcessing} 
                          mode='metadata' 
                          provider={settings.apiProvider}
                          setProvider={(p) => setSettings(prev => ({ ...prev, apiProvider: p as ApiProvider }))}
                          geminiModel={settings.geminiModel} 
                          setGeminiModel={(m) => setSettings(prev => ({ ...prev, geminiModel: m }))}
                          workerCount={settings.workerCount}
                          setWorkerCount={(num) => setSettings(prev => ({ ...prev, workerCount: num }))}
                          apiDelay={settings.apiDelay}
                          setApiDelay={(num) => setSettings(prev => ({ ...prev, apiDelay: num }))}
                      />
                  )}

                  {activeTab === 'logs' && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex flex-col gap-2">
                          <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-4 h-4 text-blue-500" />
                              <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide leading-none">System Logs</h2>
                          </div>
                          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full h-[46px]">
                              <button
                                  onClick={() => setShowErrorDict(!showErrorDict)}
                                  title="Info Makna Kode Error"
                                  className={`w-10 flex items-center justify-center shrink-0 rounded-md transition-none ${
                                      showErrorDict ? 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-200'
                                  }`}
                              >
                                  <Menu size={18} />
                              </button>
                              <button
                                  onClick={() => { setLogViewMode('clipped'); setShowErrorDict(false); }}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium rounded-md transition-none ${
                                      logViewMode === 'clipped' && !showErrorDict ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-200'
                                  }`}
                              >
                                  Clipped
                              </button>
                              <button
                                  onClick={() => { setLogViewMode('transparent'); setShowErrorDict(false); }}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium rounded-md transition-none ${
                                      logViewMode === 'transparent' && !showErrorDict ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-200'
                                  }`}
                              >
                                  Transparent
                              </button>
                          </div>

                          <div className={`relative flex h-[500px] shrink-0 flex-col overflow-hidden rounded-lg border mt-2 ${
                              showErrorDict 
                                  ? 'bg-amber-50 border-amber-200 shadow-sm'
                                  : logViewMode === 'transparent' 
                                      ? 'bg-white/40 backdrop-blur-md border-blue-200/60 shadow-none' 
                                      : 'bg-white border-blue-200 shadow-sm'
                          }`}>
                              {showErrorDict ? (
                                  <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-amber-200/50">
                                      <h3 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-4 border-b border-amber-200 pb-2">Kamus Kode Error API</h3>
                                      <div className="flex flex-col gap-3 text-xs text-gray-700">
                                          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                              <span className="font-black text-red-600 text-sm">Error 400 (Bad Request)</span>
                                              <p className="mt-1"><b>Penyebab:</b> File tidak didukung, resolusi gambar/video kebesaran, atau teks terlalu panjang/melanggar format sistem.</p>
                                          </div>
                                          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                              <span className="font-black text-red-600 text-sm">Error 401 (Unauthorized)</span>
                                              <p className="mt-1"><b>Penyebab:</b> API Key salah ketik, kedaluwarsa, ditarik dari Google AI Studio, atau belum diisi.</p>
                                          </div>
                                          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                              <span className="font-black text-red-600 text-sm">Error 403 (Forbidden)</span>
                                              <p className="mt-1"><b>Penyebab:</b> Kunci valid tapi tidak punya izin akses ke model tersebut, atau IP wilayah terblokir.</p>
                                          </div>
                                          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                              <span className="font-black text-red-600 text-sm">Error 404 (Not Found)</span>
                                              <p className="mt-1"><b>Penyebab:</b> Nama model salah ketik (typo) atau model sudah dihapus/dinonaktifkan oleh Google.</p>
                                          </div>
                                          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                              <span className="font-black text-orange-600 text-sm">Error 429 (Quota Exceeded / Limit)</span>
                                              <p className="mt-1"><b>Penyebab:</b> Terlalu banyak request dalam 1 menit, atau jatah gratis harian habis. Sistem akan otomatis memindahkan kunci ke kotak istirahat selama 60 detik.</p>
                                          </div>
                                          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                              <span className="font-black text-red-600 text-sm">Error 500 (Internal Server Error)</span>
                                              <p className="mt-1"><b>Penyebab:</b> Bukan salah aplikasi kita. Server pusat Google sedang <i>down</i> atau error memproses file. Tunggu dan coba lagi.</p>
                                          </div>
                                          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                              <span className="font-black text-red-600 text-sm">Error 503 / 504 (Timeout)</span>
                                              <p className="mt-1"><b>Penyebab:</b> Server Google kepenuhan (jam sibuk) atau file video/gambar terlalu berat sehingga koneksi diputus otomatis.</p>
                                          </div>
                                          <div className="bg-white p-3 rounded border border-amber-100 shadow-sm">
                                              <span className="font-black text-red-600 text-sm">Network Error / Fetch Failed</span>
                                              <p className="mt-1"><b>Penyebab:</b> Koneksi internet putus, atau VPN/Proxy/DNS komputer memblokir jalur ke server.</p>
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                  <>
                                      <div className="flex shrink-0 border-b border-gray-100 divide-x divide-gray-100 bg-white/50 backdrop-blur-sm">
                                          <button onClick={handleClearLogs} className="flex-1 flex items-center justify-center gap-2 bg-red-50/50 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-100"><Eraser size={14} /> CLEAR LOGS</button>
                                          <button onClick={handleCopyLogs} className="flex-1 flex items-center justify-center gap-2 bg-blue-50/50 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-600 transition-colors hover:bg-red-100"><Copy size={14} /> COPY LOGS</button>
                                      </div>
                                      <div ref={logsContainerRef} className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200/50">
                                          {filteredLogs.length === 0 ? (
                                          <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400 opacity-40"><Activity size={32} /> <p>No logs found.</p></div>
                                          ) : (
                                          <div className="flex flex-col gap-2">
                                              {filteredLogs.map(log => (
                                              <div key={log.id} className="flex items-start gap-2 break-all border-b border-gray-50/50 pb-1 last:border-0">
                                                  <span className={`mt-0.5 shrink-0 rounded px-1 text-[10px] font-medium ${log.mode === 'idea' ? 'bg-amber-100/80 text-amber-700' : log.mode === 'prompt' ? 'bg-fuchsia-100/80 text-fuchsia-700' : log.mode === 'metadata' ? 'bg-blue-100/80 text-blue-700' : 'bg-gray-100/80 text-gray-600'}`}>{log.mode?.substring(0,4).toUpperCase()}</span>
                                                  <div className="flex min-w-0 flex-1 flex-col">
                                                      <span className="font-mono text-[10px] text-gray-400/80">{log.time}</span>
                                                      <span className={`text-xs ${log.type === 'error' ? 'text-red-600 font-bold' : log.type === 'success' ? 'text-green-600 font-semibold' : log.type === 'warning' ? 'text-orange-600 font-semibold' : 'text-gray-700'} ${logViewMode === 'clipped' ? 'line-clamp-2 overflow-hidden' : 'break-words whitespace-pre-wrap'}`}>
                                                          {log.message}
                                                      </span>
                                                  </div>
                                              </div>
                                              ))}
                                          </div>
                                          )}
                                      </div>
                                  </>
                              )}
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {activeTab !== 'logs' && activeTab !== 'apikeys' && activeTab !== 'quran' && (
              <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-4 z-10">
                  <div className={`bg-white rounded-lg border ${getStatusBorderColor()} shadow-sm transition-all duration-300 overflow-hidden`}>
                      <div className="grid grid-cols-3 gap-0 border-b border-gray-100 p-2 bg-gray-50">
                          <div className="flex flex-col items-center justify-center border border-blue-200 rounded-lg bg-blue-50 py-1.5 shadow-sm transition-all">
                              <div className="flex items-center gap-1 mb-1 text-blue-600">
                                  <Clock size={13} className="shrink-0" />
                                  <span className="text-xs font-medium capitalize leading-none">Selected</span>
                              </div>
                              <span className="text-xs font-black text-blue-600 tabular-nums">{displayTotalFiles}</span>
                          </div>
                          <div className="mx-1.5 flex flex-col items-center justify-center border border-green-200 rounded-lg bg-green-50 py-1.5 shadow-sm transition-all">
                              <div className="flex items-center gap-1 mb-1 text-green-600">
                                  <CheckCircle size={13} className="shrink-0" />
                                  <span className="text-xs font-medium capitalize leading-none">Completed</span>
                              </div>
                              <span className="text-xs font-black text-green-700 tabular-nums">{completedCount}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center border border-red-200 rounded-lg bg-red-50 py-1.5 shadow-sm transition-all">
                              <div className="flex items-center gap-1 mb-1 text-red-600">
                                  <XCircle size={13} className="shrink-0" />
                                  <span className="text-xs font-medium capitalize leading-none">Failed</span>
                              </div>
                              <span className="text-xs font-black text-red-700 tabular-nums">{failedCount}</span>
                          </div>
                      </div>
                      <div className="p-3 bg-white flex items-center justify-between gap-3">
                          <button 
                              onClick={handleClearAll} 
                              disabled={currentFiles.length === 0 || (isCurrentTabProcessing && !isCurrentTabPaused)} 
                              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-bold uppercase tracking-wide rounded border transition-colors ${currentFiles.length > 0 && (!isCurrentTabProcessing || isCurrentTabPaused) ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'}`}
                          >
                              <Trash2 size={14} /> CLEAR ALL
                          </button>
                      </div>
                  </div>
                  <div className="flex gap-1.5 h-10">
                      {isCurrentTabProcessing ? (
                          <div className={`flex-1 bg-gradient-to-r border text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm select-none transition-all duration-300 ${getLoadingButtonStyle()}`}>
                              <Sparkles className={`w-4 h-4 ${isPaused ? '' : 'animate-spin'} ${getLoadingIconColor()}`} style={{ animationDuration: '3s' }} />
                              <span className="uppercase truncate tracking-wide">{isPaused ? 'Terhenti' : 'Memproses...'}</span>
                          </div>
                      ) : (
                          <button 
                              onClick={startProcessing} 
                              disabled={!canGenerate || isProcessing} 
                              className={`flex-1 text-xs font-bold rounded-lg border shadow transition-colors flex items-center justify-center gap-2 uppercase tracking-wide truncate ${getGenerateButtonColor()}`}
                          >
                              <Wand2 size={14} className="shrink-0" />
                              <span className="truncate">{getGenerateButtonText()}</span>
                          </button>
                      )}
                      <button 
                          onClick={togglePause}
                          disabled={!isCurrentTabProcessing}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border shadow-sm transition-all active:scale-95 shrink-0 ${!isCurrentTabProcessing ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : isCurrentTabPaused ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' : 'bg-amber-100 border-amber-300 text-amber-600 hover:bg-amber-200'}`}
                      >
                          {isCurrentTabPaused ? <Play size={14} className="fill-current" /> : <Pause size={18} className="fill-current" />}
                      </button>
                      <button 
                          onClick={() => handleDownload()} 
                          disabled={completedCount === 0 || (isCurrentTabProcessing && !isCurrentTabPaused)} 
                          className={`flex-1 text-xs font-bold rounded-lg border shadow transition-colors flex items-center justify-center gap-2 uppercase tracking-wide truncate ${completedCount > 0 && (!isCurrentTabProcessing || isCurrentTabPaused) ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-80'}`}
                      >
                          <Download size={14} className="shrink-0" /> 
                          <span className="truncate">{getExportLabel()}</span>
                      </button>
                  </div>
              </div>
          )}
        </aside>

        <section className={`flex-1 flex-col md:overflow-hidden relative order-2 min-h-0 bg-gray-100 ${isSidebarOnlyMode ? 'hidden md:flex' : 'flex'}`}>
          {isSidebarOnlyMode ? (
              <div className="flex h-full flex-col items-center justify-center bg-gray-50 p-8">
                  <div className="flex max-w-sm flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                          {activeTab === 'apikeys' ? <Settings size={32} /> : activeTab === 'logs' ? <Activity size={32} /> : <PlayCircle size={32} className="text-emerald-500" />}
                      </div>
                      <h3 className="mb-2 text-lg font-bold tracking-wide text-gray-700 uppercase">{activeTab.replace('_', ' ').toUpperCase()} VIEWER</h3>
                      <p className="text-sm text-gray-400">Settings and information are displayed in the left panel for easy access while working.</p>
                  </div>
              </div>
          ) : (
              <>
                <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm md:static">
                  <div className="flex items-center gap-2 text-gray-700">
                      <FolderOutput className={`w-5 h-5 ${getThemeColor()}`} />
                      <h2 className="text-xl font-bold tracking-tight uppercase">OUTPUT RESULTS</h2>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-blue-50 text-blue-600 border-blue-200`}>{activeTab} MODE</span>
                </div>
                <div ref={mainContentRef} className={`flex-1 p-4 md:overflow-y-auto min-h-[50vh] md:min-h-0 relative scrollbar-thin scrollbar-thumb-gray-200`}>
                    {currentFiles.length === 0 ? (
                    <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-gray-400">
                        {activeTab === 'idea' ? (
                        <><Lightbulb size={64} className="mb-4 text-blue-500 opacity-20" /><p className="text-base font-medium uppercase">Idea Workspace Ready.</p><p className="mt-1 max-w-xs text-center text-sm text-gray-500">{settings.ideaMode === 'free' ? (settings.ideaCategory === 'file' ? "Upload a file in Idea Settings to generate concepts." : "Select a category and quantity to generate new concepts."): (settings.ideaSourceLines && settings.ideaSourceLines.length > 0 ? "Database loaded. Specify Start Row & Quantity, then click 'Generate' to start extraction." : "Upload a Database file in Idea Settings (paid) to start.")}</p></>
                        ) : activeTab === 'prompt' ? (
                        <><Command size={64} className="mb-4 text-blue-500 opacity-20" /><p className="text-base font-medium uppercase">Prompt Generator Ready.</p><p className="mt-1 max-w-xs text-center text-sm text-gray-500">{settings.promptPlatform === 'file' ? "Upload file di panel pengaturan untuk membuat prompt dari analisa gambar/video." : "Enter an Idea, Description, and Quantity to start."}</p></>
                        ) : activeTab === 'qc' ? ( 
                        <><ShieldCheck size={64} className="mb-4 text-blue-500 opacity-20" /><p className="text-base font-medium uppercase">QC Workspace Ready.</p><p className="mt-1 text-sm">Upload files to start quality control.</p></>
                        ) : (
                        <><UploadCloud size={64} className="mb-4 opacity-20" /><p className="text-base font-medium uppercase">No files in {activeTab.toUpperCase()} workspace.</p><p className="mt-1 text-sm">Upload files to start.</p></>
                        )}
                    </div>
                    ) : (
                    activeTab === 'idea' ? (
                        <IdeaListComponent 
                          items={currentFiles} 
                          onDelete={handleDelete}
                          onToggleLanguage={handleToggleLanguage}
                          getLanguage={getLanguage}
                          isMode1={settings.ideaMode === 'free'}
                        />
                    ) : activeTab === 'prompt' ? (
                        <PromptListComponent 
                            items={currentFiles} 
                            onDelete={handleDelete} 
                            onToggleLanguage={handleToggleLanguage} 
                            getLanguage={getLanguage} 
                            onPreview={setPreviewItem} 
                        />
                    ) : activeTab === 'qc' ? ( 
                        <div className="grid grid-cols-1 gap-4 pb-20 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:pb-0">
                        {currentFiles.map(file => (
                            <QcCard 
                                key={file.id} item={file} onDelete={handleDelete}
                                onRetry={(id) => {
                                    const targetKey = getActiveDataKey();
                                    setFilesMap(prev => ({ ...prev, [targetKey]: prev[targetKey].map(f => f.id === id ? { ...f, status: ProcessingStatus.Pending } : f) }));
                                }}
                                onPreview={setPreviewItem} language={getLanguage(file.id)} onToggleLanguage={handleToggleLanguage} disabled={isCurrentTabProcessing}
                            />
                        ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 pb-20 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:pb-0">
                        {currentFiles.map(file => (
                            <FileCard 
                                key={file.id} item={file} onDelete={handleDelete} onUpdate={handleUpdateMetadata}
                                onRetry={(id) => {
                                    const targetKey = getActiveDataKey();
                                    setFilesMap(prev => ({ ...prev, [targetKey]: prev[targetKey].map(f => f.id === id ? { ...f, status: ProcessingStatus.Pending } : f) }));
                                }}
                                onPreview={setPreviewItem} language={getLanguage(file.id)} onToggleLanguage={handleToggleLanguage} disabled={isCurrentTabProcessing} platform={settings.metadataPlatform}
                            />
                        ))}
                        </div>
                    )
                    )}
                </div>
              </>
          )}
        </section>
      </main>
      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
};

export default App;
