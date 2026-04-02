import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// Hack to get __dirname in both ESM and CJS
const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(eval('import.meta.url')));

export function normalize(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, '');
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
      if (this.ngrams[ngram]) {
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
