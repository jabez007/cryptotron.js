import { decrypt } from './decrypt.ts';
import { getScorer, normalize } from '../../utils/cryptanalysis.ts';
import { CrackResult } from '@/types.ts';

/**
 * Cracks the Caesar cipher by brute-forcing all 26 possible shifts.
 * 
 * Uses n-gram frequency analysis to score each possible decryption
 * and returns the one with the highest score.
 * 
 * @param {string} ciphertext - The text to crack
 * @returns {CrackResult<{ shift: number }>} The recovered key (shift) and decrypted plaintext
 */
export function crack(ciphertext: string): CrackResult<{ shift: number }> {
  const normalized = normalize(ciphertext);
  
  // Guard against empty normalized ciphertext
  if (normalized.length === 0) {
    return {
      key: { shift: 0 },
      plaintext: ciphertext,
    };
  }

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
