import { decrypt } from './decrypt.ts';
import { getScorer, normalize } from '../../utils/cryptanalysis.ts';

/**
 * Cracks the Caesar cipher by brute-forcing all possible shifts.
 * 
 * Uses n-gram frequency analysis to score all 26 possible decryptions
 * and returns the one with the highest score.
 * 
 * @param {string} ciphertext - The text to crack
 * @returns {Object} The recovered key (shift) and decrypted plaintext
 */
export function crack(ciphertext: string) {
  const normalized = normalize(ciphertext);
  // Clamping n to 1..4 range to avoid passing 0 to getScorer
  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  let bestShift = 0;
  let bestScore = -Infinity;
  let bestPlaintext = '';

  for (let shift = 0; shift < 26; shift++) {
    const plaintext = decrypt({ shift })(ciphertext);
    const score = scorer.score(plaintext);
    
    if (score > bestScore) {
      bestScore = score;
      bestShift = shift;
      bestPlaintext = plaintext;
    }
  }

  return {
    key: { shift: bestShift },
    plaintext: bestPlaintext,
  };
}
