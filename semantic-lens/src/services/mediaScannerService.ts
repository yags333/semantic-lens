/**
 * Local Media Scanner Service
 * Scans photo gallery/camera roll and discovers new or modified images
 */

import { sqliteDb } from '../db/database';
import { MediaScanResult, SupportedExtension } from '../types/media';
import { permissionService } from './permissionService';

export class MediaScannerService {
  /**
   * Scans local gallery in batches to find images not yet indexed in SQLite.
   */
  public async scanForUnindexedMedia(maxToScan = 200): Promise<MediaScanResult[]> {
    const perm = await permissionService.checkPermission();
    if (!perm.granted) {
      console.warn('[MediaScanner] Storage permission not granted.');
      return [];
    }

    try {
      // @ts-ignore
      const MediaLibrary = await import('expo-media-library').catch(() => null);
      if (MediaLibrary) {
        const assets = await MediaLibrary.getAssetsAsync({
          first: maxToScan,
          mediaType: ['photo'],
          sortBy: ['creationTime']
        });

        const unindexed: MediaScanResult[] = [];
        for (const asset of assets.assets) {
          const existing = await sqliteDb.getMediaItemByPath(asset.uri);
          if (!existing) {
            const ext = asset.filename.split('.').pop()?.toLowerCase() || 'jpg';
            unindexed.push({
              filePath: asset.uri,
              fileName: asset.filename,
              fileExtension: ext,
              fileSize: 1024 * 1024 * 2, // approximate default
              width: asset.width || 1920,
              height: asset.height || 1080,
              captureDate: asset.creationTime || Date.now(),
              thumbnailUri: asset.uri
            });
          }
        }
        return unindexed;
      }
    } catch (err) {
      console.warn('[MediaScanner] Native gallery scan not available, using local seed mock.', err);
    }

    return [];
  }
}

export const mediaScanner = new MediaScannerService();
