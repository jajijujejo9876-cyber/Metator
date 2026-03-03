import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, FileItem, FileMetadata, FileType, Language, AppMode, ChatMessage } from "../types";
import { CATEGORIES, SHUTTERSTOCK_CATEGORIES } from "../constants";
import { extractVideoFrames } from "../utils/helpers";

const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const base64String = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type || 'application/octet-stream', 
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.readAsDataURL(file);
  });
};

const convertSvgToWhiteBgJpeg = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const base64String = dataUrl.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: 'image/jpeg', 
          },
        });
      };
      img.onerror = () => reject(new Error("Failed to load SVG image"));
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const compressImage = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 3000; 
        const MAX_HEIGHT = 3000;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95); 
        const base64String = dataUrl.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: 'image/jpeg', 
          },
        });
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const SUPREME_METADATA_PROTOCOL = `
### SUPREME STOCK METADATA SEO PROTOCOL (LITERAL ANALYSIS ONLY) ###
Anda adalah Analis SEO Microstock Elit. Ikuti protokol ketat ini:

STEP 1: VISUAL IDENTITY LOCK (MANDATORY)
- Identifikasi 3 objek LITERAL paling menonjol.
- Identifikasi warna asli, lingkungan, dan aksi fisik.
- Metadata WAJIB berakar HANYA dari observasi objek nyata ini.

STEP 2: RUMUS PENULISAN JUDUL
- FORMULA: [Nama Objek Utama] + [Setting/Kondisi Visual Langsung] + [Tujuan/Konteks Komersial].
- KATA PERTAMA: Harus berupa nama objek literal (Subjek Utama).
- NO OPINIONS: Dilarang keras kata-kata seperti "beautiful, stunning, amazing, best quality".
- DESKRIPSI TEKNIS: Fokus pada material, pencahayaan, dan tekstur.

STEP 3: LOGIKA KATA KUNCI (SEO HIERARCHY)
- TOTAL: Tepat [KW_COUNT] kata kunci.
- ZERO HALLUCINATION: Jangan tulis objek yang tidak ada di dalam aset.
- PRIORITAS: 20 kata kunci pertama WAJIB berupa frasa (2-3 kata) yang mendeskripsikan subjek secara mendalam.

STEP 4: BLACKLIST (STRICT PROHIBITION)
- DILARANG menulis spesifikasi teknis (4K, HD, 8K, Resolution).
- DILARANG menulis jenis file (Vector, AI, Photo, Footage, EPS).
- DILARANG menulis nama brand, logo, atau tokoh publik.
- DILARANG menggunakan template umum.

ASSIGN CATEGORY:
- Pilih tepat SATU kategori dari list yang diberikan berdasarkan subjek literal utama.
`;

