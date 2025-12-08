/**
 * Capture Types
 */

export type CaptureType = 'url' | 'text' | 'image' | 'file' | 'note';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Capture {
  id: string;
  type: CaptureType;
  title?: string;
  url?: string;
  domain?: string;
  text?: string;
  rawText?: string;
  ocrText?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  favicon?: string;
  summary?: string;
  language?: string;
  author?: string;
  publishedDate?: string;
  processingStatus: ProcessingStatus;
  device?: string;
  source: string;
  metadata?: Record<string, any>;
  tags?: Tag[];
  notes?: Note[];
  collections?: Collection[];
  createdAt: string;
  updatedAt: string;
  snippet?: string; // For search results
}

export interface CreateCaptureData {
  type: CaptureType;
  title?: string;
  url?: string;
  text?: string;
  tags?: string[];
  collectionIds?: string[];
  file?: File;
}

export interface UpdateCaptureData {
  title?: string;
  tags?: string[];
}

export interface CaptureFilters {
  page?: number;
  limit?: number;
  type?: CaptureType;
  tags?: string[];
  collectionId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'ASC' | 'DESC';
  search?: string;
}

export interface SearchParams {
  query?: string;
  types?: CaptureType[];
  tags?: string[];
  collectionId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'relevance' | 'createdAt' | 'updatedAt' | 'title';
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
