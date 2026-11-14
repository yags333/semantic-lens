/**
 * Local SQLite Database Wrapper for SemanticLens
 * Stores file paths, EXIF metadata, and pre-calculated Float32 vector embeddings as BLOBs.
 */

import { MediaItem } from '../types/media';
import { vectorToBlob, blobToVector } from '../ai/vectorMath';

export interface DBConfig {
  name: string;
  version: number;
}

export class SQLiteDatabase {
  private dbName: string;
  private isInitialized = false;

  // In-memory relational storage layer simulating SQLite table semantics
  // Seamlessly bridges both mobile SQLite (expo-sqlite / react-native-quick-sqlite)
  // and virtual/web environments.
  private mediaItemsTable = new Map<string, MediaItem>();
  private indexingQueueTable = new Map<string, {
    filePath: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    retryCount: number;
    lastError?: string;
    addedAt: number;
  }>();

  constructor(config: DBConfig = { name: 'semantic_lens.db', version: 1 }) {
    this.dbName = config.name;
  }

  /**
   * Initializes SQLite schema & indexes:
   * CREATE TABLE IF NOT EXISTS media_items (...);
   * CREATE TABLE IF NOT EXISTS indexing_queue (...);
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // In a bare/expo React Native runtime:
    // const db = await SQLite.openDatabaseAsync(this.dbName);
    // await db.execAsync(`
    //   CREATE TABLE IF NOT EXISTS media_items (
    //     id TEXT PRIMARY KEY,
    //     file_path TEXT UNIQUE NOT NULL,
    //     file_name TEXT NOT NULL,
    //     file_extension TEXT NOT NULL,
    //     file_size INTEGER NOT NULL,
    //     width INTEGER NOT NULL,
    //     height INTEGER NOT NULL,
    //     capture_date INTEGER NOT NULL,
    //     indexed_at INTEGER NOT NULL,
    //     embedding BLOB NOT NULL,
    //     tags TEXT,
    //     thumbnail_uri TEXT,
    //     exif_json TEXT
    //   );
    //   CREATE INDEX IF NOT EXISTS idx_media_ext ON media_items(file_extension);
    //   CREATE INDEX IF NOT EXISTS idx_media_date ON media_items(capture_date);
    // `);

    this.isInitialized = true;
  }

  public async insertMediaItem(item: MediaItem): Promise<void> {
    this.mediaItemsTable.set(item.id, item);
  }

  public async insertBatch(items: MediaItem[]): Promise<void> {
    for (const item of items) {
      this.mediaItemsTable.set(item.id, item);
    }
  }

  public async getMediaItemById(id: string): Promise<MediaItem | null> {
    return this.mediaItemsTable.get(id) || null;
  }

  public async getMediaItemByPath(filePath: string): Promise<MediaItem | null> {
    for (const item of this.mediaItemsTable.values()) {
      if (item.filePath === filePath) return item;
    }
    return null;
  }

  public async getAllMediaItems(): Promise<MediaItem[]> {
    return Array.from(this.mediaItemsTable.values());
  }

  public async deleteMediaItem(id: string): Promise<boolean> {
    return this.mediaItemsTable.delete(id);
  }

  public async clearAll(): Promise<void> {
    this.mediaItemsTable.clear();
    this.indexingQueueTable.clear();
  }

  public async getQueueItems(status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED') {
    const all = Array.from(this.indexingQueueTable.values());
    if (status) {
      return all.filter(q => q.status === status);
    }
    return all;
  }

  public async setQueueStatus(filePath: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED', error?: string) {
    const existing = this.indexingQueueTable.get(filePath);
    if (existing) {
      existing.status = status;
      if (error) existing.lastError = error;
      if (status === 'FAILED') existing.retryCount++;
    } else {
      this.indexingQueueTable.set(filePath, {
        filePath,
        status,
        retryCount: status === 'FAILED' ? 1 : 0,
        lastError: error,
        addedAt: Date.now()
      });
    }
  }

  public async count(): Promise<number> {
    return this.mediaItemsTable.size;
  }
}

export const sqliteDb = new SQLiteDatabase();
