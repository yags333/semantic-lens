/**
 * High-Level On-Device AI Engine Facade
 * Provides unified interface for text encoding, visual feature extraction,
 * and cosine similarity vector operations.
 */

import { onnxRunner } from './onnxModelRunner';
import { mockClipEngine } from './mockClipEngine';
import { cosineSimilarity, normalizeVector } from './vectorMath';
import { PreprocessedImageTensor } from './imagePreprocessor';

export interface AIStatus {
  mode: 'ONNX_MOBILE' | 'DETERMINISTIC_EMULATOR';
  isModelReady: boolean;
  dimension: number;
}

export class AIEngine {
  private useOnnx = false;

  public async initialize(textModelPath?: string, visionModelPath?: string): Promise<AIStatus> {
    const onnxSuccess = await onnxRunner.initialize(textModelPath, visionModelPath);
    this.useOnnx = onnxSuccess;
    return this.getStatus();
  }

  /**
   * Encodes a natural language text query into a 512-dim unit embedding vector
   */
  public async encodeText(query: string): Promise<Float32Array> {
    if (this.useOnnx) {
      const res = await onnxRunner.runTextInference(query);
      if (res && res.embedding) {
        return res.embedding;
      }
    }
    // Fallback to deterministic semantic vector generator
    return mockClipEngine.generateTextEmbedding(query);
  }

  /**
   * Extracts visual features from an image into a 512-dim unit embedding vector
   */
  public async encodeImage(
    tags: string[] = [],
    fileName = '',
    preprocessedTensor?: PreprocessedImageTensor
  ): Promise<Float32Array> {
    if (this.useOnnx && preprocessedTensor) {
      const res = await onnxRunner.runVisionInference(preprocessedTensor);
      if (res && res.embedding) {
        return res.embedding;
      }
    }
    // Fallback to deterministic semantic feature generator
    return mockClipEngine.generateImageEmbedding(tags, fileName);
  }

  /**
   * Computes cosine similarity between two 512-dim unit embeddings
   */
  public calculateSimilarity(vecA: Float32Array, vecB: Float32Array): number {
    return cosineSimilarity(vecA, vecB, true);
  }

  public getStatus(): AIStatus {
    return {
      mode: this.useOnnx ? 'ONNX_MOBILE' : 'DETERMINISTIC_EMULATOR',
      isModelReady: true,
      dimension: 512
    };
  }
}

export const aiEngine = new AIEngine();
