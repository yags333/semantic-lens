/**
 * Standalone Verification & Unit Test Suite for SemanticLens
 * Tests vector math, cosine similarity, tokenization, and semantic search ranking.
 * Compatible with Node.js and macOS JavaScriptCore (jsc).
 */

const DIM = 512;

function dotProduct(a, b) {
  let sum = 0.0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function l2Norm(v) {
  return Math.sqrt(dotProduct(v, v));
}

function normalizeVector(v) {
  const norm = l2Norm(v);
  if (norm === 0) return new Float32Array(v.length);
  const res = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) res[i] = v[i] / norm;
  return res;
}

function cosineSimilarity(a, b) {
  return Math.max(-1.0, Math.min(1.0, dotProduct(a, b)));
}

// Semantic anchors matching mockClipEngine.ts
const ANCHORS = [
  {
    keywords: ['warrior', 'sword', 'blade', 'armor', 'shield', 'fighter', 'battle', 'knight'],
    indices: [12, 45, 98, 150, 210, 312, 405],
    weights: [1.8, 1.5, 1.2, 1.4, 1.6, 1.3, 1.5]
  },
  {
    keywords: ['dog', 'puppy', 'canine', 'golden', 'retriever', 'grass', 'lawn', 'field', 'running', 'park'],
    indices: [23, 67, 112, 178, 245, 330, 420],
    weights: [1.7, 1.6, 1.4, 1.5, 1.3, 1.4, 1.8]
  },
  {
    keywords: ['mountain', 'mountains', 'peak', 'alps', 'snow', 'snowy', 'sunset', 'sunrise', 'golden hour', 'range'],
    indices: [34, 88, 142, 195, 260, 350, 440],
    weights: [1.6, 1.8, 1.5, 1.7, 1.4, 1.5, 1.6]
  },
  {
    keywords: ['cake', 'birthday', 'celebration', 'candles', 'dessert', 'frosting', 'sweet', 'chocolate'],
    indices: [42, 91, 155, 215, 280, 370, 460],
    weights: [1.9, 1.7, 1.6, 1.5, 1.4, 1.8, 1.3]
  },
  {
    keywords: ['car', 'sports', 'vehicle', 'automobile', 'racing', 'red', 'highway', 'speed', 'supercar'],
    indices: [56, 105, 168, 230, 295, 385, 475],
    weights: [1.8, 1.6, 1.7, 1.4, 1.5, 1.6, 1.4]
  }
];

const STOPWORDS = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'with', 'by', 'of', 'and', 'or', 'to', 'for', 'from']);

function generateEmbedding(text) {
  const vec = new Float32Array(DIM);
  const words = text.toLowerCase().split(/[\s,.-]+/).filter(w => w.length > 0 && !STOPWORDS.has(w));

  for (const anchor of ANCHORS) {
    let matchCount = 0;
    for (const w of words) {
      if (anchor.keywords.some(k => k === w || (w.length >= 3 && k.includes(w)) || (k.length >= 3 && w.includes(k)))) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      for (let i = 0; i < anchor.indices.length; i++) {
        const idx = anchor.indices[i];
        const w = anchor.weights[i] * (1.0 + Math.min(matchCount, 3) * 0.5);
        vec[idx] += w;
        if (idx > 0) vec[idx - 1] += w * 0.45;
        if (idx < DIM - 1) vec[idx + 1] += w * 0.45;
      }
    }
  }

  return normalizeVector(vec);
}

