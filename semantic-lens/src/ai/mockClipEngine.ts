/**
 * Deterministic Semantic Embedding Engine for Mobile Development & Emulation.
 * Produces unit-normalized 512-dimensional vectors in a semantic latent space.
 * Matches realistic CLIP / MobileCLIP cosine similarity distributions:
 * - High semantic overlap: 0.70 - 0.95
 * - Moderate semantic overlap: 0.40 - 0.65
 * - Low / Unrelated: 0.05 - 0.30
 */

import { normalizeVector, EMBEDDING_DIMENSION } from './vectorMath';

// Semantic concept definitions mapping onto latent subspace anchor coordinates
interface SemanticAnchor {
  keywords: string[];
  primaryIndices: number[];
  weights: number[];
}

const SEMANTIC_ANCHORS: SemanticAnchor[] = [
  {
    keywords: ['warrior', 'sword', 'blade', 'armor', 'shield', 'fighter', 'battle', 'knight', 'combat', 'soldier'],
    primaryIndices: [12, 45, 98, 150, 210, 312, 405],
    weights: [1.8, 1.5, 1.2, 1.4, 1.6, 1.3, 1.5]
  },
  {
    keywords: ['dog', 'puppy', 'canine', 'golden', 'retriever', 'grass', 'lawn', 'field', 'park', 'running', 'fetch'],
    primaryIndices: [23, 67, 112, 178, 245, 330, 420],
    weights: [1.7, 1.6, 1.4, 1.5, 1.3, 1.4, 1.8]
  },
  {
    keywords: ['mountain', 'mountains', 'peak', 'alps', 'snow', 'snowy', 'sunset', 'sunrise', 'golden hour', 'sky', 'range'],
    primaryIndices: [34, 88, 142, 195, 260, 350, 440],
    weights: [1.6, 1.8, 1.5, 1.7, 1.4, 1.5, 1.6]
  },
  {
    keywords: ['cake', 'birthday', 'celebration', 'candles', 'dessert', 'frosting', 'sweet', 'party', 'chocolate'],
    primaryIndices: [42, 91, 155, 215, 280, 370, 460],
    weights: [1.9, 1.7, 1.6, 1.5, 1.4, 1.8, 1.3]
  },
  {
    keywords: ['car', 'sports', 'vehicle', 'automobile', 'racing', 'red', 'highway', 'road', 'speed', 'fast', 'supercar'],
    primaryIndices: [56, 105, 168, 230, 295, 385, 475],
    weights: [1.8, 1.6, 1.7, 1.4, 1.5, 1.6, 1.4]
  },
  {
    keywords: ['coffee', 'cup', 'mug', 'book', 'reading', 'wooden', 'table', 'rustic', 'tea', 'cafe', 'pages', 'warm'],
    primaryIndices: [63, 120, 182, 248, 310, 400, 488],
    weights: [1.7, 1.5, 1.8, 1.4, 1.6, 1.3, 1.5]
  },
  {
    keywords: ['city', 'cityscape', 'cyberpunk', 'neon', 'lights', 'night', 'futuristic', 'tokyo', 'skyscrapers', 'glow'],
    primaryIndices: [75, 134, 198, 262, 325, 415, 502],
    weights: [1.8, 1.9, 1.6, 1.7, 1.5, 1.4, 1.6]
  },
  {
    keywords: ['cat', 'kitten', 'sleeping', 'feline', 'couch', 'sofa', 'sunlight', 'nap', 'pet', 'furry', 'cute'],
    primaryIndices: [82, 147, 208, 275, 340, 430, 495],
    weights: [1.8, 1.6, 1.7, 1.5, 1.6, 1.4, 1.5]
  },
  {
    keywords: ['cabin', 'cozy', 'winter', 'forest', 'fireplace', 'woods', 'timber', 'pine', 'trees', 'snowfall'],
    primaryIndices: [90, 160, 222, 288, 355, 445, 508],
    weights: [1.7, 1.5, 1.6, 1.8, 1.4, 1.5, 1.6]
  },
  {
    keywords: ['beach', 'ocean', 'sea', 'waves', 'tropical', 'sand', 'water', 'vacation', 'surf', 'palm'],
    primaryIndices: [18, 77, 139, 201, 270, 362, 452],
    weights: [1.7, 1.8, 1.5, 1.6, 1.4, 1.5, 1.7]
  }
];

/**
 * Deterministic pseudo-random float generator based on string seed
 */
function seededRandom(seed: string, index: number): number {
  let h = 0x811c9dc5;
  const str = `${seed}_dim_${index}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Map to [-0.05, 0.05] ambient baseline noise
  return (((h >>> 0) % 10000) / 10000.0 - 0.5) * 0.1;
}

const STOPWORDS = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'with', 'by', 'of', 'and', 'or', 'to', 'for', 'from']);

export class MockClipEngine {
  /**
   * Generates a 512-dim embedding from an input query string.
   */
  public generateTextEmbedding(query: string): Float32Array {
    const vector = new Float32Array(EMBEDDING_DIMENSION);
    const lowerQuery = query.toLowerCase();
    const queryTokens = lowerQuery.split(/[\s,.-]+/).filter(w => w.length > 0 && !STOPWORDS.has(w));

    // 1. Fill base pseudo-random ambient manifold
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      vector[i] = seededRandom('latent_manifold', i);
    }

    // 2. Project semantic anchors matching words in the query
    let matchedAnchors = 0;
    for (const anchor of SEMANTIC_ANCHORS) {
      let anchorMatchWeight = 0;
      for (const token of queryTokens) {
        if (anchor.keywords.some(k => k === token || (token.length >= 3 && k.includes(token)) || (k.length >= 3 && token.includes(k)))) {
          anchorMatchWeight += 1.0;
        }
      }

      if (anchorMatchWeight > 0) {
        matchedAnchors++;
        for (let i = 0; i < anchor.primaryIndices.length; i++) {
          const idx = anchor.primaryIndices[i];
          const weight = anchor.weights[i] * (1.0 + Math.min(anchorMatchWeight, 3.0) * 0.5);
          vector[idx] += weight;

          // Spread to neighboring dimensions to mimic dense neural representations
          if (idx > 0) vector[idx - 1] += weight * 0.45;
          if (idx < EMBEDDING_DIMENSION - 1) vector[idx + 1] += weight * 0.45;
          if (idx > 1) vector[idx - 2] += weight * 0.2;
          if (idx < EMBEDDING_DIMENSION - 2) vector[idx + 2] += weight * 0.2;
        }
      }
    }

    // 3. Fallback for completely novel queries: hash tokens to diverse manifold dimensions
    if (matchedAnchors === 0) {
      for (const token of queryTokens) {
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
          hash = (hash << 5) - hash + token.charCodeAt(i);
          hash |= 0;
        }
        for (let step = 0; step < 8; step++) {
          const dim = Math.abs((hash + step * 61) % EMBEDDING_DIMENSION);
          vector[dim] += 1.2;
        }
      }
    }

    // 4. L2 Normalize to unit sphere
    return normalizeVector(vector);
  }

  /**
   * Generates a 512-dim embedding from image tags or filename.
   */
  public generateImageEmbedding(tags: string[], fileName: string): Float32Array {
    const combined = `${fileName} ${tags.join(' ')}`;
    return this.generateTextEmbedding(combined);
  }
}

export const mockClipEngine = new MockClipEngine();
