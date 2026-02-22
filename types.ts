
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

export type ApiProvider = 'AUTO' | 'GEMINI' | 'GROQ' | 'PUTER' | 'CUSTOM' | 'MISTRAL';

export interface LocalizedContent {
  title: string;
  keywords: string;
}

export interface FileMetadata {
  en: LocalizedContent;
  ind: LocalizedContent;
  category: string; 
}

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
  generatedImageUrl?: string; // For ImageGen results
  isScientific?: boolean; // Flag if generated with scientific precision
}

export interface Category {
  id: string;
  en: string;
  id_lang: string; 
}

export type AppMode = 'idea' | 'idea_free' | 'idea_paid' | 'prompt' | 'metadata' | 'chat' | 'imageGen' | 'edu_link';

export enum EduSourceType {
  YouTube = 'YouTube',
  File = 'From File',
  Link = 'Link Other'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  translatedContent?: string; 
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  lastModified: number;
}

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

export type ImageAspectRatio = "auto" | "1:1" | "9:16" | "16:9" | "4:3" | "3:4" | "custom";

export interface ImageModeConfig {
  prompt: string;
  quantity: number;
  aspectRatio: ImageAspectRatio;
  zipFilename: string;
  scientificPrecision?: boolean;
}

export type BlendCategory = 
  | 'aesthetic_fusion'
  | 'product_placement'
  | 'material_mapping'
  | 'atmospheric'
  | 'character_consistency'
  | 'hybrid_concept';

export interface AdsSubHeadings {
  auto: boolean;
  media: string;
  history: string;
  photo: string;
  digital: string;
  pop: string;
  material: string;
  core: string;
  print: string;
}

export type AdTextPosition = 'auto' | 'top' | 'bottom' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface AdTextItem {
  id: string;
  text: string;
  position: AdTextPosition;
}

export interface AppSettings {
  apiProvider: ApiProvider;
  geminiModel: string;   
  groqModel: string;     
  puterModel: string;    
  mistralBaseUrl: string; 
  mistralModel: string;   
  customBaseUrl: string; 
  customModel: string;   
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
  ideaMode: 'free' | 'paid';
  ideaQuantity: number;      
  ideaCategory: IdeaCategory;
  ideaCustomInput: string;   
  ideaCustomInstruction: string; 
  ideaSourceFiles?: File[];  
  ideaFromRow: number;       
  ideaBatchSize: number;     
  ideaSourceLines: string[]; 
  promptIdea: string;
  promptDescription: string;
  promptQuantity: number;
  promptJsonOutput: boolean;
  promptPlatform: string; 
  promptSourceFiles?: File[]; 
  imageGenMode: 'T2I' | 'I2I' | 'Blend' | 'Ads';
  imageGenT2ISubMode: 'single' | 'batch';
  imageGenT2I: ImageModeConfig; 
  imageGenT2IBatch: ImageModeConfig; 
  imageGenI2I: ImageModeConfig;
  imageGenBlend: ImageModeConfig;
  imageGenAds: ImageModeConfig;
  imageGenBlendCategory: BlendCategory;
  imageGenAdsSubHeadings: AdsSubHeadings;
  imageGenAdsTexts: AdTextItem[];
  imageGenSourceFile?: File | null; 
  imageGenBatchFile?: File | null; 
  imageGenReferenceFiles: File[]; 
  imageGenAdsObjectFiles: File[]; 
  imageGenAdsStyleFiles: File[]; 
  eduSourceType: EduSourceType;
  eduInputUrl: string;       
  eduSourceFiles: File[];    
  selectedFileType: FileType;
  csvFilename: string;
  outputFormat: 'csv' | 'txt';
}

export type Language = 'ENG' | 'IND';
