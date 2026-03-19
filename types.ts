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

export type ApiProvider = 'GEMINI CANVAS';

export interface LocalizedContent {
  title: string;
  keywords: string;
}

export interface FileMetadata {
  en: LocalizedContent;
  ind: LocalizedContent;
  category: string; 
}

// === STRUKTUR RAPOR QC (BARU) ===
export interface QcResult {
  score: number;             // Skor Kelayakan (1-100)
  status: 'Pass' | 'Fail' | 'Warning'; 
  technicalIssues: string[]; // Masalah teknis (Blur, Noise, Pencahayaan)
  ipIssues: string[];        // Pelanggaran Hak Cipta (Logo, Brand, Muka Orang)
  commercialAdvice: string;  // Nilai jual komersial (Saran dari AI)
  resolutionInfo?: string;   // Pengecekan lokal (Misal: "Lolos (>4MP)" atau "Gagal (<4MP)")
}
// ================================

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
  qcResult?: QcResult; // <--- Rapor QC nempel di sini Lek
}

export interface Category {
  id: string;
  en: string;
  id_lang: string; 
}

// === TAMBAHAN MODE 'qc' DI SINI ===
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

export interface AppSettings {
  apiProvider: ApiProvider;
  geminiModel: string;   
  customTitle: string;
  customKeyword: string;
  negativeMetadata: string; 
  ideaNegativeContext: string; 
  metadataPlatform: 'Adobe Stock' | 'Shutterstock';
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
}

export type Language = 'ENG' | 'IND';
