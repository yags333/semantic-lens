/**
 * Media entity types for SemanticLens
 */

export type SupportedExtension = 'jpg' | 'jpeg' | 'png' | 'heic' | 'webp';

export interface ExifMetadata {
  cameraMake?: string;
  cameraModel?: string;
  fNumber?: number;
  exposureTime?: string;
  iso?: number;
  focalLength?: string;
  latitude?: number;
  longitude?: number;
}

export interface MediaItem {
  id: string;
  filePath: string;
  fileName: string;
  fileExtension: SupportedExtension | string;
  fileSize: number; // bytes
  width: number;
  height: number;
  captureDate: number; // UNIX timestamp ms
  indexedAt: number; // UNIX timestamp ms
  embedding: Float32Array; // 512-dim normalized vector
  tags?: string[];
  thumbnailUri?: string;
  exif?: ExifMetadata;
}

export interface MediaScanResult {
  filePath: string;
  fileName: string;
  fileExtension: string;
  fileSize: number;
  width: number;
  height: number;
  captureDate: number;
  thumbnailUri?: string;
}
