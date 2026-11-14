/**
 * High-performance vector math operations for 512-dimensional embeddings.
 * Optimized for mobile Float32Array SIMD/TypedArray execution.
 */

export const EMBEDDING_DIMENSION = 512;

/**
 * Computes the dot product of two Float32Arrays of identical length.
 */
export function dotProduct(a: Float32Array, b: Float32Array): number {
  let sum = 0.0;
  const len = a.length;
  // Loop unrolling for high-speed JS engine optimization
  const unroll = len - (len % 4);
  let i = 0;
  for (; i < unroll; i += 4) {
    sum += a[i] * b[i] +
           a[i + 1] * b[i + 1] +
           a[i + 2] * b[i + 2] +
           a[i + 3] * b[i + 3];
  }
  for (; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Computes Euclidean (L2) norm of a vector.
 */
export function l2Norm(v: Float32Array): number {
  return Math.sqrt(dotProduct(v, v));
}

/**
 * Normalizes vector to unit length (L2 norm = 1.0).
 */
export function normalizeVector(v: Float32Array): Float32Array {
  const norm = l2Norm(v);
  if (norm === 0 || isNaN(norm)) {
    return new Float32Array(v.length);
  }
  const result = new Float32Array(v.length);
  const invNorm = 1.0 / norm;
  for (let i = 0; i < v.length; i++) {
    result[i] = v[i] * invNorm;
  }
  return result;
}

/**
 * Computes cosine similarity between two vectors.
 * Returns value between -1.0 and +1.0.
 * If both vectors are already unit normalized, cosine similarity is simply the dot product!
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array, isAlreadyNormalized = true): number {
  if (isAlreadyNormalized) {
    const rawDot = dotProduct(a, b);
    return Math.max(-1.0, Math.min(1.0, rawDot));
  }
  const normA = l2Norm(a);
  const normB = l2Norm(b);
  if (normA === 0 || normB === 0) return 0.0;
  return Math.max(-1.0, Math.min(1.0, dotProduct(a, b) / (normA * normB)));
}

/**
 * Serializes a Float32Array into binary bytes (IEEE 754 Little Endian) for SQLite BLOB storage.
 * 512 floats * 4 bytes = exactly 2,048 bytes per image embedding.
 */
export function vectorToBlob(v: Float32Array): Uint8Array {
  return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
}

/**
 * Deserializes raw binary bytes from SQLite BLOB back into a Float32Array without copying memory.
 */
export function blobToVector(bytes: Uint8Array): Float32Array {
  // Ensure alignment
  if (bytes.byteOffset % 4 === 0) {
    return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
  }
  // Safe fallback if buffer is unaligned
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return new Float32Array(copy.buffer, 0, copy.length / 4);
}

/**
 * Returns the indices of the top K highest values.
 */
export function topKIndices(scores: number[], k: number): number[] {
  const indexed = scores.map((val, idx) => ({ idx, val }));
  indexed.sort((a, b) => b.val - a.val);
  return indexed.slice(0, Math.min(k, indexed.length)).map(item => item.idx);
}
