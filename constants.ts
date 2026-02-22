
import { Category, FileMetadata, BlendCategory } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', en: 'Animals', id_lang: 'Hewan' },
  { id: '2', en: 'Buildings and Architecture', id_lang: 'Bangunan & Arsitektur' },
  { id: '3', en: 'Business', id_lang: 'Bisnis' },
  { id: '4', en: 'Drinks', id_lang: 'Minuman' },
  { id: '5', en: 'The Environment', id_lang: 'Lingkungan' },
  { id: '6', en: 'States of Mind', id_lang: 'Perasaan & Emosi' },
  { id: '7', en: 'Food', id_lang: 'Makanan' },
  { id: '8', en: 'Graphic Resources', id_lang: 'Sumber Grafis' },
  { id: '9', en: 'Hobbies and Leisure', id_lang: 'Hobi & Liburan' },
  { id: '10', en: 'Industry', id_lang: 'Industri' },
  { id: '11', en: 'Landscapes', id_lang: 'Pemandangan' },
  { id: '12', en: 'Lifestyle', id_lang: 'Gaya Hidup' },
  { id: '13', en: 'People', id_lang: 'Orang' },
  { id: '14', en: 'Plants and Flowers', id_lang: 'Tanaman & Bunga' },
  { id: '15', en: 'Culture and Religion', id_lang: 'Budaya & Agama' },
  { id: '16', en: 'Science', id_lang: 'Sains' },
  { id: '17', en: 'Social Issues', id_lang: 'Isu Sosial' },
  { id: '18', en: 'Sports', id_lang: 'Olahraga' },
  { id: '19', en: 'Technology', id_lang: 'Teknologi' },
  { id: '20', en: 'Transport', id_lang: 'Transportasi' },
  { id: '21', en: 'Travel', id_lang: 'Wisata' },
];

export const SHUTTERSTOCK_CATEGORIES: Category[] = [
  { id: 'Abstract', en: 'Abstract', id_lang: 'Abstrak' },
  { id: 'Animals/Wildlife', en: 'Animals/Wildlife', id_lang: 'Hewan/Margasatwa' },
  { id: 'Arts', en: 'Arts', id_lang: 'Seni' },
  { id: 'Backgrounds/Textures', en: 'Backgrounds/Textures', id_lang: 'Latar Belakang/Tekstur' },
  { id: 'Beauty/Fashion', en: 'Beauty/Fashion', id_lang: 'Kecantikan/Fashion' },
  { id: 'Buildings/Landmarks', en: 'Buildings/Landmarks', id_lang: 'Bangunan/Landmark' },
  { id: 'Business/Finance', en: 'Business/Finance', id_lang: 'Bisnis/Keuangan' },
  { id: 'Celebrities', en: 'Celebrities', id_lang: 'Selebriti' },
  { id: 'Education', en: 'Education', id_lang: 'Pendidikan' },
  { id: 'Food and drink', en: 'Food and drink', id_lang: 'Makanan dan Minuman' },
  { id: 'Healthcare/Medical', en: 'Healthcare/Medical', id_lang: 'Kesehatan/Medis' },
  { id: 'Holidays', en: 'Holidays', id_lang: 'Hari Libur' },
  { id: 'Industrial', en: 'Industrial', id_lang: 'Industri' },
  { id: 'Interiors', en: 'Interiors', id_lang: 'Interior' },
  { id: 'Miscellaneous', en: 'Miscellaneous', id_lang: 'Lain-lain' },
  { id: 'Nature', en: 'Nature', id_lang: 'Alam' },
  { id: 'Parks/Outdoor', en: 'Parks/Outdoor', id_lang: 'Taman/Luar Ruangan' },
  { id: 'People', en: 'People', id_lang: 'Orang' },
  { id: 'Religion', en: 'Religion', id_lang: 'Agama' },
  { id: 'Science', en: 'Science', id_lang: 'Sains' },
  { id: 'Signs/Symbols', en: 'Signs/Symbols', id_lang: 'Tanda/Simbol' },
  { id: 'Sports/Recreation', en: 'Sports/Recreation', id_lang: 'Olahraga/Rekreasi' },
  { id: 'Technology', en: 'Technology', id_lang: 'Teknologi' },
  { id: 'Transportation', en: 'Transportation', id_lang: 'Transportasi' },
  { id: 'Vintage', en: 'Vintage', id_lang: 'Vintage' },
];

