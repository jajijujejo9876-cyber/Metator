
import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, FileItem, FileMetadata, FileType, Language, AppMode, ApiProvider, ChatMessage, ProcessingStatus } from "../types";
import { DEFAULT_PROMPT_TEMPLATE, CATEGORIES, SHUTTERSTOCK_CATEGORIES, APP_CODE_CONTEXT, BLEND_CATEGORIES, BLEND_CRITERIA } from "../constants";
import { extractVideoFrames } from "../utils/helpers";
import { v4 as uuidv4 } from 'uuid';

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

const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const binary = atob(base64);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: mimeType });
};

interface GenerationResult {
  metadata: FileMetadata;
  thumbnail?: string;
  generatedImageUrl?: string;
  isScientific?: boolean;
}

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
- DESKRIPSI TEKNIS: Fokus pada material, pencahayaan, dan tekstur (Contoh: "Glossy blue glass bowl", "Soft sunset lighting over mountain").

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

const callPuterApi = async (
  messages: any[], 
  apiKey: string, 
  model: string,
  responseSchema?: any,
  temperature: number = 0.1
): Promise<any> => {
  const puter = (window as any).puter;
  if (!puter) throw new Error("Puter.js library not found on page.");

  try {
    const response = await puter.ai.chat(messages, {
        model: model,
        temperature: temperature,
        stream: false
    });
    
    const content = response?.toString() || "";
    if (!content) throw new Error("Empty response from Puter AI");

    if (responseSchema) {
        let cleanJson = content.replace(/```json\n?|```/g, "");
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(cleanJson);
    }
    return content;
  } catch (error: any) {
    throw error; 
  }
};

