/**
 * Local Vector Store Wrapper for SemanticLens
 * Performs sub-millisecond cosine similarity search across Float32Array embeddings,
 * combined with SQLite metadata and file type filtering.
 */

import { sqliteDb } from './database';
import { MediaItem, SupportedExtension } from '../types/media';
import { SimilarityMatch, VectorSearchResult, VectorStoreStats } from '../types/vector';
import { FilterOptions } from '../types/search';
import { dotProduct, EMBEDDING_DIMENSION } from '../ai/vectorMath';

export class VectorStore {
  /**
   * Performs semantic vector search:
   * 1. Fetches candidate items matching metadata filters (extensions, date ranges).
   * 2. Calculates dot-product cosine similarity against query vector.
   * 3. Ranks by similarity score and filters by minSimilarity threshold.
   */
  public async searchByVector(
    queryVector: Float32Array,
    options?: Partial<FilterOptions>,
    limit = 50
  ): Promise<VectorSearchResult> {
    const startTime = performance.now();
    const allItems = await sqliteDb.getAllMediaItems();

    // Default filters
    const extensions = options?.extensions || [];
    const startDate = options?.startDate;
    const endDate = options?.endDate;
    const minSimilarity = options?.minSimilarity ?? 0.20;
    const sortBy = options?.sortBy || 'relevance';

    // Filter items first (predicate pushdown)
    const filteredItems = allItems.filter(item => {
      // 1. Extension filter
      if (extensions.length > 0) {
        const itemExt = item.fileExtension.toLowerCase().replace('.', '') as SupportedExtension;
        const matchesExt = extensions.some(ext => ext.toLowerCase().replace('.', '') === itemExt);
        if (!matchesExt) return false;
      }

      // 2. Date range filter
      if (startDate !== undefined && item.captureDate < startDate) {
        return false;
      }
      if (endDate !== undefined && item.captureDate > endDate) {
        return false;
      }

      return true;
    });

    // Compute similarity scores
    const scoredMatches: SimilarityMatch[] = [];

    for (const item of filteredItems) {
      if (!item.embedding || item.embedding.length !== EMBEDDING_DIMENSION) {
        continue;
      }

      // Vectors are pre-normalized to unit length, so dot product == cosine similarity
      const score = dotProduct(queryVector, item.embedding);

      // Clamp between -1 and 1
      const clamped = Math.max(-1.0, Math.min(1.0, score));

      if (clamped >= minSimilarity) {
        scoredMatches.push({
          item,
          similarityScore: clamped,
          percentageMatch: Math.round(Math.max(0, clamped) * 100),
          rank: 0
        });
      }
    }

    // Sort according to criteria
    if (sortBy === 'relevance') {
      scoredMatches.sort((a, b) => b.similarityScore - a.similarityScore);
    } else if (sortBy === 'date_desc') {
      scoredMatches.sort((a, b) => b.item.captureDate - a.item.captureDate);
    } else if (sortBy === 'date_asc') {
      scoredMatches.sort((a, b) => a.item.captureDate - b.item.captureDate);
    } else if (sortBy === 'size_desc') {
      scoredMatches.sort((a, b) => b.item.fileSize - a.item.fileSize);
    }

    // Assign final ranks
    const topResults = scoredMatches.slice(0, limit).map((match, idx) => ({
      ...match,
      rank: idx + 1
    }));

    const queryDuration = performance.now() - startTime;

    return {
      query: '',
      matches: topResults,
      queryTimeMs: Math.round(queryDuration * 100) / 100,
      totalIndexed: allItems.length,
      matchedCount: scoredMatches.length
    };
  }

  /**
   * Reverse image search: Finds photos visually similar to a given photo
   */
  public async findVisuallySimilar(
    mediaId: string,
    limit = 10,
    minSimilarity = 0.40
  ): Promise<SimilarityMatch[]> {
    const targetItem = await sqliteDb.getMediaItemById(mediaId);
    if (!targetItem || !targetItem.embedding) {
      return [];
    }

    const allItems = await sqliteDb.getAllMediaItems();
    const scoredMatches: SimilarityMatch[] = [];

    for (const item of allItems) {
      if (item.id === mediaId) continue; // Skip self

      const score = dotProduct(targetItem.embedding, item.embedding);
      const clamped = Math.max(-1.0, Math.min(1.0, score));

      if (clamped >= minSimilarity) {
        scoredMatches.push({
          item,
          similarityScore: clamped,
          percentageMatch: Math.round(Math.max(0, clamped) * 100),
          rank: 0
        });
      }
    }

    scoredMatches.sort((a, b) => b.similarityScore - a.similarityScore);
    return scoredMatches.slice(0, limit).map((match, idx) => ({
      ...match,
      rank: idx + 1
    }));
  }

  /**
   * Retrieves summary statistics of the vector index
   */
  public async getStats(): Promise<VectorStoreStats> {
    const total = await sqliteDb.count();
    return {
      totalVectors: total,
      dimension: EMBEDDING_DIMENSION,
      dbSizeBytes: total * (EMBEDDING_DIMENSION * 4 + 512), // ~2.5KB per indexed photo
      lastIndexedTimestamp: Date.now()
    };
  }
}

export const vectorStore = new VectorStore();
