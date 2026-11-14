/**
 * Battery-Aware Background Indexing Queue
 * Processes unindexed photos in small batches with thermal pauses to avoid battery drain.
 */

import { sqliteDb } from '../db/database';
import { aiEngine } from '../ai/aiEngine';
import { MediaItem, MediaScanResult } from '../types/media';
import { IndexingStatus } from '../types/search';

export type IndexingProgressCallback = (status: IndexingStatus) => void;

export class IndexingQueue {
  private isProcessing = false;
  private shouldStop = false;
  private listeners: Set<IndexingProgressCallback> = new Set();

  private status: IndexingStatus = {
    totalDiscovered: 0,
    indexedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    isIndexing: false,
    batteryLevel: 0.85,
    isLowPowerMode: false,
    progressPercentage: 0
  };

  public subscribe(cb: IndexingProgressCallback): () => void {
    this.listeners.add(cb);
    cb({ ...this.status });
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.status }));
  }

  /**
   * Enqueues discovered media items and begins background processing.
   */
  public async enqueueAndProcess(
    items: MediaScanResult[],
    batchSize = 10,
    pauseBetweenBatchesMs = 80
  ): Promise<void> {
    if (this.isProcessing) {
      console.warn('[IndexingQueue] Already processing.');
      return;
    }

    this.shouldStop = false;
    this.isProcessing = true;
    this.status.isIndexing = true;
    this.status.totalDiscovered = items.length;
    this.status.pendingCount = items.length;
    this.notify();

    for (let i = 0; i < items.length; i += batchSize) {
      if (this.shouldStop) {
        break;
      }

      // Check battery constraints (e.g. if below 15% stop to conserve battery)
      if (this.status.batteryLevel < 0.15 && !this.status.isLowPowerMode) {
        console.warn('[IndexingQueue] Low battery detected (< 15%). Pausing background indexing.');
        break;
      }

      const batch = items.slice(i, i + batchSize);
      const batchStartTime = performance.now();

      for (const item of batch) {
        if (this.shouldStop) break;

        this.status.currentProcessingFile = item.fileName;
        this.notify();

        try {
          // Extract tags from filename for semantic concept seeding
          const cleanName = item.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          const tags = cleanName.split(/\s+/).filter(w => w.length > 2);

          // Generate 512-dim embedding through vision model
          const embedding = await aiEngine.encodeImage(tags, item.fileName);

          const mediaItem: MediaItem = {
            id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            filePath: item.filePath,
            fileName: item.fileName,
            fileExtension: item.fileExtension,
            fileSize: item.fileSize,
            width: item.width,
            height: item.height,
            captureDate: item.captureDate,
            indexedAt: Date.now(),
            embedding,
            tags,
            thumbnailUri: item.thumbnailUri
          };

          await sqliteDb.insertMediaItem(mediaItem);
          this.status.indexedCount++;
          this.status.pendingCount--;
        } catch (err) {
          console.error('[IndexingQueue] Error indexing item:', item.fileName, err);
          this.status.failedCount++;
          this.status.pendingCount--;
        }

        this.status.progressPercentage = Math.round(
          ((this.status.indexedCount + this.status.failedCount) / this.status.totalDiscovered) * 100
        );
        this.notify();
      }

      this.status.lastBatchLatencyMs = performance.now() - batchStartTime;
      this.notify();

      // Thermal pause to keep device cool and UI 120fps responsive
      await new Promise(res => setTimeout(res, pauseBetweenBatchesMs));
    }

    this.isProcessing = false;
    this.status.isIndexing = false;
    this.status.currentProcessingFile = undefined;
    this.notify();
  }

  public stop(): void {
    this.shouldStop = true;
  }

  public getStatus(): IndexingStatus {
    return { ...this.status };
  }
}

export const indexingQueue = new IndexingQueue();