const callCompatibleApi = async (
  parts: any[], 
  systemInstruction: string, 
  apiKey: string, 
  baseUrl: string, 
  model: string,
  provider: ApiProvider,
  responseSchema?: any,
  temperature: number = 0.1,
  chatHistory?: ChatMessage[]
): Promise<any> => {
  const messages: any[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  const hasImages = parts.some(p => p.inlineData);
  let userContent: any;
  if (hasImages) {
      userContent = parts.map(part => {
        if (part.text) return { type: "text", text: part.text };
        if (part.inlineData) return { type: "image_url", image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` } };
        return null;
      }).filter(Boolean);
  } else {
      userContent = parts.map(p => p.text).filter(Boolean).join("\n\n");
  }
  messages.push({ role: "user", content: userContent });
  const payload: any = { model: model, messages: messages, temperature: temperature };
  if (responseSchema) payload.response_format = { type: "json_object" };

  let endpoint = baseUrl;
  if (!endpoint.includes('/chat/completions')) {
      endpoint = endpoint.endsWith('/') ? `${endpoint}chat/completions` : `${endpoint}/chat/completions`;
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error ${response.status}: ${errText}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response content from API");
  if (responseSchema) {
      let cleanJson = content.replace(/```json\n?|```/g, "");
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      return JSON.parse(cleanJson);
  }
  return content;
};

export const generateMetadataForFile = async (
  fileItem: FileItem,
  settings: AppSettings,
  apiKey: string,
  mode: AppMode = 'metadata'
): Promise<GenerationResult> => {
  const provider = settings.apiProvider || 'AUTO';
  const actualApiKey = provider === 'AUTO' ? process.env.API_KEY || '' : apiKey;
  const puter = (window as any).puter;
  const tempFiles: string[] = [];

  try {
    const multilingualInstruction = `LANGUAGE: Hasilkan field 'en' dalam Bahasa Inggris dan field 'ind' dalam Bahasa Indonesia yang merupakan terjemahan profesionalnya.`;
    let systemInstruction = "";
    let promptText = "";
    let temperature = 0.1;
    let outputSchema: any = {
      type: Type.OBJECT,
      properties: {
        en: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keywords: { type: Type.STRING } }, required: ["title", "keywords"] },
        ind: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keywords: { type: Type.STRING } }, required: ["title", "keywords"] },
        category: { type: Type.STRING }
      },
      required: ["en", "ind", "category"]
    };

    if (mode === 'metadata') {
        const platform = settings.metadataPlatform || 'Adobe Stock';
        const activeCategories = platform === 'Shutterstock' ? SHUTTERSTOCK_CATEGORIES : CATEGORIES;
        const categoryList = activeCategories.map(c => `"${c.id}" = ${c.en}`).join('\n');
        
        const minChars = settings.titleMin || 50;
        const maxChars = settings.titleMax || 150;
        const kwTotal = settings.slideKeyword || 40;

        systemInstruction = `${multilingualInstruction}\n\n${SUPREME_METADATA_PROTOCOL}`
            .replace('[KW_COUNT]', kwTotal.toString());

        systemInstruction += `\n\nATURAN PANJANG JUDUL: Minimum ${minChars} karakter, Maksimum ${maxChars} karakter.\nPLATFORM: ${platform}\nCATEGORIES:\n${categoryList}`;
        
        promptText = `ANALISIS MANDATORI: Perhatikan aset ini. JANGAN menebak. Identifikasi objek, material, dan warna yang eksak. Tulis metadata yang 100% literal dan SEO-optimized sesuai protokol Supreme.`;
        
        if (settings.customTitle || settings.customKeyword) {
            promptText += `\n\nINFO TAMBAHAN DARI USER (Gunakan jika relevan): \nTitle: ${settings.customTitle}\nKeywords: ${settings.customKeyword}`;
        }
        if (settings.negativeMetadata) {
            promptText += `\n\nNEGATIVE CONTEXT (Hindari kata-kata ini): ${settings.negativeMetadata}`;
        }

    } else if (mode === 'idea') {
        temperature = 1.0; 
        outputSchema = {
           type: Type.OBJECT,
           properties: {
              en_title: { type: Type.STRING }, ind_title: { type: Type.STRING },
              en_visual: { type: Type.STRING }, ind_visual: { type: Type.STRING },
              en_keywords: { type: Type.STRING }, ind_keywords: { type: Type.STRING }
           },
           required: ["en_title", "ind_title", "en_visual", "ind_visual", "en_keywords", "ind_keywords"]
        };
        systemInstruction = `${multilingualInstruction}\nTASK: Hasilkan SATU konsep visual unik untuk stock image/video. Gunakan format 'Judul ||| Deskripsi Visual'.`;
        promptText = `Kategori Ide: ${settings.ideaCategory}. ${settings.ideaCustomInput ? `Topik: ${settings.ideaCustomInput}` : ''}`;
    }

    let parsed: any;

    if (provider === 'PUTER') {
        const contentParts: any[] = [];
        let combinedSystemText = `### SYSTEM INSTRUCTION\n${systemInstruction}\n\n`;
        if (outputSchema) {
            combinedSystemText += `### RESPONSE SCHEMA (JSON ONLY)\nReturn ONLY valid JSON following this schema:\n${JSON.stringify(outputSchema, null, 2)}\n\n`;
        }
        contentParts.push({ type: "text", text: combinedSystemText });

        if (mode === 'prompt' || (mode === 'idea' && settings.ideaCategory !== 'file')) {
            contentParts.push({ type: "text", text: promptText });
        } else if (fileItem.type === FileType.Video) {
            const requestedFrames = settings.videoFrameCount || 3;
            const frames = await extractVideoFrames(fileItem.file, requestedFrames);
            for (const f of frames) {
                const blob = base64ToBlob(f, 'image/jpeg');
                const path = `isa_tmp_${uuidv4()}.jpeg`;
                await puter.fs.write(path, blob);
                tempFiles.push(path);
                contentParts.push({ type: "file", puter_path: path });
            }
            contentParts.push({ type: "text", text: promptText });
        } else {
            const mediaPart = (fileItem.type === FileType.Vector && fileItem.file.type === 'image/svg+xml') 
              ? await convertSvgToWhiteBgJpeg(fileItem.file) 
              : await compressImage(fileItem.file);
              
            const blob = base64ToBlob(mediaPart.inlineData.data, mediaPart.inlineData.mimeType);
            const path = `isa_tmp_${uuidv4()}.jpeg`;
            await puter.fs.write(path, blob);
            tempFiles.push(path);
            contentParts.push({ type: "file", puter_path: path });
            contentParts.push({ type: "text", text: promptText });
        }

        const messages = [{ role: "user", content: contentParts }];
        parsed = await callPuterApi(messages, actualApiKey, settings.puterModel || 'gemini-2.5-flash', outputSchema, temperature);

        for (const path of tempFiles) {
            await puter.fs.delete(path).catch(() => {});
        }

    } else if (provider === 'GEMINI' || provider === 'AUTO') {
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

        const ai = new GoogleGenAI({ apiKey: actualApiKey });
        const modelToUse = provider === 'AUTO' ? 'gemini-3-flash-preview' : (settings.geminiModel || 'gemini-2.5-flash');
        const response: any = await ai.models.generateContent({
          model: modelToUse,
          contents: { parts },
          config: { systemInstruction, responseMimeType: "application/json", responseSchema: outputSchema, temperature }
        });
        parsed = JSON.parse(response.text);
    } else {
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

        let baseUrl = provider === 'GROQ' ? 'https://api.groq.com/openai/v1' : provider === 'MISTRAL' ? settings.mistralBaseUrl : settings.customBaseUrl;
        let model = provider === 'GROQ' ? settings.groqModel : provider === 'MISTRAL' ? settings.mistralModel : settings.customModel;
        parsed = await callCompatibleApi(parts, systemInstruction, actualApiKey, baseUrl, model, provider, outputSchema, temperature);
    }

    if (mode === 'idea') {
        return {
            metadata: {
                en: { title: `${parsed.en_title} ||| ${parsed.en_visual}`, keywords: parsed.en_keywords },
                ind: { title: `${parsed.ind_title} ||| ${parsed.ind_visual}`, keywords: parsed.ind_keywords },
                category: "Idea"
            }
        };
    }

    return {
      metadata: { 
        en: { title: parsed.en?.title || "", keywords: parsed.en?.keywords || "" }, 
        ind: { title: parsed.ind?.title || "", keywords: parsed.ind?.keywords || "" }, 
        category: parsed.category || "Objects" 
      }
    };
  } catch (error: any) {
    if (provider === 'PUTER' && tempFiles.length > 0) {
        for (const path of tempFiles) {
            await puter.fs.delete(path).catch(() => {});
        }
    }
    throw error;
  }
};

export const translateMetadataContent = async (content: { title: string; keywords: string }, sourceLanguage: Language, apiKey: string): Promise<{ title: string; keywords: string }> => {
  const actualApiKey = apiKey || process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey: actualApiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate to ${sourceLanguage === 'ENG' ? 'Indonesian' : 'English'}: ${content.title}`,
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING } } } }
  });
  return { title: JSON.parse(response.text).title, keywords: content.keywords };
};

export const translateText = async (text: string, targetLang: string, apiKey: string, settings: AppSettings): Promise<string> => {
    const actualApiKey = apiKey || process.env.API_KEY || '';
    const ai = new GoogleGenAI({ apiKey: actualApiKey });
    const modelToUse = settings.apiProvider === 'AUTO' ? 'gemini-3-flash-preview' : (settings.geminiModel || 'gemini-2.5-flash');
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: `Translate text to ${targetLang}: ${text}`,
      config: { temperature: 0.1 }
    });
    return response.text || text;
};

export const generateChatResponse = async (history: ChatMessage[], newMessage: string, settings: AppSettings, apiKey: string): Promise<string> => {
    const actualApiKey = apiKey || process.env.API_KEY || '';
    if (settings.apiProvider === 'PUTER') {
        const messages = history.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));
        messages.push({ role: 'user', content: newMessage });
        return await callPuterApi(messages, actualApiKey, settings.puterModel || 'gemini-2.5-flash', undefined, 0.7);
    }
    const ai = new GoogleGenAI({ apiKey: actualApiKey });
    const contents = history.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
    const modelToUse = settings.apiProvider === 'AUTO' ? 'gemini-3-flash-preview' : (settings.geminiModel || 'gemini-2.5-flash');
    const response = await ai.models.generateContent({ model: modelToUse, contents, config: { systemInstruction: `IsaProject Chat Assistant.`, temperature: 0.7 } });
    return response.text || "";
};
