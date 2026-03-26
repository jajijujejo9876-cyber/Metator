export enum FileType {
  Image = 'Image',
  Video = 'Video',
  Vector = 'Vector',
}

export enum ProcessingStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

export type ApiProvider = 'GEMINI CANVAS' | 'GEMINI API' | 'GROQ API';

// === LACI MEMORI BARU (DITAMBAH DESCRIPTION) ===
export interface LocalizedContent {
  title: string;
  description?: string; // <--- INI LACI BARUNYA LEK!
  keywords: string;
}
// ===============================================

export interface FileMetadata {
  en: LocalizedContent;
  ind: LocalizedContent;
  category: string; 
  categoryShutter?: string;
  // LACI MEMORI BARU KHUSUS DREAMSTIME (Format isi: "112,145,105")
  categoryDream?: string; 
}

// === STRUKTUR RAPOR QC ===
export interface QcResult {
  score: number;             // Skor Kelayakan (1-100)
  status: 'Pass' | 'Fail' | 'Warning'; 
  technicalIssues: string[]; // Masalah teknis (Blur, Noise, Pencahayaan)
  ipIssues: string[];        // Pelanggaran Hak Cipta (Logo, Brand, Muka Orang)
  commercialAdvice: string;  // Nilai jual komersial (Saran dari AI)
  resolutionInfo?: string;   // Pengecekan lokal (Misal: "Lolos (>4MP)" atau "Gagal (<4MP)")
}
// =========================

export interface FileItem {
  id: string;
  file: File;
  previewUrl: string; 
  thumbnail?: string; 
  extractedFrames?: string[]; 
  type: FileType;
  status: ProcessingStatus;
  metadata: FileMetadata;
  error?: string;
  sourceData?: ScrapedDataRow; 
  generatedImageUrl?: string; 
  qcResult?: QcResult; 
}

export interface Category {
  id: string;
  en: string;
  id_lang: string; 
}

export type AppMode = 'idea' | 'idea_free' | 'idea_paid' | 'prompt' | 'metadata' | 'quran' | 'qc';

export interface ScrapedDataRow {
  id: number;
  originalTitle: string; 
  originalKeywords: string;
}

export type IdeaCategory = 
  | 'auto' 
  | 'lifestyle' 
  | 'business' 
  | 'nature' 
  | 'food' 
  | 'science' 
  | 'travel' 
  | 'architecture' 
  | 'social' 
  | 'sports' 
  | 'abstract' 
  | 'custom'
  | 'file';

// === TAMBAHAN 7 PLATFORM BARU ===
export type MetadataPlatform = 'Adobe Stock' | 'Shutterstock' | 'Dreamstime' | 'Freepik' | 'MiriCanvas' | 'Vecteezy' | 'Arabstock';

export interface AppSettings {
  apiProvider: ApiProvider;
  geminiModel: string;   
  customTitle: string;
  customKeyword: string;
  negativeMetadata: string; 
  ideaNegativeContext: string; 
  metadataPlatform: MetadataPlatform; // <--- DIUBAH JADI PANGGILAN 7 PLATFORM
  titleMin: number;
  titleMax: number;
  slideKeyword: number; 
  videoFrameCount: number;
  workerCount: number; 
  apiDelay: number;
  ideaMode: 'free' | 'paid';
  ideaQuantity: number;        
  ideaCategory: IdeaCategory;
  ideaCustomInput: string;   
  ideaCustomInstruction: string; 
  ideaSourceFiles?: File[];  
  ideaFromRow: number;        
  ideaBatchSize: number;     
  ideaSourceLines: string[]; 
  ideaWorkerCount: number;
  promptIdea: string;
  promptDescription: string;
  promptQuantity: number;
  promptJsonOutput: boolean;
  promptPlatform: string; 
  promptSourceFiles?: File[]; 
  csvFilename: string;
  outputFormat: 'csv' | 'txt';
  
  // === TAMBAHAN BARU UNTUK MODE EPS ===
  epsMode: boolean; 
}

export type Language = 'ENG' | 'IND';
