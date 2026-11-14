/**
 * ONNX Runtime Mobile Wrapper for React Native
 * Interacts with 'onnxruntime-react-native'
 * Models: MobileCLIP / Quantized CLIP (ViT-B/32)
 */

import { defaultTokenizer } from './tokenizer';
import { normalizePixelsToNCHW, PreprocessedImageTensor } from './imagePreprocessor';
import { normalizeVector, EMBEDDING_DIMENSION } from './vectorMath';

export interface OnnxInferenceResult {
  embedding: Float32Array;
  inferenceDurationMs: number;
}

export class OnnxModelRunner {
  private isInitialized = false;
  private isVisionLoaded = false;
  private isTextLoaded = false;

  // Handles to ONNX sessions if native module is linked
  private textSession: any = null;
  private visionSession: any = null;

  /**
   * Initializes ONNX Runtime Mobile sessions
   */
  public async initialize(textModelPath?: string, visionModelPath?: string): Promise<boolean> {
    try {
      // Dynamic import to handle environments where onnxruntime-react-native is linked
      // @ts-ignore
      const ort = await import('onnxruntime-react-native').catch(() => null);
      if (!ort || !ort.InferenceSession) {
        console.warn('[ONNX] Native onnxruntime-react-native not linked in this runtime environment. Using simulation fallback.');
        this.isInitialized = false;
        return false;
      }

      if (textModelPath) {
        this.textSession = await ort.InferenceSession.create(textModelPath);
        this.isTextLoaded = true;
      }
      if (visionModelPath) {
        this.visionSession = await ort.InferenceSession.create(visionModelPath);
        this.isVisionLoaded = true;
      }

      this.isInitialized = this.isTextLoaded || this.isVisionLoaded;
      return this.isInitialized;
    } catch (err) {
      console.warn('[ONNX] Failed to load ONNX sessions, falling back to local simulated vector engine:', err);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Encodes natural language query into 512-dim embedding using ONNX text encoder
   */
  public async runTextInference(query: string): Promise<OnnxInferenceResult | null> {
    if (!this.textSession) return null;

    const startTime = performance.now();
    const tokenIds = defaultTokenizer.encode(query);

    // Dynamic import of ort Tensor
    // @ts-ignore
    const ort = await import('onnxruntime-react-native');
    const inputTensor = new ort.Tensor('int32', tokenIds, [1, tokenIds.length]);

    const feeds: Record<string, any> = { input_ids: inputTensor };
    const results = await this.textSession.run(feeds);

    // Extract text_embeds or output tensor
    const outputTensor = results.text_embeds || results.output || Object.values(results)[0];
    const rawData = outputTensor.data as Float32Array;
    const normalized = normalizeVector(new Float32Array(rawData));

    return {
      embedding: normalized,
      inferenceDurationMs: performance.now() - startTime
    };
  }

  /**
   * Encodes preprocessed image pixels into 512-dim embedding using ONNX vision encoder
   */
  public async runVisionInference(tensor: PreprocessedImageTensor): Promise<OnnxInferenceResult | null> {
    if (!this.visionSession) return null;

    const startTime = performance.now();
    // @ts-ignore
    const ort = await import('onnxruntime-react-native');
    const inputTensor = new ort.Tensor('float32', tensor.data, tensor.dims);

    const feeds: Record<string, any> = { pixel_values: inputTensor };
    const results = await this.visionSession.run(feeds);

    const outputTensor = results.image_embeds || results.output || Object.values(results)[0];
    const rawData = outputTensor.data as Float32Array;
    const normalized = normalizeVector(new Float32Array(rawData));

    return {
      embedding: normalized,
      inferenceDurationMs: performance.now() - startTime
    };
  }

  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      isTextLoaded: this.isTextLoaded,
      isVisionLoaded: this.isVisionLoaded
    };
  }
}

export const onnxRunner = new OnnxModelRunner();