// Fungsi utama API
export const generateMetadataForFile = async (
  fileItem: FileItem,
  settings: AppSettings,
  apiKey: string, // Tetap dibiarkan sebagai parameter biar App.tsx nggak error, tapi nilainya nggak kita pakai.
  mode: AppMode = 'metadata'
): Promise<{ metadata: FileMetadata; thumbnail?: string; generatedImageUrl?: string; }> => {
  
  // Karena kita pakai internal Gemini Canvas, kita deteksi environment key-nya secara otomatis.
  const actualApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || 'internal_canvas_key';

  try {
    let systemInstruction = "";
    let promptText = "";
    let temperature = 0.1;
    let outputSchema: any;

    if (mode === 'metadata') {
        const platform = settings.metadataPlatform || 'Adobe Stock';
        const activeCategories = platform === 'Shutterstock' ? SHUTTERSTOCK_CATEGORIES : CATEGORIES;
        const categoryList = activeCategories.map(c => `"${c.id}" = ${c.en}`).join('\n');
        
        const minChars = settings.titleMin || 50;
        const maxChars = settings.titleMax || 150;
        const kwTotal = settings.slideKeyword || 40;

        systemInstruction = `LANGUAGE: Hasilkan field 'en' dalam Bahasa Inggris dan field 'ind' dalam Bahasa Indonesia yang merupakan terjemahan profesionalnya.\n\n${SUPREME_METADATA_PROTOCOL}`
            .replace('[KW_COUNT]', kwTotal.toString());

        systemInstruction += `\n\nATURAN PANJANG JUDUL: Minimum ${minChars} karakter, Maksimum ${maxChars} karakter.\nPLATFORM: ${platform}\nCATEGORIES:\n${categoryList}`;
        
        promptText = `ANALISIS MANDATORI: Perhatikan aset ini. JANGAN menebak. Identifikasi objek, material, dan warna yang eksak. Tulis metadata yang 100% literal dan SEO-optimized sesuai protokol Supreme.`;
        
        if (settings.customTitle || settings.customKeyword) {
            promptText += `\n\nINFO TAMBAHAN DARI USER (Gunakan jika relevan): \nTitle: ${settings.customTitle}\nKeywords: ${settings.customKeyword}`;
        }
        if (settings.negativeMetadata) {
            promptText += `\n\nNEGATIVE CONTEXT (Hindari kata-kata ini): ${settings.negativeMetadata}`;
        }

        outputSchema = {
          type: Type.OBJECT,
          properties: {
            en: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keywords: { type: Type.STRING } }, required: ["title", "keywords"] },
            ind: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keywords: { type: Type.STRING } }, required: ["title", "keywords"] },
            category: { type: Type.STRING }
          },
          required: ["en", "ind", "category"]
        };

    } else if (mode === 'idea') {
        temperature = 0.9; // Dinaikkan sedikit biar idenya lebih liar dan kreatif
        
        // SCHEMA KHUSUS IDEA (Hanya mengembalikan 1 baris teks ide)
        outputSchema = {
           type: Type.OBJECT,
           properties: {
              en_idea: { type: Type.STRING, description: "1 short line of visual concept idea (max 10 words)" }, 
              ind_idea: { type: Type.STRING, description: "1 baris ide konsep visual singkat (maks 10 kata)" }
           },
           required: ["en_idea", "ind_idea"]
        };

        const kategoriDipilih = settings.ideaCategory;
        const instruksiPengguna = settings.ideaCustomInstruction;

        // PENGGABUNGAN PROMPT SAKTI
        systemInstruction = `Bertindak sebagai Senior Microstock Analyst. Berikan 1 ide konsep visual bernilai komersial tinggi.
        
        TEMA/KATEGORI: ${kategoriDipilih}
        (Jika tema 'auto', pilih secara acak tema yang paling laku di pasaran).
        
        ATURAN MUTLAK:
        1. Output HANYA berupa kalimat ide yang sangat singkat (1 baris, maksimal 5-10 kata).
        2. JANGAN sertakan judul, deskripsi panjang, atau keyword.
        3. Hasilkan dalam field JSON 'en_idea' (Inggris) dan 'ind_idea' (Indonesia).`;

        promptText = `INSTRUKSI TAMBAHAN DARI PENGGUNA: \n"${instruksiPengguna ? instruksiPengguna : "Tidak ada instruksi tambahan. Buat konsep serealistis dan sekomersial mungkin."}"`;
    } else {
        // Fallback schema for prompt
        outputSchema = {
          type: Type.OBJECT,
          properties: {
            en: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keywords: { type: Type.STRING } } },
            ind: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keywords: { type: Type.STRING } } },
            category: { type: Type.STRING }
          }
        };
    }

    let parts: any[] = [];
    if (mode === 'prompt' || (mode === 'idea' && settings.ideaCategory !== 'file')) {
      parts = [{ text: promptText }];
    } else if (fileItem.type === FileType.Video) {
      const requestedFrames = settings.videoFrameCount || 3;
      const frames = await extractVideoFrames(fileItem.file, requestedFrames);
      parts = frames.map(f => ({ inlineData: { mimeType: 'image/jpeg', data: f } }));
      parts.push({ text: promptText });
    } else {
      const mediaPart = (fileItem.type === FileType.Vector && fileItem.file.type === 'image/svg+xml') 
        ? await convertSvgToWhiteBgJpeg(fileItem.file) 
        : await compressImage(fileItem.file);
      parts = [mediaPart, { text: promptText }];
    }

    // Eksekusi ke Gemini Internal
    const ai = new GoogleGenAI({ apiKey: actualApiKey });
    const response: any = await ai.models.generateContent({
      model: settings.geminiModel || 'gemini-3-flash-preview',
      contents: { parts },
      config: { systemInstruction, responseMimeType: "application/json", responseSchema: outputSchema, temperature }
    });
    
    const parsed = JSON.parse(response.text);

    // Format Data Balikan Khusus Mode Idea
    if (mode === 'idea') {
        return {
            metadata: {
                en: { title: parsed.en_idea, keywords: "" }, // Keyword dikosongkan sengaja
                ind: { title: parsed.ind_idea, keywords: "" },
                category: settings.ideaCategory === 'auto' ? 'Idea' : settings.ideaCategory
            }
        };
    }

    // Format Data Balikan Metadata/Prompt
    return {
      metadata: { 
        en: { title: parsed.en?.title || "", keywords: parsed.en?.keywords || "" }, 
        ind: { title: parsed.ind?.title || "", keywords: parsed.ind?.keywords || "" }, 
        category: parsed.category || "Objects" 
      }
    };
  } catch (error: any) {
    throw error;
  }
};

export const translateMetadataContent = async (content: { title: string; keywords: string }, sourceLanguage: Language, apiKey: string): Promise<{ title: string; keywords: string }> => {
  const actualApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || apiKey || 'internal_canvas_key';
  const ai = new GoogleGenAI({ apiKey: actualApiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate to ${sourceLanguage === 'ENG' ? 'Indonesian' : 'English'}: ${content.title}`,
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING } } } }
  });
  return { title: JSON.parse(response.text).title, keywords: content.keywords };
};

export const translateText = async (text: string, targetLang: string, apiKey: string, settings: AppSettings): Promise<string> => {
    const actualApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || apiKey || 'internal_canvas_key';
    const ai = new GoogleGenAI({ apiKey: actualApiKey });
    const response = await ai.models.generateContent({
      model: settings.geminiModel || 'gemini-3-flash-preview',
      contents: `Translate text to ${targetLang}: ${text}`,
      config: { temperature: 0.1 }
    });
    return response.text || text;
};

export const generateChatResponse = async (history: ChatMessage[], newMessage: string, settings: AppSettings, apiKey: string): Promise<string> => {
    const actualApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || apiKey || 'internal_canvas_key';
    const ai = new GoogleGenAI({ apiKey: actualApiKey });
    const contents = history.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
    const response = await ai.models.generateContent({ 
        model: settings.geminiModel || 'gemini-3-flash-preview', 
        contents, 
        config: { systemInstruction: `IsaProject Chat Assistant.`, temperature: 0.7 } 
    });
    return response.text || "";
};
