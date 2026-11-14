/**
 * Image preprocessing for CLIP / MobileCLIP models.
 * Model input requirements:
 * - Dimensions: 224 x 224 pixels
 * - Color channels: RGB (3 channels)
 * - Normalization:
 *     mean = [0.48145466, 0.4578275, 0.40821073]
 *     std  = [0.26862954, 0.26130258, 0.27577711]
 * - Tensor shape: [1, 3, 224, 224] (NCHW Float32)
 */

export const MODEL_IMAGE_SIZE = 224;
export const CLIP_MEAN = [0.48145466, 0.4578275, 0.40821073];
export const CLIP_STD = [0.26862954, 0.26130258, 0.27577711];

export interface PreprocessedImageTensor {
  data: Float32Array; // Length: 1 * 3 * 224 * 224 = 150,528 floats
  dims: [number, number, number, number]; // [1, 3, 224, 224]
}

/**
 * Normalizes raw RGB byte pixels (0..255) into NCHW Float32 tensor buffer
 */
export function normalizePixelsToNCHW(
  rgbBytes: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number
): PreprocessedImageTensor {
  const targetSize = MODEL_IMAGE_SIZE;
  const channelSize = targetSize * targetSize;
  const totalElements = 3 * channelSize;
  const floatData = new Float32Array(totalElements);

  // If input is not 224x224, we sample with bilinear interpolation
  const xRatio = width / targetSize;
  const yRatio = height / targetSize;

  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const srcX = Math.min(Math.floor(x * xRatio), width - 1);
      const srcY = Math.min(Math.floor(y * yRatio), height - 1);
      const srcIndex = (srcY * width + srcX) * 4; // assuming RGBA 4 bytes per pixel

      const r = rgbBytes[srcIndex] / 255.0;
      const g = rgbBytes[srcIndex + 1] / 255.0;
      const b = rgbBytes[srcIndex + 2] / 255.0;

      const destPixel = y * targetSize + x;

      // NCHW Layout: Channel 0 (R), Channel 1 (G), Channel 2 (B)
      floatData[0 * channelSize + destPixel] = (r - CLIP_MEAN[0]) / CLIP_STD[0];
      floatData[1 * channelSize + destPixel] = (g - CLIP_MEAN[1]) / CLIP_STD[1];
      floatData[2 * channelSize + destPixel] = (b - CLIP_MEAN[2]) / CLIP_STD[2];
    }
  }

  return {
    data: floatData,
    dims: [1, 3, targetSize, targetSize]
  };
}
