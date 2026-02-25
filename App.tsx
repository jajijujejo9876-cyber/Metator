
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Download, Trash2, Wand2, UploadCloud, FolderOutput, FilePlus, CheckCircle, XCircle, Clock, Database, Activity, Coffee, FolderPlus, Sparkles, Eraser, Lightbulb, Command, Filter, Lock, Key, Menu, ChevronRight, Info, Check, Bot, Settings, Pause, Play, Copy, Languages, RefreshCw, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import ApiKeyPanel from './components/ApiKeyPanel';
import MetadataSettings from './components/MetadataSettings';
import IdeaSettings from './components/IdeaSettings';
import PromptSettings from './components/PromptSettings';
import FileCard from './components/FileCard';
import IdeaListComponent from './components/IdeaListComponent'; 
import PromptListComponent from './components/PromptListComponent';
import PreviewModal from './components/PreviewModal';
import { generateMetadataForFile, translateMetadataContent, translateText } from './services/geminiService';
import { downloadCSV, downloadTXT, extractSlugFromUrl } from './utils/helpers';
import { AppSettings, FileItem, FileType, ProcessingStatus, Language, AppMode, ApiProvider, ChatMessage, ChatSession } from './types';
import { INITIAL_METADATA } from './constants';

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  mode?: AppMode | 'system'; 
}

type LogFilter = 'ALL' | AppMode;

