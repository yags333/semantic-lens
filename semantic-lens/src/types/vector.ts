import { MediaItem } from './media';

export type Vector512 = Float32Array;

export interface SimilarityMatch {
  item: MediaItem;
  similarityScore: number; // Cosine similarity: -1.0 to +1.0 (typically 0.0 to 1.0 for CLIP)
  percentageMatch: number; // Scaled 0 to 100%
  rank: number;
}

export interface VectorSearchResult {
  query: string;
  matches: SimilarityMatch[];
  queryTimeMs: number;
  totalIndexed: number;
  matchedCount: number;
}

export interface VectorStoreStats {
  totalVectors: number;
  dimension: number;
  dbSizeBytes: number;
  lastIndexedTimestamp: number;
}
