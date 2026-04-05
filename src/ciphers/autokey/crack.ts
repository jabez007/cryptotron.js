import { decrypt } from './decrypt.ts';
import { getScorer, normalize, scoreMonograms } from '../../utils/cryptanalysis.ts';
import { CrackResult } from '@/types.ts';

/**
 * Cracks the Autokey cipher using a two-stage frequency analysis.
 * 
 * Stage 1: Exhaustively brute-force all possible single-character primers (A-Z)
 * to find the most likely starting point for the key.
 * 
 * Stage 2: Attempt to expand the best primer up to `maxPrimerLength` characters
 * using hill-climbing to further refine the recovered key.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxPrimerLength - Maximum length of the primer to search for
 * @returns {CrackResult<{ primer: string }>} The recovered primer and decrypted plaintext
 */
export function crack(ciphertext: string, maxPrimerLength: number = 15): CrackResult<{ primer: string }> {
  const normalized = normalize(ciphertext);
  
  // Guard against empty normalized ciphertext
  if (normalized.length === 0) {
    return {
      key: { primer: 'A' },
      plaintext: ciphertext,
    };
  }

  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let bestPrimer = 'A';
  let bestScore = -Infinity;

  // Stage 1: Brute-force single letter primers
  for (const char of alphabet) {
    const plaintext = decrypt({ primer: char })(ciphertext);
    const score = scorer.score(plaintext);
    if (score > bestScore) {
      bestScore = score;
      bestPrimer = char;
    }
  }

  // Stage 2: Hill-climbing to expand primer length
  let currentPrimer = bestPrimer;
  for (let len = 2; len <= maxPrimerLength; len++) {
    let improved = false;
    for (const char of alphabet) {
      const testPrimer = currentPrimer + char;
      const plaintext = decrypt({ primer: testPrimer })(ciphertext);
      const score = scorer.score(plaintext);
      if (score > bestScore) {
        bestScore = score;
        currentPrimer = testPrimer;
        improved = true;
      }
    }
    if (!improved) break;
  }

  return {
    key: { primer: currentPrimer },
    plaintext: decrypt({ primer: currentPrimer })(ciphertext),
  };
}
