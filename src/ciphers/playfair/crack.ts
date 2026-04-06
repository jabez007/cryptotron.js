import { decrypt } from './decrypt.ts';
import { getScorer, getSafeRandom, normalize, alphaLower } from '@utils';
import type { CrackResult } from '@types';

/**
 * Cracks the Playfair cipher using a hill-climbing algorithm.
 * 
 * It starts with a random 5x5 grid and iteratively swaps characters
 * to maximize the n-gram score of the decrypted text.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {Function} [rng] - Optional random number generator
 * @returns {CrackResult<{ keyword: string }>} The recovered key (grid as keyword) and decrypted plaintext
 */
export function crack(ciphertext: string, rng: () => number = Math.random): CrackResult<{ keyword: string }> {
  const normalized = normalize(ciphertext);
  
  if (normalized.length === 0) {
    return {
      key: { keyword: '' },
      plaintext: ciphertext,
    };
  }

  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  const alphabet25 = alphaLower.replace('j', '');
  
  let bestGrid = alphabet25;
  let bestOverallScore = -Infinity;

  const shuffle = (str: string): string => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(getSafeRandom(rng) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  // Multiple restarts to avoid local maxima
  for (let r = 0; r < 5; r++) {
    let currentGrid = shuffle(alphabet25);
    let currentPlaintext = decrypt({ keyword: currentGrid })(ciphertext);
    let currentScore = scorer.score(currentPlaintext);

    for (let i = 0; i < 5000; i++) {
      const a = Math.floor(getSafeRandom(rng) * 25);
      const b = Math.floor(getSafeRandom(rng) * 25);
      if (a === b) continue;

      const gridArr = currentGrid.split('');
      [gridArr[a], gridArr[b]] = [gridArr[b], gridArr[a]];
      const nextGrid = gridArr.join('');
      
      const nextPlaintext = decrypt({ keyword: nextGrid })(ciphertext);
      const nextScore = scorer.score(nextPlaintext);

      if (nextScore > currentScore) {
        currentScore = nextScore;
        currentGrid = nextGrid;
        currentPlaintext = nextPlaintext;
      }
    }

    if (currentScore > bestOverallScore) {
      bestOverallScore = currentScore;
      bestGrid = currentGrid;
    }
  }

  return {
    key: { keyword: bestGrid },
    plaintext: decrypt({ keyword: bestGrid })(ciphertext),
  };
}
