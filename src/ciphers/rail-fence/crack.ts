import { decrypt } from './decrypt.ts';
import { getScorer, normalize } from '@utils';
import type { CrackResult } from '@types';

/**
 * Cracks the Rail-Fence cipher by brute-forcing the number of rails.
 * 
 * It iterates through possible rail counts (from 2 up to a reasonable limit),
 * decrypts the ciphertext, and scores the result using n-gram frequency analysis.
 * 
 * @param {string} ciphertext - The text to crack
 * @returns {CrackResult<{ rails: number }>} The recovered key (rails) and decrypted plaintext
 */
export function crack(ciphertext: string): CrackResult<{ rails: number }> {
  const normalized = normalize(ciphertext);
  
  // Guard against empty or short normalized ciphertext
  if (normalized.length <= 1) {
    return {
      key: { rails: 2 },
      plaintext: ciphertext,
    };
  }

  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  let bestRails = 2;
  let bestScore = -Infinity;
  let bestPlaintext = '';

  // Iterate from 2 rails up to half the ciphertext length (max 20)
  const maxRails = Math.min(Math.floor(ciphertext.length / 2) + 1, 20);

  for (let rails = 2; rails <= maxRails; rails++) {
    const plaintext = decrypt({ rails })(ciphertext);
    const score = scorer.score(plaintext);
    
    if (score > bestScore) {
      bestScore = score;
      bestRails = rails;
      bestPlaintext = plaintext;
    }
  }

  return {
    key: { rails: bestRails },
    plaintext: bestPlaintext,
  };
}
