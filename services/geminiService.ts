import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, FileItem, FileMetadata, FileType, Language, AppMode, QcResult } from "../types";
// IMPORT DAFTAR DREAMSTIME DARI CONSTANTS
import { CATEGORIES, SHUTTERSTOCK_CATEGORIES, SHUTTERSTOCK_VIDEO_CATEGORIES, DREAMSTIME_CATEGORIES } from "../constants";
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

STEP 2: RUMUS PENULISAN JUDUL & DESKRIPSI
- TITLE FORMULA: [Nama Objek Utama] + [Setting/Kondisi Visual Langsung] + [Tujuan/Konteks Komersial].
- DESCRIPTION FORMULA (MANDATORY RULE): DESCRIPTION WAJIB berupa PARAFRASE dari TITLE. Maknanya harus sama persis, TETAPI DILARANG KERAS MENYALIN KATA-KATA TITLE! Anda WAJIB menggunakan sinonim dan mengubah struktur tata bahasanya. Jika Title Anda berbunyi "Pria tersenyum di taman", maka Description BISA berbunyi "Seorang laki-laki menunjukkan ekspresi bahagia saat berada di area terbuka hijau". ZERO COPY-PASTE ALLOWED!
- KATA PERTAMA: Harus berupa nama objek literal (Subjek Utama).
- NO OPINIONS: Dilarang keras kata-kata seperti "beautiful, stunning, amazing, best quality".
- DESKRIPSI TEKNIS: Fokus pada material, pencahayaan, dan tekstur.

STEP 3: LOGIKA KATA KUNCI (SEO HIERARCHY)
- TOTAL: Tepat [KW_COUNT] kata kunci.
- TOP 20 SEO: 20 kata kunci pertama WAJIB merupakan kata kunci pokok yang paling relevan, akurat sesuai visual, dan memiliki pencarian/nilai komersial tertinggi.
- WAJIB 1 KATA: Setiap kata kunci HANYA BOLEH 1 KATA. Dilarang keras menggunakan frasa (2 kata atau lebih).
- UNIQUE / ANTI-REDUNDANT: DILARANG mengulang kata yang sama. Setiap kata harus 100% unik.
- ZERO HALLUCINATION: Jangan tulis objek yang tidak ada di dalam aset.

STEP 4: BLACKLIST (STRICT PROHIBITION)
- DILARANG menulis spesifikasi teknis (4K, HD, 8K, Resolution).
- DILARANG menulis jenis file (Vector, AI, Photo, Footage, EPS).
- DILARANG menulis nama brand, logo, atau tokoh publik.
- DILARANG menggunakan template umum.