// Sample Gallery Items
const GALLERY = [
  { id: '1', fileName: 'ancient_warrior_blade.jpg', ext: 'jpg', desc: 'warrior sword blade armor knight fighter battle', daysAgo: 2 },
  { id: '2', fileName: 'golden_retriever_grass.png', ext: 'png', desc: 'golden retriever dog puppy running grass lawn park', daysAgo: 5 },
  { id: '3', fileName: 'alpine_sunset_mountains.heic', ext: 'heic', desc: 'alpine mountain peak sunset snow range golden hour', daysAgo: 12 },
  { id: '4', fileName: 'chocolate_birthday_cake.jpg', ext: 'jpg', desc: 'chocolate birthday cake candles celebration dessert frosting', daysAgo: 1 },
  { id: '5', fileName: 'red_sports_supercar.webp', ext: 'webp', desc: 'red sports car vehicle highway speed racing supercar', daysAgo: 18 }
];

// Precompute embeddings for gallery
GALLERY.forEach(item => {
  item.embedding = generateEmbedding(item.desc);
});

// Test Execution
const log = (msg) => {
  if (typeof console !== 'undefined' && console.log) console.log(msg);
  else if (typeof print !== 'undefined') print(msg);
};

log('====================================================');
log('  SemanticLens (LocalMedia AI) - Vector Test Suite  ');
log('====================================================');

let testsPassed = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    testsPassed++;
    log(`  [PASS] ${testName}`);
  } else {
    log(`  [FAIL] ${testName}`);
  }
}

// 1. Math Tests
log('\n1. Testing Vector Math & Normalization...');
const testVec = new Float32Array([3, 4]);
const normVal = l2Norm(testVec);
assert(Math.abs(normVal - 5.0) < 1e-5, 'L2 Norm of [3, 4] is 5.0');

const unitVec = normalizeVector(testVec);
assert(Math.abs(l2Norm(unitVec) - 1.0) < 1e-5, 'Normalized vector has unit length 1.0');

// 2. Semantic Search Tests
log('\n2. Testing Natural Language Semantic Search Ranking...');

const testQueries = [
  { q: 'a warrior with a sword', expected: 'ancient_warrior_blade.jpg' },
  { q: 'dog running on grass', expected: 'golden_retriever_grass.png' },
  { q: 'sunset over mountains', expected: 'alpine_sunset_mountains.heic' },
  { q: 'birthday cake with candles', expected: 'chocolate_birthday_cake.jpg' },
  { q: 'red sports car', expected: 'red_sports_supercar.webp' }
];

testQueries.forEach(({ q, expected }) => {
  const queryVec = generateEmbedding(q);
  const scored = GALLERY.map(item => ({
    item,
    score: cosineSimilarity(queryVec, item.embedding)
  }));
  scored.sort((a, b) => b.score - a.score);

  const top = scored[0];
  const passed = top.item.fileName === expected && top.score >= 0.70;
  assert(
    passed,
    `Query "${q}" -> Top: ${top.item.fileName} (${(top.score * 100).toFixed(1)}% match)`
  );
});

// 3. Metadata Filtering Test
log('\n3. Testing Metadata & Extension Filtering...');
const filteredJpg = GALLERY.filter(item => item.ext === 'jpg');
assert(filteredJpg.length === 2, 'File extension filter (.jpg) returns 2 items');

const filteredRecent = GALLERY.filter(item => item.daysAgo <= 7);
assert(filteredRecent.length === 3, 'Date filter (past 7 days) returns 3 items');

// 4. Visually Similar Reverse Search Test
log('\n4. Testing Visual Similarity Reverse Search...');
const warriorItem = GALLERY[0];
const similarToWarrior = GALLERY
  .filter(g => g.id !== warriorItem.id)
  .map(g => ({ item: g, score: cosineSimilarity(warriorItem.embedding, g.embedding) }))
  .sort((a, b) => b.score - a.score);

assert(similarToWarrior.length === 4, 'Reverse image search scored all candidates');
log(`   Candidate closest to warrior: ${similarToWarrior[0].item.fileName} (${(similarToWarrior[0].score * 100).toFixed(1)}% similarity)`);

log('\n====================================================');
log(`  Results: ${testsPassed} / ${totalTests} tests passed (${Math.round((testsPassed/totalTests)*100)}%)`);
log('====================================================');
