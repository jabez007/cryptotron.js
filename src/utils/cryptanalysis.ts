import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// User requested to remove the eval trick and __dirname branch
// Directly using import.meta.url with fileURLToPath
// @ts-ignore - import.meta is only allowed in ESM, but we handle it
const currentDir = path.dirname(fileURLToPath(import.meta.url));

export function normalize(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, '');
}

// Simple monogram frequencies for English
export const MONOGRAMS: Record<string, number> = {
  'A': 0.08167, 'B': 0.01492, 'C': 0.02782, 'D': 0.04253, 'E': 0.12702, 'F': 0.02228, 'G': 0.02015,
  'H': 0.06094, 'I': 0.06966, 'J': 0.00153, 'K': 0.00772, 'L': 0.04025, 'M': 0.02406, 'N': 0.06749,
  'O': 0.07507, 'P': 0.01929, 'Q': 0.00095, 'R': 0.05987, 'S': 0.06327, 'T': 0.09056, 'U': 0.02758,
  'V': 0.00978, 'W': 0.02360, 'X': 0.00150, 'Y': 0.01974, 'Z': 0.00074
};

export function scoreMonograms(text: string): number {
  let score = 0;
  for (let i = 0; i < text.length; i++) {
    score += Math.log10(MONOGRAMS[text[i]] || 0.0001);
  }
  return score;
}

export class Scorer {
  private ngrams: Record<string, number> = {};
  private n: number = 0;
  private total: number = 0;
  private floor: number = 0;

  constructor(ngramType: 'monograms' | 'bigrams' | 'trigrams' | 'quadgrams' = 'quadgrams') {
    const filePath = path.join(currentDir, '..', 'ngrams', `${ngramType}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    this.ngrams = data;
    this.n = ngramType === 'monograms' ? 1 : 
             ngramType === 'bigrams' ? 2 : 
             ngramType === 'trigrams' ? 3 : 4;
    
    this.total = Object.values(this.ngrams).reduce((sum, count) => sum + count, 0);
    
    // We use the log of the probability of a very rare ngram (count of 0.01) as the floor
    this.floor = Math.log10(0.01 / this.total);

    // Pre-calculate log probabilities to speed up scoring
    for (const key in this.ngrams) {
      this.ngrams[key] = Math.log10(this.ngrams[key] / this.total);
    }
  }

  score(text: string): number {
    const normalized = normalize(text);
    let score = 0;
    for (let i = 0; i < normalized.length - this.n + 1; i++) {
      const ngram = normalized.substring(i, i + this.n);
      // Use explicit property check as requested
      if (ngram in this.ngrams) {
        score += this.ngrams[ngram];
      } else {
        score += this.floor;
      }
    }
    return score;
  }
}

// Singleton instances for common n-gram types
let quadgramScorer: Scorer | null = null;

export function getQuadgramScorer(): Scorer {
  if (!quadgramScorer) {
    quadgramScorer = new Scorer('quadgrams');
  }
  return quadgramScorer;
}