STEP 5: ASSIGN TRIPLE CATEGORY (MANDATORY)
Anda WAJIB memberikan TIGA jenis kategori untuk 3 platform yang berbeda secara bersamaan:
1. 'categoryAdobe': Pilih TEPAT 1 Kategori yang paling akurat dari DAFTAR ADOBE.
2. 'categoryShutter': Pilih TEPAT 2 Kategori (ID TEKS) yang paling akurat dari DAFTAR SHUTTERSTOCK. Pisahkan dengan koma (contoh: "Abstract, Nature").
3. 'categoryDream': Pilih TEPAT 3 Kategori (ANGKA ID) yang paling akurat dari DAFTAR DREAMSTIME. Pisahkan dengan koma (contoh: "112, 145, 105"). DILARANG KOSONG!
`;

export const generateMetadataForFile = async (
  fileItem: FileItem,
  settings: AppSettings,
  providedApiKey: string, 
  mode: AppMode = 'metadata'
): Promise<{ metadata: FileMetadata; thumbnail?: string; generatedImageUrl?: string; qcResult?: QcResult; }> => {
  const isCanvasMode = settings.apiProvider === 'GEMINI CANVAS';
  const actualApiKey = isCanvasMode 
      ? (process.env.API_KEY || process.env.GEMINI_API_KEY || 'internal_canvas_key') 
      : providedApiKey;

  if (!isCanvasMode && !actualApiKey) {
      throw new Error(`API Key kosong. Masukkan API Key di pengaturan untuk mode ${settings.apiProvider}.`);
  }

  let targetModel = settings.geminiModel || 'gemini-2.5-flash';
  if (isCanvasMode && targetModel === 'auto') {
      targetModel = 'gemini-2.5-flash'; 
  }
  
  try {
    let systemInstruction = "";
    let promptText = "";
    let temperature = 0.1;
    let outputSchema: any;

    if (mode === 'metadata') {
        const listAdobe = CATEGORIES.map(c => `"${c.id}" = ${c.en}`).join('\n');
        const listShutter = (fileItem.type === FileType.Video ? SHUTTERSTOCK_VIDEO_CATEGORIES : SHUTTERSTOCK_CATEGORIES).map(c => `"${c.id}" = ${c.en}`).join('\n');
        // TAMBAHKAN DAFTAR DREAMSTIME
        const listDream = DREAMSTIME_CATEGORIES.map(c => `"${c.id}" = ${c.en}`).join('\n');
        
        const minChars = settings.titleMin || 50;
        const maxChars = settings.titleMax || 150;
        const kwTotal = settings.slideKeyword || 40;
        
        const isGroq = settings.apiProvider === 'GROQ API';
        const kwTargetAI = isGroq ? kwTotal + 15 : kwTotal; // Minta lebih untuk Groq

        systemInstruction = `LANGUAGE: Hasilkan field 'en' dalam Bahasa Inggris dan field 'ind' dalam Bahasa Indonesia yang merupakan terjemahan profesionalnya.\n\n${SUPREME_METADATA_PROTOCOL}`
            .replace('[KW_COUNT]', kwTargetAI.toString());

        // MASUKKAN 3 DAFTAR KE OTAK AI
        systemInstruction += `\n\nDAFTAR ADOBE:\n${listAdobe}\n\nDAFTAR SHUTTERSTOCK:\n${listShutter}\n\nDAFTAR DREAMSTIME:\n${listDream}`;
        
        promptText = `ANALISIS MANDATORI: Perhatikan aset ini. JANGAN menebak. Identifikasi objek, material, dan warna yang eksak. Tulis metadata yang 100% literal dan SEO-optimized sesuai protokol Supreme.\n\n!!! CRITICAL INSTRUCTIONS (MUST OBEY) !!!\n`;

        if (isGroq) {
            // PROMPT GROQ
            promptText += `- TITLE LENGTH: WAJIB detail agar panjang kalimat antara ${minChars} hingga ${maxChars} karakter.\n`;
            promptText += `- DESCRIPTION RULE: Field Description WAJIB diisi. Isinya WAJIB merupakan parafrase (sinonim) dari kalimat Title. Panjang kalimatnya juga WAJIB sama dengan Title, yaitu antara ${minChars} hingga ${maxChars} karakter. HARAM MENYALIN TEKS TITLE SECARA IDENTIK!\n`;
            promptText += `- KEYWORD COUNT: Kami butuh stok kata! WAJIB hasilkan minimal ${kwTargetAI} kata kunci tunggal (dipisah koma).\n`;
        } else {
            // PROMPT GEMINI
            promptText += `- TITLE LENGTH: WAJIB antara ${minChars} sampai ${maxChars} karakter.\n`;
            promptText += `- DESCRIPTION RULE: Field Description WAJIB diisi. Isinya WAJIB merupakan parafrase (sinonim) dari kalimat Title. Panjang kalimatnya juga WAJIB sama dengan Title, yaitu antara ${minChars} sampai ${maxChars} karakter. HARAM MENYALIN TEKS TITLE SECARA IDENTIK!\n`;
            promptText += `- KEYWORD COUNT: WAJIB menghasilkan tepat ${kwTotal} kata kunci tunggal (dipisah koma). Dilarang kurang, dilarang lebih!\n`;
        }

        promptText += `- KEYWORD FORMAT: WAJIB 1 KATA TUNGGAL PER KEYWORD. Dilarang keras menggunakan spasi di dalam keyword!\n`;

        if (settings.customTitle || settings.customKeyword) {
            promptText += `\nINFO TAMBAHAN DARI USER (Gunakan jika relevan): \nTitle/Description Base: ${settings.customTitle}\nKeywords: ${settings.customKeyword}`;
        }
        if (settings.negativeMetadata) {
            promptText += `\nNEGATIVE CONTEXT (Hindari kata-kata ini): ${settings.negativeMetadata}`;
        }

        // UPDATE SCHEMA AGAR AI MENGHASILKAN categoryDream
        outputSchema = {
          type: Type.OBJECT,
          properties: {
            en: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, keywords: { type: Type.STRING } }, required: ["title", "description", "keywords"] },
            ind: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, keywords: { type: Type.STRING } }, required: ["title", "description", "keywords"] },
            categoryAdobe: { type: Type.STRING }, 
            categoryShutter: { type: Type.STRING },
            categoryDream: { type: Type.STRING } // <--- LACI BARU MINTA KE AI
          },
          required: ["en", "ind", "categoryAdobe", "categoryShutter", "categoryDream"]
        };

    } else if (mode === 'idea') {
        temperature = 0.9;
        outputSchema = {
           type: Type.OBJECT,
           properties: {
              en_idea: { type: Type.STRING }, 
              ind_idea: { type: Type.STRING }
           },
           required: ["en_idea", "ind_idea"]
        };

        const kategoriDipilih = settings.ideaCategory;
        const instruksiPengguna = settings.ideaCustomInstruction;

        systemInstruction = `Bertindak sebagai Senior Microstock Analyst. Berikan 1 ide konsep visual bernilai komersial tinggi.
        TEMA/KATEGORI: ${kategoriDipilih}
        ATURAN MUTLAK:
        1. Output HANYA berupa kalimat ide yang sangat singkat (1 baris, maksimal 5-10 kata).
        2. JANGAN sertakan judul, deskripsi panjang, atau keyword.
        3. Hasilkan dalam field JSON 'en_idea' dan 'ind_idea'.`;

        promptText = `INSTRUKSI TAMBAHAN DARI PENGGUNA: \n"${instruksiPengguna ? instruksiPengguna : "Buat konsep serealistis mungkin."}"`;
    
    } else if (mode === 'prompt') {
        temperature = 0.8;
        outputSchema = {
           type: Type.OBJECT,
           properties: {
              en_prompt: { type: Type.STRING }, 
              ind_prompt: { type: Type.STRING }
           },
           required: ["en_prompt", "ind_prompt"]
        };

        const instruksiTambahan = settings.promptDescription ? `\nInstruksi Tambahan dari User: ${settings.promptDescription}` : "";
        
        if (settings.promptPlatform === 'text') {
            systemInstruction = `Bertindak sebagai AI Prompt Engineer profesional. Tugas Anda adalah mengembangkan ide pendek menjadi sebuah prompt gambar/video yang sangat detail, spesifik, dan memukau untuk AI Image Generator (seperti Midjourney atau Stable Diffusion).
            
            ATURAN:
            1. Buat prompt deskriptif yang mencakup subjek utama, pencahayaan, suasana (mood), sudut pandang kamera, dan gaya visual.
            2. Jangan menambahkan penjelasan apapun di luar prompt.
            3. Hasilkan dalam bahasa Inggris ('en_prompt') dan terjemahan akuratnya dalam bahasa Indonesia ('ind_prompt').`;
            
            promptText = `Kembangkan ide berikut menjadi sebuah prompt gambar yang sangat detail: "${settings.promptIdea}" ${instruksiTambahan}`;
        } else {
            systemInstruction = `Bertindak sebagai AI Vision Expert. Tugas Anda adalah menganalisa gambar/video ini dan mengubahnya menjadi sebuah prompt teks (reverse-prompting) yang sangat detail, agar AI Image Generator lain bisa membuat ulang gambar yang mirip.
            
            ATURAN:
            1. Deskripsikan secara detail: Subjek utama, lingkungan/latar belakang, pencahayaan, warna dominan, dan gaya estetik (apakah foto realistis, vektor, ilustrasi, dll).
            2. Jika ada instruksi tambahan dari user, gabungkan instruksi tersebut ke dalam prompt akhir.
            3. Hasilkan dalam bahasa Inggris ('en_prompt') dan terjemahan akuratnya dalam bahasa Indonesia ('ind_prompt').`;

            promptText = `Buatlah prompt detail berdasarkan gambar/video ini. ${instruksiTambahan}`;
        }
    
    } else if (mode === 'qc') {
        temperature = 0.2; 
        
        systemInstruction = `Anda adalah Kurator dan Reviewer Agensi Microstock Galak (seperti Adobe Stock atau Shutterstock). Tugas Anda adalah mengkurasi kelayakan komersial, teknis, dan legal dari aset visual yang dikirim.
        
        ATURAN PENILAIAN STRICT:
        1. score: Nilai 1-100 (Seberapa laku dan layak aset ini dijual).
        2. status: Harus salah satu dari "Pass" (Lolos tanpa masalah), "Warning" (Ada catatan kecil), atau "Fail" (Ditolak mutlak karena cacat/melanggar).
        3. technicalIssues: Array string. Sebutkan jika ada blur, noise parah, overexposed, pencahayaan buruk, atau cacat anatomi AI (jari aneh, dll). KOSONGKAN array jika kualitas teknis sempurna.
        4. ipIssues: Array string. Sebutkan JIKA ADA PELANGGARAN HAK CIPTA/TRADEMARK (logo Nike, desain Apple, botol Coca-Cola, plat nomor mobil, atau wajah orang yang butuh rilis model). KOSONGKAN array jika murni aman.
        5. commercialAdvice: 1-2 kalimat saran komersial dalam Bahasa Indonesia. Apa nilai jual gambar ini atau peringatan mengapa gambar ini akan ditolak kurator.`;

        promptText = `Analisis gambar/video ini secara mendalam seperti seorang kurator galak. Periksa cacat teknis, cacat AI, potensi pelanggaran hak cipta, dan nilai komersialnya.`;

        outputSchema = {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            technicalIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            ipIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            commercialAdvice: { type: Type.STRING }
          },
          required: ["score", "status", "technicalIssues", "ipIssues", "commercialAdvice"]
        };
    }

    let parts: any[] = [];
    
    if ((mode === 'prompt' && settings.promptPlatform === 'text') || (mode === 'idea' && settings.ideaCategory !== 'file')) {
      parts = [{ text: promptText }];
    } else {
      if (fileItem.type === FileType.Video) {
        const frames = await extractVideoFrames(fileItem.file, settings.videoFrameCount || 3);
        parts = frames.map(f => ({ inlineData: { mimeType: 'image/jpeg', data: f } }));
        parts.push({ text: promptText });
      } else {
        const mediaPart = (fileItem.type === FileType.Vector && fileItem.file.type === 'image/svg+xml') 
          ? await convertSvgToWhiteBgJpeg(fileItem.file) 
          : await compressImage(fileItem.file);
        parts = [mediaPart, { text: promptText }];
      }
    }

    let parsed: any;

    if (settings.apiProvider === 'GROQ API') {
        const messages = [];
        
        let expectedJsonSchema = "";
        if (mode === 'metadata') {
            // UPDATE JSON EXPECTATION GROQ 
            expectedJsonSchema = `\n\nEXPECTED JSON FORMAT:\n{\n  "en": { "title": "string", "description": "string", "keywords": "string" },\n  "ind": { "title": "string", "description": "string", "keywords": "string" },\n  "categoryAdobe": "string",\n  "categoryShutter": "string",\n  "categoryDream": "string"\n}`;
        } else if (mode === 'idea') {
            expectedJsonSchema = `\n\nEXPECTED JSON FORMAT:\n{\n  "en_idea": "string",\n  "ind_idea": "string"\n}`;
        } else if (mode === 'prompt') {
            expectedJsonSchema = `\n\nEXPECTED JSON FORMAT:\n{\n  "en_prompt": "string",\n  "ind_prompt": "string"\n}`;
        } else if (mode === 'qc') {
            expectedJsonSchema = `\n\nEXPECTED JSON FORMAT:\n{\n  "score": number,\n  "status": "string",\n  "technicalIssues": ["string"],\n  "ipIssues": ["string"],\n  "commercialAdvice": "string"\n}`;
        }
        
        const groqSystemInstruction = systemInstruction + expectedJsonSchema + `\n\nIMPORTANT: You MUST return ONLY a valid JSON object matching the exact keys and structure above. Do NOT wrap it in markdown code blocks.`;
        
        if (systemInstruction) {
            messages.push({ role: "system", content: groqSystemInstruction });
        }
        
        let hasImage = false;
        const userContent: any[] = [];
        
        for (const part of parts) {
            if (part.text) {
                userContent.push({ type: "text", text: part.text });
            } else if (part.inlineData) {
                hasImage = true;
                userContent.push({
                    type: "image_url",
                    image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` }
                });
            }
        }
        
        messages.push({ role: "user", content: hasImage ? userContent : promptText });

        const payload = {
            model: targetModel,
            messages: messages,
            temperature: temperature,
            response_format: { type: "json_object" }
        };

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${actualApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Groq Error: ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const textResponse = data.choices[0].message.content;
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);

    } else {
        const ai = new GoogleGenAI({ apiKey: actualApiKey });
        const response: any = await ai.models.generateContent({
          model: targetModel,
          contents: { parts },
          config: { systemInstruction, responseMimeType: "application/json", responseSchema: outputSchema, temperature }
        });
        
        parsed = JSON.parse(response.text);
    }

    // === PISAU CUKUR KEYWORD (SILENT SLICER) ===
    if (mode === 'metadata' && parsed) {
        const targetK = settings.slideKeyword || 40;
        
        const cleanAndSliceKeywords = (rawKws: string) => {
            if (!rawKws) return "";
            let arr = rawKws.replace(/,/g, ' ').split(/\s+/).map(k => k.trim().toLowerCase()).filter(k => k.length > 2);
            
            if (settings.negativeMetadata) {
                const negWords = settings.negativeMetadata.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
                arr = arr.filter(k => !negWords.some(nw => k.includes(nw)));
            }
            
            arr = [...new Set(arr)]; 
            if (arr.length > targetK) arr = arr.slice(0, targetK); 
            return arr.join(', ');
        };

        if (parsed.en && parsed.en.keywords) {
            parsed.en.keywords = cleanAndSliceKeywords(parsed.en.keywords);
        }
        if (parsed.ind && parsed.ind.keywords) {
            parsed.ind.keywords = cleanAndSliceKeywords(parsed.ind.keywords);
        }
    }

    if (mode === 'idea') {
        return {
            metadata: {
                en: { title: parsed.en_idea, keywords: "" },
                ind: { title: parsed.ind_idea, keywords: "" },
                category: settings.ideaCategory === 'auto' ? 'Idea' : settings.ideaCategory
            }
        };
    } else if (mode === 'prompt') {
        return {
            metadata: {
                en: { title: parsed.en_prompt, keywords: "" },
                ind: { title: parsed.ind_prompt, keywords: "" },
                category: 'Prompt'
            }
        };
    } else if (mode === 'qc') {
        return {
            metadata: { en: { title: "", keywords: "" }, ind: { title: "", keywords: "" }, category: "" }, 
            qcResult: {
                score: parsed.score,
                status: parsed.status,
                technicalIssues: parsed.technicalIssues || [],
                ipIssues: parsed.ipIssues || [],
                commercialAdvice: parsed.commercialAdvice
            }
        };
    }

    return {
      metadata: { 
        en: { 
            title: parsed.en?.title || "", 
            description: parsed.en?.description || "", 
            keywords: parsed.en?.keywords || "" 
        }, 
        ind: { 
            title: parsed.ind?.title || "", 
            description: parsed.ind?.description || "", 
            keywords: parsed.ind?.keywords || "" 
        }, 
        category: parsed.categoryAdobe || "2", 
        categoryShutter: parsed.categoryShutter || "",
        // SIMPAN JAWABAN 3 KATEGORI DREAMSTIME DARI AI
        categoryDream: parsed.categoryDream || "112, 145, 105" // Fallback aman
      }
    };
  } catch (error: any) {
    throw error;
  }
};

