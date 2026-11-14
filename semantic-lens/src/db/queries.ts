/**
 * Database queries and utility helpers for SemanticLens
 */

import { sqliteDb } from './database';
import { MediaItem } from '../types/media';
import { FilterOptions } from '../types/search';

export async function getMediaById(id: string): Promise<MediaItem | null> {
  return sqliteDb.getMediaItemById(id);
}

export async function getAllMedia(): Promise<MediaItem[]> {
  return sqliteDb.getAllMediaItems();
}

export async function addOrUpdateMedia(item: MediaItem): Promise<void> {
  return sqliteDb.insertMediaItem(item);
}

export async function removeMedia(id: string): Promise<boolean> {
  return sqliteDb.deleteMediaItem(id);
}

export async function getDistinctExtensions(): Promise<string[]> {
  const all = await sqliteDb.getAllMediaItems();
  const set = new Set<string>();
  all.forEach(item => {
    set.add(item.fileExtension.toLowerCase().replace('.', ''));
  });
  return Array.from(set).sort();
}
