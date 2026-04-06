import { decrypt } from './decrypt.ts';
import { getScorer, normalize, getSafeRandom } from '@utils';
import type { CrackResult } from '@types';

/**
 * Cracks the Columnar Transposition cipher.
 * 
 * It iterates through possible column widths and uses a hill-climbing
 * algorithm to find the best column order for each width based on
 * n-gram frequency analysis.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {Function} [rng] - Optional random number generator
 * @returns {CrackResult<{ keyword: string }>} The recovered key (dummy keyword) and decrypted plaintext
 */
export function crack(ciphertext: string, rng: () => number = Math.random): CrackResult<{ keyword: string }> {
  const normalized = normalize(ciphertext);
  
  if (normalized.length <= 1) {
    return {
      key: { keyword: 'A' },
      plaintext: ciphertext,
    };
  }

  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  let bestGlobalScore = -Infinity;
  let bestGlobalOrder: number[] = [0];
  let bestGlobalPlaintext = ciphertext;

  // Try column widths from 2 to 10
  const maxWidth = Math.min(10, normalized.length);

  for (let width = 2; width <= maxWidth; width++) {
    let bestWidthScore = -Infinity;
    let bestWidthOrder: number[] = [];
    let bestWidthPlaintext = '';

    const decryptWithOrder = (order: number[]) => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const kw = Array(width).fill('');
      const sortedAlphabet = alphabet.split('').slice(0, width);
      for (let i = 0; i < width; i++) {
        kw[order[i]] = sortedAlphabet[i];
      }
      return decrypt({ keyword: kw.join('') })(ciphertext);
    };

    // Multiple restarts for each width to avoid local maxima
    const restarts = width <= 5 ? 1 : 20;
    
    for (let r = 0; r < restarts; r++) {
      let currentOrder = Array.from({ length: width }, (_, i) => i);
      
      // Shuffle initial order
      for (let i = width - 1; i > 0; i--) {
        const j = Math.floor(getSafeRandom(rng) * (i + 1));
        [currentOrder[i], currentOrder[j]] = [currentOrder[j], currentOrder[i]];
      }

      let currentPlaintext = decryptWithOrder(currentOrder);
      let currentScore = scorer.score(currentPlaintext);

      // Hill climbing
      let iterationsWithoutImprovement = 0;
      const maxIterationsWithoutImprovement = width * width * 50;

      for (let iter = 0; iter < 5000; iter++) {
        const i = Math.floor(getSafeRandom(rng) * width);
        const j = Math.floor(getSafeRandom(rng) * width);
        if (i === j) continue;

        const nextOrder = [...currentOrder];
        [nextOrder[i], nextOrder[j]] = [nextOrder[j], nextOrder[i]];
        
        const nextPlaintext = decryptWithOrder(nextOrder);
        const nextScore = scorer.score(nextPlaintext);

        if (nextScore > currentScore) {
          currentScore = nextScore;
          currentOrder = nextOrder;
          currentPlaintext = nextPlaintext;
          iterationsWithoutImprovement = 0;
        } else {
          iterationsWithoutImprovement++;
        }

        if (iterationsWithoutImprovement > maxIterationsWithoutImprovement) break;
      }

      if (currentScore > bestWidthScore) {
        bestWidthScore = currentScore;
        bestWidthOrder = currentOrder;
        bestWidthPlaintext = currentPlaintext;
      }
    }

    if (bestWidthScore > bestGlobalScore) {
      bestGlobalScore = bestWidthScore;
      bestGlobalOrder = bestWidthOrder;
      bestGlobalPlaintext = bestWidthPlaintext;
    }
  }

  // Convert best order to a keyword
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const kw = Array(bestGlobalOrder.length).fill('');
  const sortedAlphabet = alphabet.split('').slice(0, bestGlobalOrder.length);
  for (let i = 0; i < bestGlobalOrder.length; i++) {
    kw[bestGlobalOrder[i]] = sortedAlphabet[i];
  }

  return {
    key: { keyword: kw.join('') },
    plaintext: bestGlobalPlaintext,
  };
}