export const translateMetadataContent = async (content: { title: string; keywords: string }, sourceLanguage: Language, providedApiKey: string = "", apiProvider: string = 'GEMINI CANVAS', groqModel: string = 'qwen/qwen3-32b'): Promise<{ title: string; keywords: string }> => {
  const actualApiKey = providedApiKey || process.env.API_KEY || process.env.GEMINI_API_KEY || 'internal_canvas_key';
  
  if (!actualApiKey) {
      console.warn("Translation skipped: No API Key available");
      return content; 
  }

  const instruction = `Translate the following text to ${sourceLanguage === 'ENG' ? 'Indonesian' : 'English'}. Return ONLY valid JSON: {"title": "translated string"}. Text: "${content.title}"`;

  if (apiProvider === 'GROQ API') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${actualApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
              model: groqModel,
              messages: [{ role: "user", content: instruction }],
              temperature: 0.1,
              response_format: { type: "json_object" }
          })
      });
      if (response.ok) {
          const data = await response.json();
          const cleanJson = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
          return { title: JSON.parse(cleanJson).title, keywords: content.keywords };
      }
      return content;
  } else {
      const ai = new GoogleGenAI({ apiKey: actualApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: instruction,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING } } } }
      });
      return { title: JSON.parse(response.text).title, keywords: content.keywords };
  }
};

export const translateText = async (text: string, targetLang: string, settings: AppSettings, providedApiKey: string = ""): Promise<string> => {
    const isCanvasMode = settings.apiProvider === 'GEMINI CANVAS';
    const actualApiKey = isCanvasMode 
        ? (process.env.API_KEY || process.env.GEMINI_API_KEY || 'internal_canvas_key') 
        : providedApiKey;
        
    if (!actualApiKey) return text;

    if (settings.apiProvider === 'GROQ API') {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${actualApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: settings.geminiModel || 'qwen/qwen3-32b',
                messages: [{ role: "user", content: `Translate text to ${targetLang}: ${text}` }],
                temperature: 0.1
            })
        });
        if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content || text;
        }
        return text;
    } else {
        const ai = new GoogleGenAI({ apiKey: actualApiKey });
        const response = await ai.models.generateContent({
          model: settings.geminiModel || 'gemini-2.5-flash',
          contents: `Translate text to ${targetLang}: ${text}`,
          config: { temperature: 0.1 }
        });
        return response.text || text;
    }
};
