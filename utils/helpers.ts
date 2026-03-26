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
  
  if (id.includes(',')) {
      return id.split(',').map(singleId => {
          const cat = activeList.find(c => c.id === singleId.trim() || c.en === singleId.trim());
          return cat ? (lang === 'ENG' ? cat.en : cat.id_lang) : singleId.trim();
      }).join(', ');
  }
  
  const cat = activeList.find(c => c.id === id || c.en === id);
  if (!cat) return id;
  return lang === 'ENG' ? cat.en : cat.id_lang;
};

// CSV Export - UNIVERSAL METADATA GENERATOR DENGAN 7 PLATFORM
export const downloadCSV = (files: FileItem[], customFilename?: string, platform: string = 'Adobe Stock', settings?: AppSettings): string => {
  const isIdeaExport = files.some(f => f.sourceData !== undefined);
  const isPromptMode = isIdeaExport && !files[0].metadata.en.title.includes('|||') && files[0].sourceData?.originalKeywords !== undefined;

  let header: string[] = [];
  let rows: string[] = [];
  let separator = ',';
  
  // Deteksi cerdas apakah batch ini isinya video
  const isVideoFile = (f: FileItem) => f.file.type.startsWith('video/') || f.file.name.toLowerCase().endsWith('.mp4') || f.file.name.toLowerCase().endsWith('.mov');
  const hasVideoInBatch = files.some(isVideoFile);

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
        header = ['Row_ID', 'Title_EN', 'Visual_EN', 'Keywords_EN', 'Title_IND', 'Visual_IND', 'Keywords_IND'];
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
     // === LOGIKA UNIVERSAL METADATA (7 PLATFORM) ===
     
     // 1. Setup Pemisah Kolom (Freepik butuh titik koma)
     if (platform === 'Freepik') separator = ';';

     // 2. Setup Auto-Slice Keyword Limit
     const userKeywordLimit = settings?.slideKeyword || 40;
     const maxPlatformLimit = platform === 'Dreamstime' ? 80 : 50;
     const finalKeywordLimit = Math.min(userKeywordLimit, maxPlatformLimit);

     // 3. Setup Header CSV Berdasarkan Platform
     if (platform === 'Shutterstock') {
         header = ['Filename', 'Description', 'Keywords', 'Categories', 'Editorial', 'Mature content', 'illustration'];
     } else if (platform === 'Dreamstime') {
         // Cek apakah pakai template Video atau Image
         if (hasVideoInBatch) {
             header = ['Filename', 'Video Name', 'Description', 'Category 1', 'Category 2', 'Category 3', 'keywords', 'W-EL', 'SR-EL', 'SR-Price', 'Editorial', 'MR doc Ids', 'Pr Docs'];
         } else {
             header = ['Filename', 'Image Name', 'Description', 'Category 1', 'Category 2', 'Category 3', 'keywords', 'Free', 'W-EL', 'P-EL', 'SR-EL', 'SR-Price', 'Editorial', 'MR doc Ids', 'Pr Docs'];
         }
     } else if (platform === 'Freepik') {
         header = ['Filename', 'Title', 'Keywords', 'Prompt', 'Model'];
     } else if (platform === 'MiriCanvas') {
         header = ['fileName', 'name', 'keywords', 'Content Type', 'License', 'AI generated Image'];
     } else if (platform === 'Vecteezy') {
         header = ['Filename', 'Title', 'Description', 'Keywords', 'License'];
     } else if (platform === 'Arabstock') {
         header = ['Filename', 'Title', 'Description', 'Keywords'];
     } else {
         header = ['Filename', 'Title', 'Keywords', 'Category']; // Default: Adobe Stock
     }

     rows = files.map(f => {
        let finalFilename = f.file.name;
        const isCurrentFileVideo = isVideoFile(f);
        
        // JURUS NINJA EPS
        if (settings?.epsMode) {
            finalFilename = finalFilename.replace(/\.(jpg|jpeg|png|webp)$/i, '') + '.eps';
        }

        // PERBAIKAN FORMAT KHUSUS DREAMSTIME (JANGAN GANGGU VIDEO!)
        if (platform === 'Dreamstime') {
            if (!isCurrentFileVideo && !finalFilename.toLowerCase().endsWith('.eps')) {
                // Pastikan akhiran foto adalah .jpg bukan .jpeg, dan jangan paksa jadi kapital .JPG
                finalFilename = finalFilename.replace(/\.jpeg$/i, '.jpg');
            }
        }
        
        // AMBIL TITLE & DESCRIPTION DARI HASIL AI
        // (Jika AI gagal generate description, fallback ke title untuk jaga-jaga)
        const titleClean = f.metadata.en.title.replace(/"/g, '""');
        const descClean = (f.metadata.en.description || f.metadata.en.title).replace(/"/g, '""');
        
        const title = `"${titleClean}"`;
        const description = `"${descClean}"`;
        
        // AUTO-SLICE KEYWORD
        const rawKeywords = f.metadata.en.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k !== "");
        const uniqueKeywords = Array.from(new Set(rawKeywords)).slice(0, finalKeywordLimit).join(', ');
        const keywords = `"${uniqueKeywords.replace(/"/g, '""')}"`;
        
        const targetCat = platform === 'Shutterstock' ? f.metadata.categoryShutter : f.metadata.category;
        const categoryName = `"${getCategoryName(targetCat || '', 'ENG', platform)}"`;
        const isIllustration = (f.type === 'Vector' || settings?.epsMode) ? 'yes' : 'no';

        // 4. SUSUN BARIS SESUAI KEBUTUHAN SPESIFIK PLATFORM
        if (platform === 'Shutterstock') {
            // Shutterstock hanya butuh Description
            return [finalFilename, description, keywords, categoryName, 'no', 'no', isIllustration].join(separator);
        } else if (platform === 'Dreamstime') {
            // --- LOGIKA PECAH KATEGORI DREAMSTIME ---
            // Ambil string dari laci memori (Misal: "112, 145, 105" atau kosong)
            const rawCatDream = f.metadata.categoryDream || "";
            // Belah berdasarkan koma, lalu bersihkan spasi
            const catArr = rawCatDream.split(',').map(c => c.trim());
            
            // Siapkan 3 laci khusus untuk di-ekspor (Kalau kosong atau kurang dari 3, diisi default 0.0)
            const cat1 = catArr[0] || "112"; // Kasih fallback default biar gak error
            const cat2 = catArr[1] || "0.0";
            const cat3 = catArr[2] || "0.0";

            if (hasVideoInBatch) {
               // Template Video (13 Kolom): Kolom 4, 5, 6 adalah Kategori
               return [finalFilename, title, description, cat1, cat2, cat3, keywords, '', '', '', '', '', ''].join(separator);
            } else {
               // Template Image (15 Kolom): Kolom 4, 5, 6 adalah Kategori
               return [finalFilename, title, description, cat1, cat2, cat3, keywords, '', '', '', '', '', '', '', ''].join(separator);
            }
        } else if (platform === 'Freepik') {
            // Freepik hanya butuh Title
            return [finalFilename, title, keywords, '""', '""'].join(separator);
        } else if (platform === 'MiriCanvas') {
            // MiriCanvas hanya butuh Title
            return [finalFilename, title, keywords, '""', 'Premium', 'Y'].join(separator);
        } else if (platform === 'Vecteezy') {
            // Vecteezy butuh Title & Description
            return [finalFilename, title, description, keywords, 'Free'].join(separator);
        } else if (platform === 'Arabstock') {
            // Arabstock butuh Title & Description
            return [finalFilename, title, description, keywords].join(separator);
        } else {
            // Default: Adobe Stock hanya butuh Title
            return [finalFilename, title, keywords, categoryName].join(separator); 
        }
     });
  }

  const csvContent = [header.join(separator), ...rows].join('\n');
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

          return `=== ${rowId} ===\n[EN]\nTitle: ${enTitle}\nVisual: ${enVisual}\nKeywords: ${f.metadata.en.keywords}\n\n[IND]\nTitle: ${indTitle}\nVisual: ${indVisual}\nKeywords: ${f.metadata.ind.keywords}\n----------------------------------------\n`;
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
        // Tampilkan juga Description di hasil TXT jika ada
        const descText = f.metadata.en.description ? `\nDescription: ${f.metadata.en.description}` : '';
        return `Filename: ${f.file.name}\nTitle/Prompt: ${f.metadata.en.title}${descText}\nKeywords/Params: ${f.metadata.en.keywords}\nCategory: ${getCategoryName(f.metadata.category, 'ENG')}\n----------------------------------------\n`;
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

    const pathParts = cleanUrl.replace(/^https?:\/\/[^\/]+\//, '').split('?')[0].split('/');
    
    let bestSegment = "";
    for (let i = pathParts.length - 1; i >= 0; i--) {
        const seg = pathParts[i];
        if (!seg || /^\d+$/.test(seg)) continue;
        if (['video', 'image', 'photo', 'vector', 'search', 'contributor', 'portfolio'].includes(seg.toLowerCase())) continue;
        bestSegment = seg;
        break;
    }
    
    if (!bestSegment) return cleanUrl;

    bestSegment = bestSegment.replace(/\.(jpg|jpeg|png|eps|ai|svg|mp4|html|php|htm|zip|7z)$/i, '');
    bestSegment = bestSegment.replace(/[-_]\d{5,15}$/, '');
    bestSegment = bestSegment.replace(/[-_+]/g, ' ');
    bestSegment = bestSegment.replace(/\s+/g, ' ').trim();
    
    return bestSegment || cleanUrl;
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
