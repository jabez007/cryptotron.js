import { decrypt } from './decrypt.ts';
import { getScorer, normalize } from '@utils';
import type { CrackResult } from '@types';

/**
 * Cracks the Scytale cipher by brute-forcing the rod diameter.
 *
 * It iterates through possible diameters (from 2 up to a reasonable limit),
 * decrypts the ciphertext, and scores the result using n-gram frequency analysis.
 *
 * @param {string} ciphertext - The text to crack
 * @returns {CrackResult<{ diameter: number }>} The recovered key (diameter) and decrypted plaintext
 */
export function crack(ciphertext: string): CrackResult<{ diameter: number }> {
  const normalized = normalize(ciphertext);

  // Guard against empty or short normalized ciphertext
  if (normalized.length <= 1) {
    return {
      key: { diameter: 2 },
      plaintext: ciphertext,
    };
  }

  // Use quadgrams if possible (best for transposition ciphers)
  // Fall back to bigrams if higher-order n-grams are not loaded (lite builds)
  let scorer;
  try {
    scorer = getScorer(Math.min(4, normalized.length));
  } catch {
    scorer = getScorer(2);
  }

  let bestDiameter = 2;
  let bestScore = -Infinity;
  let bestPlaintext = '';

  // Iterate from 2 up to the ciphertext length (max 50)
  const maxDiameter = Math.min(ciphertext.length, 50);

  for (let diameter = 2; diameter <= maxDiameter; diameter++) {
    const plaintext = decrypt({ diameter })(ciphertext);
    const score = scorer.score(plaintext);

    if (score > bestScore) {
      bestScore = score;
      bestDiameter = diameter;
      bestPlaintext = plaintext;
    }
  }

  return {
    key: { diameter: bestDiameter },
    plaintext: bestPlaintext,
  };
}
