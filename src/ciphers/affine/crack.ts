import { decrypt } from './decrypt.ts';
import { getScorer, normalize } from '../../utils/cryptanalysis.ts';
import { CrackResult } from '@/types.ts';

const VALID_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

/**
 * Cracks the Affine cipher by brute-forcing all possible valid (a, b) pairs.
 * 
 * Uses n-gram frequency analysis to score all 312 possible decryptions
 * and returns the one with the highest score.
 * 
 * @param {string} ciphertext - The text to crack
 * @returns {CrackResult<{ alpha: number, beta: number }>} The recovered key (alpha and beta) and decrypted plaintext
 */
export function crack(ciphertext: string): CrackResult<{ alpha: number; beta: number }> {
  const normalized = normalize(ciphertext);
  
  // Guard against empty normalized ciphertext
  if (normalized.length === 0) {
    return {
      key: { alpha: 1, beta: 0 },
      plaintext: ciphertext,
    };
  }

  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  let bestA = 1;
  let bestB = 0;
  let bestScore = -Infinity;
  let bestPlaintext = '';

  for (const a of VALID_A) {
    for (let b = 0; b < 26; b++) {
      const plaintext = decrypt({ alpha: a, beta: b })(ciphertext);
      const score = scorer.score(plaintext);
      
      if (score > bestScore) {
        bestScore = score;
        bestA = a;
        bestB = b;
        bestPlaintext = plaintext;
      }
    }
  }

  return {
    key: { alpha: bestA, beta: bestB },
    plaintext: bestPlaintext,
  };
}
