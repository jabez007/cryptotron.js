import { decrypt } from './decrypt.ts';
import { getQuadgramScorer } from '../../utils/cryptanalysis.ts';

const VALID_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

/**
 * Cracks the Affine cipher by brute-forcing all possible valid (a, b) pairs.
 * 
 * @param {string} ciphertext - The text to crack
 * @returns {Object} The best alpha, beta and decrypted text
 */
export function crack(ciphertext: string) {
  const scorer = getQuadgramScorer();
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
