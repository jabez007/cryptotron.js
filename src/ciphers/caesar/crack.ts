import { decrypt } from './decrypt.ts';
import { getQuadgramScorer } from '../../utils/cryptanalysis.ts';

/**
 * Cracks the Caesar cipher by brute-forcing all possible shifts.
 * 
 * @param {string} ciphertext - The text to crack
 * @returns {Object} The best shift and decrypted text
 */
export function crack(ciphertext: string) {
  const scorer = getQuadgramScorer();
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
