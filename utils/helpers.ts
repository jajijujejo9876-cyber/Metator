
import { Category, FileItem, AppSettings } from "../types";
import { CATEGORIES, SHUTTERSTOCK_CATEGORIES } from "../constants";

export const generateProjectName = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `Project_${hour}.${minute}_${day}-${month}-${year}`;
};

// SECURITY HELPER
const PASS_TOKEN = "QklTTUlMTEFI"; 

export const checkPassword = (input: string): boolean => {
  try {
      const normalized = input.trim().toUpperCase();
      return btoa(normalized) === PASS_TOKEN;
  } catch (e) {
      return false;
  }
};

export const getCategoryName = (id: string, lang: 'ENG' | 'IND', platform: string = 'Adobe Stock'): string => {
  const activeList = platform === 'Shutterstock' ? SHUTTERSTOCK_CATEGORIES : CATEGORIES;
  const cat = activeList.find(c => c.id === id);
  if (!cat) return id;
  return lang === 'ENG' ? cat.en : cat.id_lang;
};

// CSV Export
export const downloadCSV = (files: FileItem[], customFilename?: string, platform: string = 'Adobe Stock'): string => {
  const isIdeaExport = files.some(f => f.sourceData !== undefined);
  const isPromptMode = isIdeaExport && !files[0].metadata.en.title.includes('|||') && files[0].sourceData?.originalKeywords !== undefined;
  const isShutterstock = platform === 'Shutterstock';

  let header: string[];
  let rows: string[];

  if (isPromptMode) {
     header = ['Row_ID', 'Prompt_EN', 'Prompt_IND'];
     rows = files.map((f, index) => {
        return [
           index + 1,
           `"${(f.metadata.en.title || "").replace(/"/g, '""')}"`,
           `"${(f.metadata.ind.title || "").replace(/"/g, '""')}"`
        ].join(',');
     });
  } else if (isIdeaExport) {
     const isMode1 = files.some(f => f.metadata.en.title.includes('|||'));

     if (isMode1) {
        header = [
            'Row_ID', 
            'Title_EN', 'Visual_EN', 'Keywords_EN',
            'Title_IND', 'Visual_IND', 'Keywords_IND'
        ];
        
        rows = files.map(f => {
          const rowId = f.sourceData ? `Row_${f.sourceData.id}` : f.file.name;
          const [enTitle, enVisual] = (f.metadata.en.title || "").split('|||').map(s => s.trim());
          const [indTitle, indVisual] = (f.metadata.ind.title || "").split('|||').map(s => s.trim());

          return [
            rowId, 
            `"${(enTitle || "").replace(/"/g, '""')}"`,
            `"${(enVisual || "").replace(/"/g, '""')}"`,
            `"${(f.metadata.en.keywords || "").replace(/"/g, '""')}"`,
            `"${(indTitle || "").replace(/"/g, '""')}"`,
            `"${(indVisual || "").replace(/"/g, '""')}"`,
            `"${(f.metadata.ind.keywords || "").replace(/"/g, '""')}"`
          ].join(',');
        });
     } else {
        header = ['Row_ID', 'Extracted_Data_EN', 'Extracted_Data_IND', 'Note'];
        rows = files.map(f => {
            const rowId = f.sourceData ? `Row_${f.sourceData.id}` : f.file.name;
            const textEn = f.metadata.en.title;
            const textInd = f.metadata.ind.title || textEn;
            const isVulgar = isNSFW(textEn);
            
            return [
                rowId,
                `"${(textEn || "").replace(/"/g, '""')}"`,
                `"${(textInd || "").replace(/"/g, '""')}"`,
                isVulgar ? "NSFW/Vulgar Content Detected" : "Clean"
            ].join(',');
        });
     }
  } else {
     // Metadata Mode
     const titleHeader = isShutterstock ? 'description' : 'title';
     header = ['filename', titleHeader, 'keywords', 'category'];
     rows = files.map(f => {
        const title = `"${f.metadata.en.title.replace(/"/g, '""')}"`;
        const keywords = `"${f.metadata.en.keywords.replace(/"/g, '""')}"`;
        const categoryName = getCategoryName(f.metadata.category, 'ENG', platform);
        
        return [
          f.file.name,
          title,
          keywords,
          categoryName
        ].join(',');
      });
  }

  const csvContent = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const fileName = customFilename && customFilename.trim() !== '' 
    ? `${customFilename.trim()}.csv` 
    : `IsaMetadata.csv`;
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return fileName;
};

