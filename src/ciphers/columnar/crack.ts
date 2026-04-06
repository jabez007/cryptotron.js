import { decrypt } from './decrypt.ts';
import { getScorer, normalize, getSafeRandom } from '@utils';
import type { CrackResult } from '@types';

/**
 * Generates all permutations of an array.
 * 
 * @param {number[]} arr - The array to permute
 * @returns {number[][]} All permutations
 */
function getPermutations(arr: number[]): number[][] {
  const result: number[][] = [];

  function permute(current: number[], remaining: number[]) {
    if (remaining.length === 0) {
      result.push(current);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      permute([...current, remaining[i]], [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
    }
  }

  permute([], arr);
  return result;
}

/**
 * Converts a column order array into a representative keyword string.
 * 
 * @param {number[]} order - The column order
 * @param {number} width - The column width
 * @returns {string} The representative keyword
 */
function orderToKeyword(order: number[], width: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const kw = Array(width).fill('');
  const sortedAlphabet = alphabet.split('').slice(0, width);
  for (let i = 0; i < width; i++) {
    kw[order[i]] = sortedAlphabet[i];
  }
  return kw.join('');
}

/**
 * Cracks the Columnar Transposition cipher.
 * 
 * It iterates through possible column widths and uses either an exhaustive search
 * (for small widths) or a hill-climbing algorithm (for larger widths) to find
 * the best column order based on n-gram frequency analysis.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {Object} [options] - Cracking options
 * @param {number} [options.maxWidth=10] - Maximum column width to test
 * @param {Function} [options.rng=Math.random] - Optional random number generator
 * @returns {CrackResult<{ keyword: string }>} The recovered key (dummy keyword) and decrypted plaintext
 */
export function crack(
  ciphertext: string, 
  options: { maxWidth?: number; rng?: () => number } = {}
): CrackResult<{ keyword: string }> {
  const { maxWidth: userMaxWidth = 10, rng = Math.random } = options;
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

  // Validate and cap maxWidth
  if (userMaxWidth !== undefined && (!Number.isFinite(userMaxWidth) || Math.floor(userMaxWidth) < 1)) {
    throw new RangeError(`maxWidth must be a finite positive integer >= 1, got ${userMaxWidth}`);
  }
  const maxWidth = Math.min(Math.floor(userMaxWidth), normalized.length, 26);

  for (let width = 1; width <= maxWidth; width++) {
    let bestWidthScore = -Infinity;
    let bestWidthOrder: number[] = [];
    let bestWidthPlaintext = '';

    const decryptWithOrder = (order: number[]) => {
      return decrypt({ keyword: orderToKeyword(order, width) })(ciphertext);
    };

    if (width <= 5) {
      // Exhaustive search for small widths
      const permutations = getPermutations(Array.from({ length: width }, (_, i) => i));
      for (const order of permutations) {
        const plaintext = decryptWithOrder(order);
        const score = scorer.score(plaintext);
        if (score > bestWidthScore) {
          bestWidthScore = score;
          bestWidthOrder = order;
          bestWidthPlaintext = plaintext;
        }
      }
    } else {
      // Hill climbing with multiple restarts for larger widths
      const restarts = 40;
      
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

          if (iterationsWithoutImprovement >= maxIterationsWithoutImprovement) break;
        }

        if (currentScore > bestWidthScore) {
          bestWidthScore = currentScore;
          bestWidthOrder = currentOrder;
          bestWidthPlaintext = currentPlaintext;
        }
      }
    }

    if (bestWidthScore > bestGlobalScore) {
      bestGlobalScore = bestWidthScore;
      bestGlobalOrder = bestWidthOrder;
      bestGlobalPlaintext = bestWidthPlaintext;
    }
  }

  return {
    key: { keyword: orderToKeyword(bestGlobalOrder, bestGlobalOrder.length) },
    plaintext: bestGlobalPlaintext,
  };
}