type ApiKeyMap = Record<ApiProvider, string[]>;

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
  const [activeTab, setActiveTab] = useState<AppMode | 'logs' | 'apikeys'>('apikeys');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<LogFilter>('ALL');
  const [logViewMode, setLogViewMode] = useState<'transparent' | 'clipped'>('transparent');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 1. BUAT VARIABELNYA DULU
  const [appColor, setAppColor] = useState<string>(() => {
    return localStorage.getItem('ISA_APP_COLOR') || 'light-clean';
  });

  const [apiDelay, setApiDelay] = useState<number>(() => {
    const saved = localStorage.getItem('ISA_API_DELAY');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  const apiDelayRef = useRef(apiDelay);

  // 2. BARU GUNAKAN VARIABELNYA DI USEEFFECT
  useEffect(() => {
    // Sisipkan class tema tanpa menghapus class bawaan (font, dll)
    document.body.classList.add(appColor);
    localStorage.setItem('ISA_APP_COLOR', appColor);

    // Bersihkan class tema lama saat pengguna memilih tema baru
    return () => {
      document.body.classList.remove(appColor);
    };
  }, [appColor]);

  useEffect(() => {
    apiDelayRef.current = apiDelay;
    localStorage.setItem('ISA_API_DELAY', apiDelay.toString());
  }, [apiDelay]);
  
  // -- KODE API KEY MAP TETAP SAMA DI BAWAH INI --
  const [apiKeysMap, setApiKeysMap] = useState<ApiKeyMap>(() => {
    try {
      const saved = localStorage.getItem('ISA_API_KEYS');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
            AUTO: [],
            GEMINI: parsed.GEMINI || [],
            GROQ: parsed.GROQ || [],
            PUTER: parsed.PUTER || [],
            MISTRAL: parsed.MISTRAL || [],
            CUSTOM: parsed.CUSTOM || []
        };
      }
      return { AUTO: [], GEMINI: [], GROQ: [], PUTER: [], CUSTOM: [], MISTRAL: [] };
    } catch (e) {
      return { AUTO: [], GEMINI: [], GROQ: [], PUTER: [], CUSTOM: [], MISTRAL: [] };
    }
  });
  
  const [isPaidUnlocked, setIsPaidUnlocked] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaultSettings: AppSettings = {
      apiProvider: 'AUTO', 
      geminiModel: 'gemini-3-flash-preview', 
      groqModel: 'openai/gpt-oss-120b', 
      puterModel: 'gemini-3-flash-preview',
      mistralBaseUrl: '',
      mistralModel: '',
      customBaseUrl: '',
      customModel: '',
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
      ideaMode: 'free', 
      ideaQuantity: 30, 
      ideaCategory: 'auto',
      ideaCustomInput: '',
      ideaCustomInstruction: '', 
      ideaSourceFiles: [], 
      ideaFromRow: 0, 
      ideaBatchSize: 0, 
      ideaSourceLines: [],
      promptIdea: '',
      promptDescription: '',
      promptQuantity: 30,
      promptJsonOutput: false,
      promptPlatform: 'Photo/Image', 
      promptSourceFiles: [],
      imageGenMode: 'T2I',
      imageGenT2ISubMode: 'single',
      imageGenT2I: { prompt: '', quantity: 1, aspectRatio: '1:1', zipFilename: '' },
      imageGenT2IBatch: { prompt: '', quantity: 1, aspectRatio: '1:1', zipFilename: '' },
      imageGenI2I: { prompt: '', quantity: 1, aspectRatio: 'auto', zipFilename: '' },
      imageGenBlend: { prompt: '', quantity: 1, aspectRatio: '1:1', zipFilename: '' },
      imageGenAds: { prompt: '', quantity: 1, aspectRatio: '1:1', zipFilename: '' },
      imageGenBlendCategory: 'aesthetic_fusion',
      imageGenAdsSubHeadings: {
        auto: true,
        media: 'NO',
        history: 'NO',
        photo: 'NO',
        digital: 'NO',
        pop: 'NO',
        material: 'NO',
        core: 'NO',
        print: 'NO'
      },
      imageGenAdsTexts: [],
      imageGenSourceFile: null,
      imageGenBatchFile: null,
      imageGenReferenceFiles: [],
      imageGenAdsObjectFiles: [],
      imageGenAdsStyleFiles: [],
      eduSourceType: 'YouTube' as any,
      eduInputUrl: '',
      eduSourceFiles: [],
      selectedFileType: FileType.Image,
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
          customTitle: '', 
          customKeyword: '',
          ideaSourceFiles: [], 
          promptSourceFiles: [], 
          eduSourceFiles: [] 
        };
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    return defaultSettings;
  });
  
  const [filesMap, setFilesMap] = useState<Record<string, FileItem[]>>({
    metadata_adobe: [],
    metadata_shutter: [],
    idea_free: [],
    idea_paid: [],
    prompt: []
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
  const activeKeysRef = useRef<Set<string>>(new Set());
  const cooldownKeysRef = useRef<Map<string, number>>(new Map());
  const nextKeyIdxRef = useRef(0);
  
  const processingFilesRef = useRef<FileItem[]>([]); 

  const sidebarContentRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const getActiveDataKey = () => {
    if (activeTab === 'idea') {
      return settings.ideaMode === 'free' ? 'idea_free' : 'idea_paid';
    }
    if (activeTab === 'metadata') {
      return settings.metadataPlatform === 'Adobe Stock' ? 'metadata_adobe' : 'metadata_shutter';
    }
    return activeTab as string;
  };

  const activeDataKey = getActiveDataKey();
  const activeMode: AppMode = (activeTab === 'logs' || activeTab === 'apikeys') ? 'metadata' : (activeTab as AppMode);
  const currentFiles = filesMap[activeDataKey] || [];
  const currentProviderKeys = apiKeysMap[settings.apiProvider] || [];
  
  const [hasHistory, setHasHistory] = useState(() => {
    try { return !!localStorage.getItem('ISA_LAST_IDEA_BATCH'); } catch(e) { return false; }
  });
  const [hasPromptHistory, setHasPromptHistory] = useState(() => {
    try { return !!localStorage.getItem('ISA_LAST_PROMPT_BATCH'); } catch(e) { return false; }
  });

  useEffect(() => {
    document.body.className = appColor;
    localStorage.setItem('ISA_APP_COLOR', appColor);
  }, [appColor]);

  // Delay Sync Effect
  useEffect(() => {
    apiDelayRef.current = apiDelay;
    localStorage.setItem('ISA_API_DELAY', apiDelay.toString());
  }, [apiDelay]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('ISA_API_KEYS', JSON.stringify(apiKeysMap));
  }, [apiKeysMap]);

  useEffect(() => {
    const settingsToSave = { ...settings, ideaSourceFiles: [], promptSourceFiles: [], eduSourceFiles: [] };
    localStorage.setItem('ISA_APP_SETTINGS', JSON.stringify(settingsToSave));
  }, [settings]);

  useEffect(() => {
    if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, activeTab, logViewMode]);

  useEffect(() => {
    if (!isProcessing || !processingMode) return;

    const heartbeat = setInterval(() => {
        if (processingFilesRef.current) {
            const processingDataKey = (() => {
                if (processingMode === 'idea') return settings.ideaMode === 'free' ? 'idea_free' : 'idea_paid';
                if (processingMode === 'metadata') return settings.metadataPlatform === 'Adobe Stock' ? 'metadata_adobe' : 'metadata_shutter';
                return processingMode as string;
            })();

            setFilesMap(prev => ({
                ...prev,
                [processingDataKey]: [...processingFilesRef.current]
            }));
        }
    }, 500); 

    return () => clearInterval(heartbeat);
  }, [isProcessing, processingMode, settings.ideaMode, settings.metadataPlatform]);

  useLayoutEffect(() => {
    if (sidebarContentRef.current) sidebarContentRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab, settings.metadataPlatform]);

  const handleNavigation = (tab: AppMode | 'logs' | 'apikeys') => {
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

  const handleUpdateCurrentProviderKeys = (newKeys: string[]) => {
    setApiKeysMap(prev => ({ ...prev, [settings.apiProvider]: newKeys }));
    nextKeyIdxRef.current = 0;
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
      if (targetMode === 'metadata') {
         newState.metadata_adobe = [...prev.metadata_adobe, ...createdItems];
         const clones = createdItems.map(item => ({...item, id: uuidv4(), metadata: JSON.parse(JSON.stringify(INITIAL_METADATA))}));
         newState.metadata_shutter = [...prev.metadata_shutter, ...clones];
      } else {
         newState[activeDataKey] = [...prev[activeDataKey], ...createdItems];
      }
      return newState;
    });
  };

  const handleClearAll = () => {
    if (activeTab === 'logs' || activeTab === 'apikeys') return;
    if (isProcessing && processingMode === activeTab && !isPaused) return;

    const count = filesMap[activeDataKey].length;
    filesMap[activeDataKey].forEach(f => {
      URL.revokeObjectURL(f.previewUrl);
      if (f.generatedImageUrl && f.generatedImageUrl.startsWith('blob:')) URL.revokeObjectURL(f.generatedImageUrl);
    });
    
    setFilesMap(prev => ({ ...prev, [activeDataKey]: [] }));
    
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
          const saved = localStorage.getItem('ISA_LAST_PROMPT_BATCH');
          if (saved) {
              const parsed = JSON.parse(saved);
              const restoredFiles: FileItem[] = parsed.map((item: any) => ({
                  ...item,
                  file: new File([""], item.file?.name || "restored_prompt", { type: item.file?.type || 'text/plain' }),
                  status: ProcessingStatus.Completed 
              }));
              setFilesMap(prev => ({ ...prev, prompt: restoredFiles }));
              addLog(`Restored ${restoredFiles.length} prompts from history.`, 'success', 'prompt');
          }
      } catch (e) {
          console.error("Failed to restore prompt history", e);
          addLog("Failed to restore prompt history.", 'error', 'prompt');
      }
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'logs' || activeTab === 'apikeys') return;
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
            if (newState.prompt.length > 0) {
              localStorage.setItem('ISA_LAST_PROMPT_BATCH', JSON.stringify(newState.prompt));
              setHasPromptHistory(true);
            } else {
              localStorage.removeItem('ISA_LAST_PROMPT_BATCH');
              setHasPromptHistory(false);
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

  const handleUpdateMetadata = async (id: string, field: 'title' | 'keywords' | 'category', value: string, language: Language) => {
    if (activeTab === 'logs' || activeTab === 'apikeys') return;
    
    setFilesMap(prev => ({
      ...prev,
      [activeDataKey]: prev[activeDataKey].map(f => {
        if (f.id !== id) return f;
        const newMeta = { ...f.metadata };
        if (field === 'category') {
           newMeta.category = value; 
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
      if (!file || (settings.apiProvider !== 'PUTER' && settings.apiProvider !== 'AUTO' && currentProviderKeys.length === 0)) return;
      
      const apiKey = currentProviderKeys.length > 0 ? currentProviderKeys[Math.floor(Math.random() * currentProviderKeys.length)] : "";
      try {
        const currentSourceMeta = language === 'ENG' 
          ? { ...file.metadata.en, [field]: value } 
          : { ...file.metadata.ind, [field]: value };
        
        const translated = await translateMetadataContent(currentSourceMeta, language, apiKey);
        
        setFilesMap(prev => ({
          ...prev,
          [activeDataKey]: prev[activeDataKey].map(f => {
            if (f.id !== id) return f;
            const newMeta = { ...f.metadata };
            if (language === 'ENG') {
              newMeta.ind = translated;
            } else {
              newMeta.en = translated;
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
    if (activeTab === 'logs' || activeTab === 'apikeys') return;
    
    const completedItems = filesMap[activeDataKey].filter(f => f.status === ProcessingStatus.Completed);
    if (completedItems.length === 0) return;
    if (isProcessing && processingMode === activeTab && !isPaused) return;

    let defaultBase = 'IsaMetadata';
    if (activeTab === 'idea') defaultBase = 'IsaIdea';
    if (activeTab === 'prompt') defaultBase = 'IsaPrompt';

    const filenameToUse = settings.csvFilename.trim() || defaultBase;
    const targetFiles = filesMap[activeDataKey];

    if ((activeTab === 'idea' || activeTab === 'prompt') && settings.outputFormat === 'txt') {
        const filename = downloadTXT(targetFiles, filenameToUse);
        addLog(`Exported TXT: ${filename}`, 'success', activeTab as AppMode);
    } else {
        const filename = downloadCSV(targetFiles, filenameToUse, settings.metadataPlatform);
        addLog(`Exported CSV: ${filename}`, 'success', activeTab as AppMode);
    }
  };

  const startProcessing = () => {
      if (activeTab === 'logs' || activeTab === 'apikeys') return;
      const currentMode = activeTab as AppMode;

      if (isProcessing) {
          alert(`Sistem sedang memproses mode ${processingMode?.toUpperCase()}. Silakan tunggu atau pause proses tersebut sebelum memulai yang baru.`);
          return;
      }
      
      if (currentMode === 'prompt') {
         if (settings.apiProvider !== 'PUTER' && settings.apiProvider !== 'AUTO' && currentProviderKeys.length === 0) { alert("Please enter at least one API Key."); return; }
         
         const isFileMode = settings.promptPlatform === 'file';
         const promptSourceFiles = settings.promptSourceFiles || [];

         if (isFileMode && promptSourceFiles.length === 0) { alert("Please upload Image/Video files for prompt generation."); return; }
         if (!isFileMode && !settings.promptIdea) { alert("Please enter an Idea/Niche."); return; }
         if (!isFileMode && (settings.promptQuantity || 0) <= 0) { alert("Quantity must be greater than 0."); return; }
  
         const virtualFiles: FileItem[] = [];
         
         if (isFileMode) {
             const quantityPerItem = settings.promptQuantity || 1;
             promptSourceFiles.forEach((file, fileIdx) => {
                 for (let i = 0; i < quantityPerItem; i++) {
                     let type = file.type.startsWith('video') ? FileType.Video : FileType.Image;
                     virtualFiles.push({
                         id: uuidv4(),
                         file: file,
                         previewUrl: URL.createObjectURL(file),
                         type: type,
                         status: ProcessingStatus.Pending,
                         metadata: JSON.parse(JSON.stringify(INITIAL_METADATA)),
                         sourceData: { id: (fileIdx * quantityPerItem) + i + 1, originalTitle: `File: ${file.name}`, originalKeywords: 'file' }
                     });
                 }
             });
             addLog(`Generated ${virtualFiles.length} prompt slots from ${promptSourceFiles.length} files.`, 'info', 'prompt');
         } else {
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
         }
  
         setFilesMap(prev => ({ ...prev, prompt: virtualFiles }));
         runQueue(virtualFiles, currentMode);
         return;
      }
  
      if (currentMode === 'idea') {
        let virtualFiles: FileItem[] = [];
  
        if (settings.ideaMode === 'free') {
            if (settings.apiProvider !== 'PUTER' && settings.apiProvider !== 'AUTO' && currentProviderKeys.length === 0) { alert("Please enter at least one API Key."); return; }
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
                status: ProcessingStatus.Completed, 
                metadata: meta,
                sourceData: { id: from + index, originalTitle: cleanSlug, originalKeywords: line }
              };
            });
            setFilesMap(prev => ({ ...prev, idea_paid: virtualFiles }));
            localStorage.setItem('ISA_LAST_IDEA_BATCH', JSON.stringify(virtualFiles));
            setHasHistory(true);
            addLog(`Extracted ${virtualFiles.length} links locally.`, 'success', 'idea');
        }
        return;
      }
  
      if (settings.apiProvider !== 'PUTER' && settings.apiProvider !== 'AUTO' && currentProviderKeys.length === 0) { alert("Please enter at least one API Key."); return; }
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
        if (mode === 'metadata') return settings.metadataPlatform === 'Adobe Stock' ? 'metadata_adobe' : 'metadata_shutter';
        return mode as string;
      })();

      setFilesMap(currentMap => {
          processingFilesRef.current = [...currentMap[processingDataKey]];
          return currentMap;
      });
  
      queueRef.current = filesToProcess.map(f => f.id); 
      activeKeysRef.current.clear();
      
      const keysToUse = apiKeysMap[settings.apiProvider] || [];
      const providerName = settings.apiProvider === 'AUTO' ? 'Auto Mode' : settings.apiProvider;
      addLog(`Mulai Antrian: ${queueRef.current.length} item di ${mode.toUpperCase()} menggunakan ${providerName}.`, 'info', mode);
  
      const userMaxWorkers = settings.workerCount || 10;
      
      const maxConcurrency = (settings.apiProvider === 'PUTER' || settings.apiProvider === 'AUTO')
        ? Math.min(userMaxWorkers, 10)
        : Math.min(userMaxWorkers, Math.max(1, keysToUse.length));
        
      addLog(`Menjalankan ${maxConcurrency} worker...`, 'info', mode);
  
      for (let i = 0; i < maxConcurrency; i++) {
        setTimeout(() => spawnWorker(i + 1, mode, keysToUse), i * 100);
      }
    };

    const togglePause = () => {
        if (!isProcessing) return;
        const nextPausedState = !isPaused;
        setIsPaused(nextPausedState);
        pausedRef.current = nextPausedState;
        addLog(nextPausedState ? "Proses dihentikan sementara (Paused)." : "Proses dilanjutkan (Resumed).", nextPausedState ? 'warning' : 'info', processingMode || 'metadata');
    };
  
    const spawnWorker = async (workerId: number, mode: AppMode, keysPool: string[]) => {
      if (!processingRef.current) return;
      if (pausedRef.current) {
          setTimeout(() => spawnWorker(workerId, mode, keysPool), 500);
          return;
      }

      const fileId = queueRef.current.shift();
      if (!fileId) {
        checkCompletion(mode);
        return;
      }
  
      activeWorkersRef.current++;
      
      let selectedKey: string | null = null;
      const totalKeys = keysPool.length;
      const now = Date.now();

      if ((settings.apiProvider === 'PUTER' || settings.apiProvider === 'AUTO')) {
          selectedKey = ""; // Placeholder for Puter/Auto
      } else {
          for (const [key, expiry] of cooldownKeysRef.current.entries()) {
            if (now > expiry) cooldownKeysRef.current.delete(key);
          }
      
          for (let i = 0; i < totalKeys; i++) {
            const idx = (nextKeyIdxRef.current + i) % totalKeys;
            const keyCandidate = keysPool[idx];
            if (!activeKeysRef.current.has(keyCandidate) && !cooldownKeysRef.current.has(keyCandidate)) {
              selectedKey = keyCandidate;
              nextKeyIdxRef.current = (idx + 1) % totalKeys;
              break;
            }
          }
      }
  
      if (selectedKey === null && (settings.apiProvider !== 'PUTER' && settings.apiProvider !== 'AUTO')) {
        queueRef.current.unshift(fileId);
        activeWorkersRef.current--;
        setTimeout(() => spawnWorker(workerId, mode, keysPool), apiDelayRef.current * 1000); 
        return;
      }
  
      if (selectedKey) activeKeysRef.current.add(selectedKey);
      
      const fileIndex = processingFilesRef.current.findIndex(f => f.id === fileId);
      if (fileIndex !== -1) {
          processingFilesRef.current[fileIndex] = { ...processingFilesRef.current[fileIndex], status: ProcessingStatus.Processing, error: undefined };
      }
      
      const currentFileItem = processingFilesRef.current[fileIndex];
      const keyIndex = keysPool.indexOf(selectedKey!) + 1;
  
      try {
        if (!currentFileItem) throw new Error("File aborted or not found");

        const { metadata, thumbnail, generatedImageUrl } = await generateMetadataForFile(currentFileItem, settings, selectedKey!, mode);
  
        if (fileIndex !== -1) {
            processingFilesRef.current[fileIndex] = { 
                ...processingFilesRef.current[fileIndex], 
                status: ProcessingStatus.Completed, 
                metadata,
                thumbnail,
                generatedImageUrl
            };
        }
        
        const keyLabel = settings.apiProvider === 'AUTO' ? `System Slot ${workerId}` : (settings.apiProvider === 'PUTER' ? `Puter Slot ${workerId}` : `Key ${keyIndex}`);
        addLog(`${keyLabel} [Sukses] ${currentFileItem.file.name}`, 'success', mode);
        if (selectedKey) activeKeysRef.current.delete(selectedKey);
  
      } catch (error: any) {
        if (selectedKey) activeKeysRef.current.delete(selectedKey!);
        
        const rawErrorMsg = rawStringify(error);
        const errorMsgLower = rawErrorMsg.toLowerCase();
        
        if (errorMsgLower.includes('file aborted')) return; 
  
        const isTemporaryError = errorMsgLower.includes('429') || errorMsgLower.includes('quota') || errorMsgLower.includes('overloaded') || errorMsgLower.includes('timeout') || errorMsgLower.includes('fetch failed');
  
        if (isTemporaryError) {
          queueRef.current.push(fileId);
          if (selectedKey) cooldownKeysRef.current.set(selectedKey!, Date.now() + 45000); 
          addLog(`Worker Terlimit (Cooldown 45s). Detail: ${rawErrorMsg}`, 'warning', mode);
          
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
          addLog(`[Gagal] ${rawErrorMsg}`, 'error', mode);
        }
      }
  
      activeWorkersRef.current--;
      setTimeout(() => spawnWorker(workerId, mode, keysPool), 500);
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
                if (mode === 'metadata') return settings.metadataPlatform === 'Adobe Stock' ? 'metadata_adobe' : 'metadata_shutter';
                return mode as string;
              })();

              setFilesMap(prev => {
                 const newState = {
                    ...prev,
                    [processingDataKey]: [...processingFilesRef.current]
                 };
                 
                 if (mode === 'idea') {
                    localStorage.setItem('ISA_LAST_IDEA_BATCH', JSON.stringify(processingFilesRef.current));
                    setHasHistory(true);
                 } else if (mode === 'prompt') {
                    localStorage.setItem('ISA_LAST_PROMPT_BATCH', JSON.stringify(processingFilesRef.current));
                    setHasPromptHistory(true);
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
                  return (settings.ideaQuantity || 30) * settings.ideaSourceFiles.length;
               }
               return settings.ideaQuantity || 30;
            } else {
               return settings.ideaBatchSize || 0;
            }
        }
        if (activeTab === 'prompt') {
            if (currentFiles.length > 0) return currentFiles.length;
            if (settings.promptPlatform === 'file' && settings.promptSourceFiles && settings.promptSourceFiles.length > 0) {
                return (settings.promptQuantity || 1) * settings.promptSourceFiles.length;
            }
            return settings.promptQuantity || 0;
        }
        return currentFiles.length;
    })();
  
    const completedCount = currentFiles.filter(f => f.status === ProcessingStatus.Completed).length;
    const failedCount = currentFiles.filter(f => f.status === ProcessingStatus.Failed).length;
    
    const filteredLogs = logs.filter(log => {
        if (logFilter === 'ALL') return true;
        return log.mode === logFilter;
    });
  
    const activeModeLabel = 
          activeTab === 'apikeys' ? 'API Configuration'
          : activeTab === 'logs' ? 'System Logs'
          : activeTab === 'idea' ? 'Idea Generation' 
          : activeTab === 'prompt' ? 'Prompt Engineering'
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
  
    const canGenerate = (() => {
          if (isProcessing) return false;
          if (activeMode === 'idea') {
              if (settings.ideaMode === 'free') {
                   if (settings.ideaCategory === 'file' && (!settings.ideaSourceFiles || settings.ideaSourceFiles.length === 0)) return false;
                   if (settings.ideaCategory === 'custom' && !settings.ideaCustomInput) return false;
                   return true;
              } else {
                   return settings.ideaSourceLines && settings.ideaSourceLines.length > 0 && 
                          (settings.ideaFromRow || 0) > 0 && 
                          (settings.ideaBatchSize || 0) > 0;
              }
          }
          if (activeMode === 'prompt') {
              if (settings.promptPlatform === 'file') return (settings.promptSourceFiles || []).length > 0;
              return !!settings.promptIdea; // Prompt generation requires an Idea/Niche
          }
          if (activeMode === 'metadata') {
              return currentFiles.length > 0; // Metadata generation requires files
          }
          return false;
    })();
  
    const getGenerateButtonColor = () => {
          if (!canGenerate) return 'bg-gray-300 cursor-not-allowed text-gray-500';
          return 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700';
    };
  
    const getGenerateButtonText = () => {
          if (activeMode === 'idea') return "Generate Ideas";
          if (activeMode === 'prompt') return "Generate Prompts";
          return "Generate Metadata";
    };
  
    const getExportLabel = () => `Export ${settings.outputFormat.toUpperCase()}`;
  
    const getThemeColor = () => 'text-blue-500';
  
    const isSidebarOnlyMode = activeTab === 'apikeys' || activeTab === 'logs';

    const hasVideoFiles = currentFiles.some(f => 
      f.type === FileType.Video || 
      f.file.name.toLowerCase().endsWith('.mp4') || 
      f.file.name.toLowerCase().endsWith('.mov')
    );

    const isCurrentTabProcessing = isProcessing && processingMode === activeTab;
    const isCurrentTabPaused = isCurrentTabProcessing && isPaused;

    const isConfigReady = settings.apiProvider === 'AUTO' || currentProviderKeys.length > 0;

    return (
      <div className="flex flex-col min-h-screen md:h-screen bg-gray-50 overflow-x-hidden">
        <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shadow-sm z-50">
          <div className="flex items-center">
            <h1 className="text-6xl font-share-tech font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent tracking-tighter leading-none select-none">IsaProject</h1>
          </div>
          <div className="flex flex-col items-end justify-center text-gray-800">
             <span className="text-2xl leading-none tracking-tight tabular-nums">{formatTime(currentTime)}</span>
             <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5 tabular-nums">{formatDate(currentTime)}</span>
          </div>
        </header>
  
        <main className="flex-1 flex flex-col md:flex-row md:overflow-hidden relative pt-16">
          <aside className={`w-full md:w-[380px] md:ml-2 bg-gray-50 md:border-r border-gray-200 flex flex-col shrink-0 z-20 shadow-sm md:shadow-none order-1 md:h-full transition-colors duration-300 overflow-hidden`}>
            
            <div className="flex flex-col bg-white shrink-0 border-gray-200">
               <div className="flex items-center gap-1 p-2">
                   <button 
                      onClick={() => handleNavigation('apikeys')} 
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center border transition-all ${
                          activeTab === 'apikeys' 
                          ? (isConfigReady ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300')
                          : (isConfigReady ? 'bg-white text-green-600 border-green-200 hover:bg-green-50' : 'bg-white text-red-600 border-red-200 hover:bg-red-50')
                      }`}
                      title="API Configuration"
                   >
                      <Settings className="w-5 h-5" />
                   </button>
                   
                   <button 
                      onClick={() => handleNavigation('idea' as any)} 
                      className={`flex-1 h-9 rounded-lg text-[10px] font-bold border transition-all flex flex-row items-center justify-center gap-1 ${activeTab === 'idea' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                   >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>IDEA</span>
                   </button>
                   
                   <button 
                      onClick={() => handleNavigation('prompt' as any)} 
                      className={`flex-1 h-9 rounded-lg text-[10px] font-bold border transition-all flex flex-row items-center justify-center gap-1 ${activeTab === 'prompt' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                   >
                      <Command className="w-3.5 h-3.5" />
                      <span>PROMPT</span>
                   </button>

                   <button 
                      onClick={() => handleNavigation('metadata' as any)} 
                      className={`flex-1 h-9 rounded-lg text-[10px] font-bold border transition-all flex flex-row items-center justify-center gap-1 ${activeTab === 'metadata' ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                   >
                      <Database className="w-3.5 h-3.5" />
                      <span>METADATA</span>
                   </button>

                   <button 
                      onClick={() => handleNavigation('logs')} 
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center border transition-all ${
                          activeTab === 'logs' 
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                      title="System Logs"
                   >
                      <Activity className="w-5 h-5" />
                   </button>
               </div>
               
               <div className="px-2 pb-2 h-9">
                  <div className="bg-blue-50 border border-blue-100 rounded px-3 py-1.5 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Active Workspace</span>
                       <span className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1 truncate max-w-[150px]">{activeModeLabel} <ChevronRight size={12} className="shrink-0" /></span>
                  </div>
               </div>
            </div>
  
            <div ref={sidebarContentRef} className="flex-1 bg-gray-50 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200">
                <div className="p-4 flex flex-col gap-4">
                    {activeTab === 'idea' && (
                        <IdeaSettings 
                            settings={settings} setSettings={setSettings} isProcessing={isCurrentTabProcessing} 
                            isPaidUnlocked={isPaidUnlocked} setIsPaidUnlocked={setIsPaidUnlocked} 
                            onRestoreHistory={handleRestoreHistory} hasHistory={hasHistory}
                        />
                    )}
                    {activeTab === 'prompt' && <PromptSettings settings={settings} setSettings={setSettings} isProcessing={isCurrentTabProcessing} onRestoreHistory={handleRestorePromptHistory} hasHistory={hasPromptHistory} />}
                    {activeTab === 'metadata' && (
                    <MetadataSettings 
                        settings={settings} 
                        setSettings={setSettings} 
                        isProcessing={isCurrentTabProcessing} 
                        onFilesUpload={(fl) => processFiles(fl, 'metadata')}
                        hasVideo={hasVideoFiles}
                    />
                    )}
                    {activeTab === 'apikeys' && (
                        <ApiKeyPanel 
                            apiKeys={currentProviderKeys} setApiKeys={handleUpdateCurrentProviderKeys} isProcessing={isProcessing} 
                            mode='metadata' provider={settings.apiProvider}
                            setProvider={(p) => setSettings(prev => ({ ...prev, apiProvider: p }))}
                            geminiModel={settings.geminiModel} setGeminiModel={(m) => setSettings(prev => ({ ...prev, geminiModel: m }))}
                            workerCount={settings.workerCount} setWorkerCount={(num) => setSettings(prev => ({ ...prev, workerCount: num }))}
                            apiDelay={apiDelay} setApiDelay={setApiDelay}
                            appColor={appColor} setAppColor={setAppColor}
                        />
                    )}

                    {activeTab === 'logs' && (
                        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex flex-col gap-2">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Logs Perspective</label>
                            <div className="flex gap-3 p-1 bg-gray-100 rounded-lg w-full h-[46px]">
                                <button
                                    onClick={() => setLogViewMode('transparent')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium rounded-md transition-all ${
                                        logViewMode === 'transparent' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    Transparent
                                </button>
                                <button
                                    onClick={() => setLogViewMode('clipped')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-base font-medium rounded-md transition-all ${
                                        logViewMode === 'clipped' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    Clipped
                                </button>
                            </div>
                            </div>

                            <div className={`relative flex h-[540px] shrink-0 flex-col overflow-hidden rounded-lg border transition-all duration-500 ${
                                logViewMode === 'transparent' 
                                    ? 'bg-white/40 backdrop-blur-md border-blue-200/60 shadow-none' 
                                    : 'bg-white border-blue-200 shadow-sm'
                            }`}>
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
                            </div>
                        </div>
                    )}

                    {/* ACTIVITY & ACTIONS INSIDE SCROLLABLE AREA */}
                    {activeTab !== 'logs' && activeTab !== 'apikeys' && (
                        <div className="flex flex-col gap-4 mt-2">
                            {/* ACTIVITY STATUS */}
                            <div className={`bg-white rounded-lg border ${getStatusBorderColor()} shadow-sm transition-all duration-300 overflow-hidden`}>
                                <div className="grid grid-cols-3 gap-0 border-b border-gray-100 p-2 bg-gray-50">
                                    <div className="flex flex-col items-center justify-center border border-blue-200 rounded-lg bg-blue-50 py-2.5 shadow-sm transition-all">
                                        <div className="flex items-center gap-1 mb-1 text-blue-600">
                                            <Clock size={13} className="shrink-0" />
                                            <span className="text-sm font-normal capitalize leading-none">Selected</span>
                                        </div>
                                        <span className="text-xs font-black text-blue-600 tabular-nums">{displayTotalFiles}</span>
                                    </div>
                                    <div className="mx-1.5 flex flex-col items-center justify-center border border-green-200 rounded-lg bg-green-50 py-2.5 shadow-sm transition-all">
                                        <div className="flex items-center gap-1 mb-1 text-green-600">
                                            <CheckCircle size={13} className="shrink-0" />
                                            <span className="text-sm font-normal capitalize leading-none">Completed</span>
                                        </div>
                                        <span className="text-xs font-black text-green-700 tabular-nums">{completedCount}</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center border border-red-200 rounded-lg bg-red-50 py-2.5 shadow-sm transition-all">
                                        <div className="flex items-center gap-1 mb-1 text-red-600">
                                            <XCircle size={13} className="shrink-0" />
                                            <span className="text-sm font-normal capitalize leading-none">Failed</span>
                                        </div>
                                        <span className="text-xs font-black text-red-700 tabular-nums">{failedCount}</span>
                                    </div>
                                </div>
                                
                                <div className="p-3 bg-white flex items-center justify-between gap-3">
                                    <button 
                                        onClick={handleClearAll} 
                                        disabled={currentFiles.length === 0 || (isCurrentTabProcessing && !isCurrentTabPaused)} 
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold uppercase tracking-wide rounded border transition-colors ${currentFiles.length > 0 && (!isCurrentTabProcessing || isCurrentTabPaused) ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'}`}
                                    >
                                        <Trash2 size={14} /> CLEAR ALL
                                    </button>
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex gap-1.5 h-12">
                                {isCurrentTabProcessing ? (
                                    <div className={`flex-1 bg-gradient-to-r border text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm select-none transition-all duration-300 ${getLoadingButtonStyle()}`}>
                                        <Sparkles className={`w-4 h-4 ${isPaused ? '' : 'animate-spin'} ${getLoadingIconColor()}`} style={{ animationDuration: '3s' }} />
                                        <span className="uppercase truncate tracking-wide">{isPaused ? 'Terhenti' : 'Memproses...'}</span>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={startProcessing} 
                                        disabled={!canGenerate || isProcessing} 
                                        className={`flex-1 text-sm font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2 uppercase tracking-wide truncate ${getGenerateButtonColor()}`}
                                    >
                                        <Wand2 size={14} className="shrink-0" />
                                        <span className="truncate">{getGenerateButtonText()}</span>
                                    </button>
                                )}
                                
                                <button 
                                    onClick={togglePause}
                                    disabled={!isCurrentTabProcessing}
                                    title={isCurrentTabPaused ? "Resume Process" : "Pause Process"}
                                    className={`w-12 h-12 flex items-center justify-center rounded-lg border shadow-sm transition-all active:scale-95 shrink-0 ${
                                        !isCurrentTabProcessing 
                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                                        : isCurrentTabPaused 
                                          ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' 
                                          : 'bg-amber-100 border-amber-300 text-amber-600 hover:bg-amber-200'
                                    }`}
                                >
                                    {isCurrentTabPaused ? <Play size={18} className="fill-current" /> : <Pause size={18} className="fill-current" />}
                                </button>

                                <button 
                                    onClick={() => handleDownload()} 
                                    disabled={completedCount === 0 || (isCurrentTabProcessing && !isCurrentTabPaused)} 
                                    className={`flex-1 text-sm font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2 uppercase tracking-wide ${completedCount > 0 && (!isCurrentTabProcessing || isCurrentTabPaused) ? 'bg-green-600 hover:bg-green-700 text-white border border-green-700' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'}`}
                                >
                                    <Download size={14} className="shrink-0" /> 
                                    <span className="truncate">{getExportLabel()}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </aside>
  
          <section className={`flex-1 flex-col md:overflow-hidden relative order-2 min-h-0 bg-gray-100 ${isSidebarOnlyMode ? 'hidden md:flex' : 'flex'}`}>
            {isSidebarOnlyMode ? (
                <div className="flex h-full flex-col items-center justify-center bg-gray-50 p-8">
                    <div className="flex max-w-sm flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                            {activeTab === 'apikeys' ? <Key size={32} /> : <Activity size={32} />}
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
                          <><Lightbulb size={64} className="mb-4 text-blue-500 opacity-20" /><p className="text-base font-medium uppercase">Idea Workspace Ready.</p><p className="mt-1 max-w-xs text-center text-sm text-gray-500">{settings.ideaMode === 'free' ? (settings.ideaCategory === 'file' ? "Upload a file in Idea Settings to generate concepts." : "Select a category and quantity to generate new concepts."): (settings.ideaSourceLines && settings.ideaSourceLines.length > 0 ? "Database loaded. Specify Start Row & Quantity, then click 'Generate' to start extraction." : "Upload a Database file in Idea Settings (MODE 2) to start.")}</p></>
                          ) : activeTab === 'prompt' ? (
                          <><Command size={64} className="mb-4 text-blue-500 opacity-20" /><p className="text-base font-medium uppercase">Prompt Generator Ready.</p><p className="mt-1 max-w-xs text-center text-sm text-gray-500">{settings.promptPlatform === 'file' ? "Upload a file in Prompt Settings to generate detailed prompts from visual analysis." : "Enter an Idea, Description, and Quantity to start."}</p></>
                          ) : (
                          <><UploadCloud size={64} className="mb-4 opacity-20" /><p className="text-base font-medium uppercase">No files in {activeTab.toUpperCase()} workspace.</p><p className="mt-1 text-sm">Upload files to start.</p></>
                          )}
                      </div>
                      ) : (
                      activeTab === 'idea' ? (
                          <IdeaListComponent 
                            items={currentFiles} 
                            negativeContext={settings.ideaNegativeContext} 
                            onDelete={handleDelete}
                            onToggleLanguage={handleToggleLanguage}
                            getLanguage={getLanguage}
                            isMode1={settings.ideaMode === 'free'}
                          />
                      ) : activeTab === 'prompt' ? (
                          <PromptListComponent items={currentFiles} onDelete={handleDelete} onToggleLanguage={handleToggleLanguage} getLanguage={getLanguage} />
                      ) : (
                          <div className="grid grid-cols-1 gap-4 pb-20 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:pb-0">
                          {currentFiles.map(file => {
                              return (
                                  <FileCard 
                                  key={file.id} item={file} onDelete={handleDelete} onUpdate={handleUpdateMetadata}
                                  onRetry={(id) => {
                                      const targetKey = getActiveDataKey();
                                      setFilesMap(prev => ({ ...prev, [targetKey]: prev[targetKey].map(f => f.id === id ? { ...f, status: ProcessingStatus.Pending } : f) }));
                                  }}
                                  onPreview={setPreviewItem} language={getLanguage(file.id)} onToggleLanguage={handleToggleLanguage} disabled={isCurrentTabProcessing} platform={settings.metadataPlatform}
                                  />
                              );
                          })}
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