export const BLEND_CATEGORIES = [
  { value: 'aesthetic_fusion', label: 'Aesthetic/Style Fusion (Transfer Gaya)' },
  { value: 'material_mapping', label: 'Material/Texture Mapping (Pemetaan Tekstur)' },
  { value: 'atmospheric', label: 'Atmospheric Harmonization (Mood & Lighting)' },
  { value: 'character_consistency', label: 'Character Consistency / Face Swap (khusus untuk Stok Model)' },
  { value: 'hybrid_concept', label: 'Hybrid Concept (Evolusi Ide)' },
];

export const BLEND_CRITERIA: Record<BlendCategory, string> = {
  aesthetic_fusion: "INSTRUCTION: Take the structural content from the first image and apply the artistic style, color palette, and brushwork/texture from the other reference images. Create a seamless artistic fusion where the subject of Image 1 is re-imagined through the lens of the style provided in the others.",
  product_placement: "INSTRUCTION: Treat the first image as the primary product/subject. Intelligently place it into the environmental context of the second image. Ensure that the lighting, shadows, and perspective of the product are perfectly synchronized with the target background image to create a realistic commercial placement.",
  material_mapping: "INSTRUCTION: Analyze the geometry and shape of the object in the first image. Wrap or 'map' the texture, material, and surface qualities of the second image onto that shape. For example, turn a chair from image 1 into the liquid gold material seen in image 2 while keeping the chair's exact form.",
  atmospheric: "INSTRUCTION: Preserve the objects and composition of the first image exactly. Harvest the lighting, weather, time of day (mood), and overall atmospheric conditions from the second image and apply it to the first. Harmonize the colors to match the reference's atmospheric tone.",
  character_consistency: "INSTRUCTION: Maintain the pose, background, and clothing from the first image. Replace the face or specific character identity with the reference provided in the second image. The goal is 100% consistency of the setting while changing only the subject's identity/face based on the reference.",
  hybrid_concept: "INSTRUCTION: This is a creative evolution. Merges the core concepts of all provided images into a single new entity. Combine biological features with mechanical ones or fuse two disparate objects into a cohesive, balanced, and unique hybrid design."
};

export const ADS_OPTIONS = {
  media: ["Oil Painting", "Watercolor", "Pencil Sketch", "Acrylic", "Gouache", "Ukiyo-e", "Ink Wash", "Pastel Art", "Charcoal Drawing"],
  history: ["Renaissance", "Surrealism", "Art Deco", "Pop Art", "Baroque", "Impressionism", "Futurism", "Cubism", "Bauhaus", "Cyberpunk", "SteamPunk"],
  photo: ["Bokeh", "Macro", "Long Exposure", "Fisheye", "Street Photography", "Analog Film", "Golden Hour", "Studio Lighting", "Motion Blur"],
  digital: ["3D Render", "Octane Render", "Pixel Art", "Voxel Art", "Holographic", "CGI", "Unreal Engine 5", "Ray Traced", "Low Poly"],
  pop: ["Anime Style", "Manga", "Comic Book", "Disney Style", "Studio Ghibli", "Vintage Cartoon", "Graffiti Art", "Doodle Art"],
  material: ["Metallic", "Iridescent Glass", "Raw Wood", "Liquid Gold", "Marble", "Velvet", "Concrete", "Neon Tubes", "Fabric Texture"],
  core: ["Dreamcore", "Weirdcore", "Cottagecore", "Glitchcore", "Vaporwave", "Liminal Space", "Cybercore", "Etheralcore"],
  print: ["Screen Printing", "Woodcut", "Risograph", "Lithography", "Etching", "Linocut", "Cyanotype", "Offset Press"]
};

// MODEL LISTS FOR DROPDOWNS
export const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-3.0-flash', label: 'Gemini 3.0 Flash' },
];

export interface PuterModel {
  value: string;
  label: string;
  group: string;
  isHeader?: boolean;
}

