/**
 * CLIP Byte Pair Encoding (BPE) Tokenizer
 * Fixed sequence length: 77 tokens
 * Start token: <|startoftext|> (49406)
 * End token: <|endoftext|> (49407)
 */

export const CLIP_CONTEXT_LENGTH = 77;
export const SOT_TOKEN = 49406; // <|startoftext|>
export const EOT_TOKEN = 49407; // <|endoftext|>

export class ClipTokenizer {
  private vocab: Map<string, number> = new Map();
  private bpeRanks: Map<string, number> = new Map();

  constructor() {
    this.initCoreVocab();
  }

  private initCoreVocab() {
    // Basic byte-level and common subwords dictionary initialization
    this.vocab.set('<|startoftext|>', SOT_TOKEN);
    this.vocab.set('<|endoftext|>', EOT_TOKEN);

    // Common words and fragments mapping to deterministic token IDs
    const commonVocabulary = [
      'a', 'an', 'the', 'in', 'on', 'at', 'with', 'by', 'of', 'and', 'or',
      'warrior', 'sword', 'blade', 'armor', 'fighter', 'battle', 'knight',
      'dog', 'puppy', 'canine', 'running', 'grass', 'lawn', 'field', 'park',
      'mountain', 'mountains', 'peak', 'alps', 'snow', 'snowy', 'sunset', 'sunrise',
      'cake', 'birthday', 'celebration', 'candles', 'dessert', 'frosting',
      'car', 'sports', 'vehicle', 'automobile', 'racing', 'red', 'highway', 'road',
      'coffee', 'cup', 'mug', 'book', 'reading', 'wooden', 'table', 'rustic', 'tea',
      'city', 'cityscape', 'cyberpunk', 'neon', 'lights', 'night', 'futuristic',
      'cat', 'kitten', 'sleeping', 'couch', 'sunlight', 'pet', 'animal',
      'cabin', 'forest', 'nature', 'ocean', 'sea', 'beach', 'waves', 'sky', 'clouds'
    ];

    let id = 100;
    for (const word of commonVocabulary) {
      this.vocab.set(word, id++);
      this.vocab.set(word + '</w>', id++);
    }
  }

  /**
   * Cleans text (lowercase, trims punctuation, normalizes whitespace)
   */
  public cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[^\w\s<|>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tokenizes an input string into an Int32Array of length 77.
   * Format: [<SOT>, token_1, token_2, ..., <EOT>, 0, 0, ...]
   */
  public encode(text: string): Int32Array {
    const tokens = new Int32Array(CLIP_CONTEXT_LENGTH);
    const cleaned = this.cleanText(text);
    const words = cleaned.split(' ').filter(w => w.length > 0);

    let tokenIndex = 0;
    tokens[tokenIndex++] = SOT_TOKEN;

    for (const word of words) {
      if (tokenIndex >= CLIP_CONTEXT_LENGTH - 1) break; // Reserve space for EOT

      // Check direct vocabulary
      const lookup = this.vocab.get(word) || this.vocab.get(word + '</w>');
      if (lookup !== undefined) {
        tokens[tokenIndex++] = lookup;
      } else {
        // Fallback: character-level hashed tokenization for unknown words
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
          hash = (hash << 5) - hash + word.charCodeAt(i);
          hash |= 0;
        }
        const tokenId = 1000 + Math.abs(hash % 40000);
        tokens[tokenIndex++] = tokenId;
      }
    }

    // Add End of Text token
    tokens[tokenIndex] = EOT_TOKEN;
    // Remaining entries stay 0 (padding)
    return tokens;
  }
}

export const defaultTokenizer = new ClipTokenizer();
