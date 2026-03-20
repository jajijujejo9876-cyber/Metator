import { Category, FileMetadata } from './types';

// Kategori Standar (Adobe Stock)
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

// Kategori Shutterstock
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

// === KATEGORI KHUSUS VIDEO SHUTTERSTOCK ===
export const SHUTTERSTOCK_VIDEO_CATEGORIES: Category[] = [
  { id: 'Animals/Wildlife', en: 'Animals/Wildlife', id_lang: 'Hewan/Satwa Liar' },
  { id: 'Arts', en: 'Arts', id_lang: 'Seni' },
  { id: 'Backgrounds/Textures', en: 'Backgrounds/Textures', id_lang: 'Latar Belakang/Tekstur' },
  { id: 'Buildings/Landmarks', en: 'Buildings/Landmarks', id_lang: 'Bangunan/Tengara' },
  { id: 'Business/Finance', en: 'Business/Finance', id_lang: 'Bisnis/Keuangan' },
  { id: 'Education', en: 'Education', id_lang: 'Pendidikan' },
  { id: 'Food and drink', en: 'Food and drink', id_lang: 'Makanan dan Minuman' },
  { id: 'Healthcare/Medical', en: 'Healthcare/Medical', id_lang: 'Kesehatan/Medis' },
  { id: 'Holidays', en: 'Holidays', id_lang: 'Liburan' },
  { id: 'Industrial', en: 'Industrial', id_lang: 'Industri' },
  { id: 'Nature', en: 'Nature', id_lang: 'Alam' },
  { id: 'Objects', en: 'Objects', id_lang: 'Objek' },
  { id: 'People', en: 'People', id_lang: 'Orang' },
  { id: 'Religion', en: 'Religion', id_lang: 'Agama' },
  { id: 'Science', en: 'Science', id_lang: 'Sains' },
  { id: 'Signs/Symbols', en: 'Signs/Symbols', id_lang: 'Tanda/Simbol' },
  { id: 'Sports/Recreation', en: 'Sports/Recreation', id_lang: 'Olahraga/Rekreasi' },
  { id: 'Technology', en: 'Technology', id_lang: 'Teknologi' },
  { id: 'Transportation', en: 'Transportation', id_lang: 'Transportasi' }
];

// LACI KATEGORI DITAMBAHKAN "categoryShutter"
export const INITIAL_METADATA: FileMetadata = {
  en: { title: '', keywords: '' },
  ind: { title: '', keywords: '' },
  category: '',
  categoryShutter: '', // <--- Ini laci barunya
};

// MODEL LISTS (Hanya yang didukung internal Gemini Canvas)
export const GEMINI_MODELS = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Fast & Accurate)' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Deep Reasoning)' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

// TEMPLATE PROMPT (Wajib untuk Halaman Generate Prompt)
export const DEFAULT_PROMPT_TEMPLATE = `
You are an expert stock contributor assistant. Your task is to generate metadata in TWO LANGUAGES (English and Indonesian).

STRICT RULES FOR TITLE/DESCRIPTION:
1. **Format:** [Subject] + [Action/Context] + [Environment/Style].
2. **Buyer Focused:** Describe exactly what is seen. No emotions, no opinions.
3. **Forbidden:** Do NOT use brand names, public figures, or tech specs (4K, HD).

STRICT RULES FOR KEYWORDS:
1. **Hierarchy:** The first 10 keywords MUST be the most relevant.
2. **Content:** Specific visual elements, themes, and style.

IMPORTANT:
- Generate "en" (English) version first.
- Generate "ind" (Indonesian) version which is a professional translation.

JSON OUTPUT FORMAT ONLY:
{
  "en": {
    "title": "String",
    "keywords": "String (comma separated)"
  },
  "ind": {
    "title": "String",
    "keywords": "String (comma separated)"
  },
  "category": "String"
}
`;

// === APP CODE CONTEXT FOR AI ASSISTANT ===
export const APP_CODE_CONTEXT = `
CONTEXT FOR AI ASSISTANT:
You are the assistant for the "IsaProject" application.

HOW THE APP WORKS:
1. **Engine:** Ditenagai oleh Google Gemini Canvas (Akses Internal).
2. **Mode Kerja:** - Idea Mode 1 (AI Concept) & Mode 2 (Local Database).
   - Prompt Engineering (AI Instruction Builder).
   - Metadata Extraction (Visual Analysis for Stocks).
3. **Privacy:** Semua data diproses secara lokal di browser pengguna.
`;