export const PUTER_MODELS: PuterModel[] = [
  // --- MULTI (GEMINI SERIES) ---
  { value: 'gemini-3-flash-preview', label: 'gemini-3-flash-preview', group: 'MULTI' },
  { value: 'gemini-3-pro-preview', label: 'gemini-3-pro-preview', group: 'MULTI' },
  { value: 'gemini-2.5-pro', label: 'gemini-2.5-pro', group: 'MULTI' },
  { value: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite', group: 'MULTI' },
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash', group: 'MULTI' },

  // --- IDEA ---
  { value: 'idea-engine-v1', label: 'Idea Engine V1', group: 'IDEA' },
  
  // --- PROMPT ---
  { value: 'prompt-master-v2', label: 'Prompt Master V2', group: 'PROMPT' },

  // --- METADATA ---
  { value: 'metadata-analyzer', label: 'Metadata Analyzer', group: 'METADATA' },

  // --- IMAGE GEN ---
  { value: 'image-generator-pro', label: 'Image Generator Pro', group: 'IMAGE GEN' },

  // --- EDU EXTRACT ---
  { value: 'edu-processor-v1', label: 'Edu Processor V1', group: 'EDU EXTRACT' },

  // --- AI CHAT ---
  { value: 'chat-assistant-pro', label: 'Chat Assistant Pro', group: 'AI CHAT' },
];

export const MISTRAL_MODELS = [
  { value: 'mistral-large-latest', label: 'Mistral Large' },
  { value: 'mistral-small-latest', label: 'Mistral Small' },
  { value: 'pixtral-12b-2409', label: 'Pixtral 12B' },
];

// STRICT GROQ MODELS (CORRECTED IDs & EMOJI PREFIX)
export const GROQ_MODELS = [
  { value: 'openai/gpt-oss-120b', label: '✨ GPT OSS 120B (Idea/Prompt)' },
  { value: 'qwen/qwen3-32b', label: 'Qwen3-32B (Idea/Prompt)' },
  { value: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: '✨ Llama 4 Maverick (Metadata)' },
  { value: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout (Metadata)' },
];

export const INITIAL_METADATA: FileMetadata = {
  en: { title: '', keywords: '' },
  ind: { title: '', keywords: '' },
  category: '',
};

export const DEFAULT_PROMPT_TEMPLATE = `
You are an expert stock contributor assistant. Your task is to generate metadata in TWO LANGUAGES (English and Indonesian).

STRICT RULES FOR TITLE/DESCRIPTION:
1.  **Format:** [Subject] + [Action/Context] + [Environment/Style].
2.  **Buyer Focused:** Describe exactly what is seen. No emotions, no opinions.
3.  **Forbidden:** Do NOT use brand names, public figures, or tech specs (4K, HD).
4.  **Style:** Concise, professional.

STRICT RULES FOR KEYWORDS:
1.  **Hierarchy:** The first 10 keywords MUST be the most relevant.
2.  **Content:** Specific visual elements, themes, and style.

IMPORTANT:
- Generate "en" (English) version first.
- Generate "ind" (Indonesian) version which is a professional translation of the English version.

JSON OUTPUT FORMAT ONLY:
{
  "en": {
    "title": "String (English)",
    "keywords": "String (English, comma separated)"
  },
  "ind": {
    "title": "String (Bahasa Indonesia)",
    "keywords": "String (Bahasa Indonesia, comma separated)"
  },
  "category": "String (ID only)"
}
`;

// === APP CODE CONTEXT FOR AI (USER FRIENDLY VERSION) ===
export const APP_CODE_CONTEXT = `
CONTEXT FOR AI ASSISTANT:
You are the assistant for the "IsaProject_Free" application.
Answer questions politely, professionally, and clearly.

HOW THE APP WORKS (EXPLAIN THIS TO USER):
1. **API Keys & Compatibility Mode:**
   - IsaProject_Free memanfaatkan sistem "Compatibility Mode" yang berjalan secara real-time di latar belakang untuk menangani rotasi kunci otomatis.
   - Dengan memasukkan banyak API Key, sistem akan berganti kunci secara instan jika terjadi rate limit (429), memastikan proses tetap "ngebut".
   - Fitur "Compatibility" ini menjaga alur kerja tetap stabil tanpa intervensi manual.

2. **Idea Generator:**
   - **Mode 1 (Free):** Menghasilkan konsep kreatif foto/video stok berdasarkan kategori atau tema kustom.
   - **Mode 2 (Database):** Membaca dari file yang diunggah (Excel/CSV) untuk memproses daftar ide secara spesifik.

3. **Prompt Engineering:**
   - Membuat instruksi (prompt) berkualitas tinggi untuk AI Image Generator (seperti Midjourney/Flux) berdasarkan ide sederhana.

4. **Metadata Extraction:**
   - Unggah gambar atau video, dan sistem akan menganalisisnya untuk membuat Judul, Kata Kunci, dan Kategori standar Adobe Stock atau Shutterstock.

5. **Privacy & Storage:**
   - **Penting:** Semua data (API Keys, Riwayat Chat, Pengaturan) disimpan secara **lokal di memori aman browser Anda**.
   - Tidak ada data yang dikirim ke server eksternal mana pun (kecuali ke penyedia AI yang Anda pilih).

6. **Troubleshooting:**
   - Jika layar memutih, coba segarkan (refresh). Sistem memiliki perlindungan internal.
   - Jika pembuatan gagal, periksa API Key atau koneksi internet Anda.
`;