// TXT Export
export const downloadTXT = (files: FileItem[], customFilename?: string): string => {
  const isIdeaExport = files.some(f => f.sourceData !== undefined);
  const isPromptMode = isIdeaExport && !files[0].metadata.en.title.includes('|||') && files[0].sourceData?.originalKeywords !== undefined;

  let content = "";

  if (isPromptMode) {
     content = files.map((f, index) => {
        return `=== Prompt ${index + 1} ===\n[EN]\n${f.metadata.en.title}\n\n[IND]\n${f.metadata.ind.title}\n----------------------------------------\n`;
     }).join('\n');
  } else if (isIdeaExport) {
     const isMode1 = files.some(f => f.metadata.en.title.includes('|||'));

     if (isMode1) {
        content = files.map(f => {
          const rowId = f.sourceData ? `Row ${f.sourceData.id}` : f.file.name;
          const [enTitle, enVisual] = (f.metadata.en.title || "").split('|||').map(s => s.trim());
          const [indTitle, indVisual] = (f.metadata.ind.title || "").split('|||').map(s => s.trim());

          return `=== ${rowId} ===
[EN]
Title: ${enTitle}
Visual: ${enVisual}
Keywords: ${f.metadata.en.keywords}

[IND]
Title: ${indTitle}
Visual: ${indVisual}
Keywords: ${f.metadata.ind.keywords}
----------------------------------------
`;
        }).join('\n');
     } else {
        content = files.map(f => {
            const rowId = f.sourceData ? f.sourceData.id : f.file.name;
            const textEn = f.metadata.en.title;
            const textInd = f.metadata.ind.title || textEn;
            const isVulgar = isNSFW(textEn);
            
            const displayEn = isVulgar ? "--- Content Hidden (NSFW) ---" : textEn;
            const displayInd = isVulgar ? "--- Content Hidden (NSFW) ---" : textInd;
            const note = isVulgar ? " [WARNING: NSFW]" : "";
            
            return `${rowId}.\n[EN] ${displayEn}\n[IND] ${displayInd}${note}\n`;
        }).join('\n');
     }
  } else {
     content = files.map(f => {
        return `Filename: ${f.file.name}\nTitle/Prompt: ${f.metadata.en.title}\nKeywords/Params: ${f.metadata.en.keywords}\nCategory: ${getCategoryName(f.metadata.category, 'ENG')}\n----------------------------------------\n`;
      }).join('\n');
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const fileName = customFilename && customFilename.trim() !== '' 
    ? `${customFilename.trim()}.txt` 
    : `IsaMetadata.txt`;
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return fileName;
};

// Helper to extract a dynamic number of frames from a video file with downscaling
export const extractVideoFrames = async (videoFile: File, frameCount: number = 3): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    
    // Generate timestamps evenly across the duration
    const timestamps: number[] = [];
    if (frameCount <= 1) {
        timestamps.push(0.5);
    } else {
        const step = 0.8 / (frameCount - 1);
        for (let i = 0; i < frameCount; i++) {
            timestamps.push(0.1 + (i * step));
        }
    }

    let currentStep = 0;

    const url = URL.createObjectURL(videoFile);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      // SET MAX RESOLUTION TO 1024px TO PREVENT OUT OF MEMORY
      const MAX_SIZE = 1024;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      video.currentTime = video.duration * timestamps[0];
    };

    video.onseeked = () => {
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context failed"));
        return;
      }
      
      // Draw image with calculated downscaled width and height
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);

      currentStep++;
      if (currentStep < timestamps.length) {
        video.currentTime = video.duration * timestamps[currentStep];
      } else {
        URL.revokeObjectURL(url);
        resolve(frames);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Error loading video"));
    };
  });
};

// === TEXT PROCESSING ===

const BAD_WORDS = [
  'porn', 'sex', 'nude', 'naked', 'xxx', 'erotic', 'boobs', 'tits', 'pussy', 
  'fuck', 'dick', 'cock', 'penis', 'vagina', 'ass', 'orgasm', 'masturbate',
  'bitch', 'whore', 'slut', 'milf', 'fetish', 'bdsm', 'rape', 'incest',
  'anal', 'blowjob', 'cum', 'ejaculate', 'hentai', 'stripper', 'escort',
  'sexy', 'hot girl', '18+', 'adult', 'bathroom', 'toilet', 'change clothes', 'changing clothes', 
  'undress', 'undressing', 'bhabhi', 'auntie', 'desi', 'upskirt', 'birth', 'giving birth', 'pregnant', 'bloody', 'injury', 'gore'
];

export const isNSFW = (text: string): boolean => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return BAD_WORDS.some(word => {
        const regex = new RegExp(`\\b${word.replace(/\+/g, '\\+')}\\b`, 'i');
        return regex.test(lower);
    });
};

export const extractSlugFromUrl = (url: string): string => {
  try {
    const cleanUrl = url.trim();
    let text = "";

    // 1. Check for Query Params first (e.g. ?k=, ?q=, ?search=)
    if (cleanUrl.includes('?')) {
        try {
            const urlObj = new URL(cleanUrl);
            const params = new URLSearchParams(urlObj.search);
            const query = params.get('k') || params.get('q') || params.get('search') || params.get('query');
            
            if (query) {
                text = decodeURIComponent(query);
                text = text.replace(/['"]/g, '');
                text = text.replace(/\+/g, ' ');
                text = text.replace(/\s+/g, ' ').trim();
                return text;
            }
        } catch (e) {}
    }

    // 2. Path Extraction logic
    const pathParts = cleanUrl.replace(/^https?:\/\/[^\/]+\//, '').split('?')[0].split('/');
    
    let bestSegment = "";
    for (let i = pathParts.length - 1; i >= 0; i--) {
        const seg = pathParts[i];
        if (!seg || /^\d+$/.test(seg)) continue; // Skip IDs
        if (['video', 'image', 'photo', 'vector', 'search', 'contributor', 'portfolio'].includes(seg.toLowerCase())) continue;
        bestSegment = seg;
        break;
    }
    
    if (!bestSegment) return url;

    // 3. Post-processing Segment
    bestSegment = bestSegment.replace(/\.(jpg|jpeg|png|eps|ai|svg|mp4|html|php|htm|zip|7z)$/i, '');
    bestSegment = bestSegment.replace(/[-_]\d{5,15}$/, '');
    bestSegment = bestSegment.replace(/[-_+]/g, ' ');
    bestSegment = bestSegment.replace(/\s+/g, ' ').trim();
    
    return bestSegment || url;
  } catch (e) {
    return url;
  }
};

export const filterSafeText = (text: string): string => {
  let clean = text.toLowerCase();
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/\+/g, '\\+')}\\b`, 'gi');
    clean = clean.replace(regex, '');
  });
  return clean.replace(/\s+/g, ' ').trim();
};
