import { decrypt } from './decrypt.ts';
import { getScorer, normalize, getSafeRandom } from '../../utils/cryptanalysis.ts';
import { alphaLower } from '../../utils/index.ts';
import { CrackResult } from '@/types.ts';

/**
 * Detects the most likely 5 characters used as coordinates in a Polybius square.
 * 
 * @param {string} ciphertext - The text to analyze
 * @returns {string} Exactly 5 unique coordinate characters
 */
function detectCipherChars(ciphertext: string): string {
  const counts: { [char: string]: number } = {};
  
  // Only count characters that appear in valid pairs to avoid scoring noise/separators
  let lastCoord: string | null = null;
  for (const char of ciphertext) {
    if (/[A-Za-z0-9]/.test(char)) {
      if (lastCoord === null) {
        lastCoord = char;
      } else {
        counts[lastCoord] = (counts[lastCoord] || 0) + 1;
        counts[char] = (counts[char] || 0) + 1;
        lastCoord = null;
      }
    }
  }

  const sortedChars = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([char]) => char);
  
  const result = sortedChars.slice(0, 5).join('');
  return result.length === 5 ? result : '12345';
}

/**
 * Optimized decryption for hill-climbing that avoids redundant square building.
 */
function decryptWithGrid(ciphertext: string, grid: string[], cipherChars: string): string {
  let outputText = '';
  let i = 0;
  while (i < ciphertext.length) {
    const char1 = ciphertext.charAt(i);
    const row = cipherChars.indexOf(char1);

    if (row !== -1) {
      let j = i + 1;
      while (j < ciphertext.length) {
        const char2 = ciphertext.charAt(j);
        const col = cipherChars.indexOf(char2);
        if (col !== -1) {
          outputText += grid[row * 5 + col];
          i = j + 1;
          break;
        }
        j++;
      }
      if (j >= ciphertext.length) {
        outputText += char1;
        i++;
      }
    } else {
      outputText += char1;
      i++;
    }
  }
  return outputText;
}

/**
 * Cracks the Polybius cipher using hill-climbing frequency analysis.
 * 
 * Hill-climbing starts with a random 25-character grid and iteratively
 * swaps pairs of characters to find a grid with a higher n-gram score.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {Function} rng - Optional random number generator for shuffling/swapping
 * @returns {CrackResult<{ keyword: string; cipherChars: string }>} The recovered grid and decrypted plaintext
 */
export function crack(ciphertext: string, rng: () => number = Math.random): CrackResult<{ keyword: string; cipherChars: string }> {
  const normalized = normalize(ciphertext);
  
  // Guard against empty normalized ciphertext
  if (normalized.length === 0) {
    return {
      key: { keyword: 'abcde fghik lmnop qrstu vwxyz'.replace(/ /g, ''), cipherChars: '12345' },
      plaintext: ciphertext,
    };
  }

  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length / 2)));
  const cipherChars = detectCipherChars(ciphertext);
  
  const alphabet = alphaLower.replace('j', '').split('');
  
  // Shuffle alphabet to create initial grid
  for (let i = alphabet.length - 1; i > 0; i--) {
    const j = Math.floor(getSafeRandom(rng) * (i + 1));
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }

  let bestGrid = [...alphabet];
  let bestPlaintext = decryptWithGrid(ciphertext, bestGrid, cipherChars);
  let bestScore = scorer.score(bestPlaintext);

  let iterationsWithoutImprovement = 0;
  const maxIterations = 2000;

  while (iterationsWithoutImprovement < maxIterations) {
    const i = Math.floor(getSafeRandom(rng) * 25);
    const j = Math.floor(getSafeRandom(rng) * 25);
    
    // Swap two characters in the grid
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
    
    const plaintext = decryptWithGrid(ciphertext, alphabet, cipherChars);
    const score = scorer.score(plaintext);

    if (score > bestScore) {
      bestScore = score;
      bestGrid = [...alphabet];
      bestPlaintext = plaintext;
      iterationsWithoutImprovement = 0;
    } else {
      // Revert swap
      [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
      iterationsWithoutImprovement++;
    }
  }

  return {
    key: { 
      keyword: bestGrid.join(''), 
      cipherChars 
    },
    plaintext: bestPlaintext,
  };
}
