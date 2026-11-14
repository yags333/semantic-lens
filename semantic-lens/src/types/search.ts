import { SupportedExtension } from './media';

export type SortOrder = 'relevance' | 'date_desc' | 'date_asc' | 'size_desc';

export interface FilterOptions {
  extensions: SupportedExtension[];
  startDate?: number; // UNIX timestamp ms
  endDate?: number;   // UNIX timestamp ms
  minSimilarity: number; // e.g. 0.20 or 0.25 threshold
  sortBy: SortOrder;
}

export interface IndexingStatus {
  totalDiscovered: number;
  indexedCount: number;
  pendingCount: number;
  failedCount: number;
  isIndexing: boolean;
  batteryLevel: number; // 0.0 to 1.0
  isLowPowerMode: boolean;
  currentProcessingFile?: string;
  progressPercentage: number;
  lastBatchLatencyMs?: number;
}
