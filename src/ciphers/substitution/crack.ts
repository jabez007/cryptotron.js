import { decrypt } from './decrypt.ts';
import { getScorer, normalize, getSafeRandom } from '@utils';
import type { CrackResult } from '@types';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Cracks the Simple Substitution cipher using hill-climbing frequency analysis.
 * 
 * Uses n-gram frequency analysis to iteratively improve a random cipher alphabet.
 * Swaps two characters in the alphabet and keeps the swap if it improves the score.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} restarts - Number of times to restart with a random key (default 20)
 * @param {number} iterations - Number of swaps per restart (default 20000)
 * @param {Function} rng - Optional random number generator (default Math.random)
 * @returns {CrackResult<{ cipherAlphabet: string }>} The recovered cipher alphabet and decrypted plaintext
 */
export function crack(
  ciphertext: string, 
  restarts: number = 20, 
  iterations: number = 20000,
  rng: () => number = Math.random
): CrackResult<{ cipherAlphabet: string }> {
  // Validate numeric inputs
  if (!Number.isInteger(restarts) || restarts <= 0) {
    throw new RangeError(`Invalid value for restarts: ${restarts}. Must be a positive integer.`);
  }
  if (!Number.isInteger(iterations) || iterations <= 0) {
    throw new RangeError(`Invalid value for iterations: ${iterations}. Must be a positive integer.`);
  }

  const normalized = normalize(ciphertext);
  
  // Guard against empty normalized ciphertext
  if (normalized.length === 0) {
    return {
      key: { cipherAlphabet: alphabet },
      plaintext: ciphertext,
    };
  }

  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  let bestAlphabet = alphabet;
  let bestOverallScore = -Infinity;

  const shuffle = (str: string, random: () => number) => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const val = getSafeRandom(random);
      const j = Math.floor(val * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  const decryptFast = (text: string, cipherAlpha: string) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const pos = cipherAlpha.indexOf(char);
      if (pos === -1) {
        result += char;
      } else {
        result += alphabet[pos];
      }
    }
    return result;
  };

  for (let r = 0; r < restarts; r++) {
    let currentAlphabet = shuffle(alphabet, rng);
    const alphabetArr = currentAlphabet.split('');
    let currentScore = scorer.score(decryptFast(normalized, currentAlphabet));

    for (let i = 0; i < iterations; i++) {
      const a = Math.floor(getSafeRandom(rng) * 26);
      let b = Math.floor(getSafeRandom(rng) * 26);
      if (a === b) b = (a + 1) % 26;

      // Swap in place
      [alphabetArr[a], alphabetArr[b]] = [alphabetArr[b], alphabetArr[a]];
      const nextAlphabet = alphabetArr.join('');
      
      const nextScore = scorer.score(decryptFast(normalized, nextAlphabet));

      if (nextScore > currentScore) {
        currentScore = nextScore;
        currentAlphabet = nextAlphabet;
      } else {
        // Swap back to revert
        [alphabetArr[a], alphabetArr[b]] = [alphabetArr[b], alphabetArr[a]];
      }
    }

    if (currentScore > bestOverallScore) {
      bestOverallScore = currentScore;
      bestAlphabet = currentAlphabet;
    }
  }

  return {
    key: { cipherAlphabet: bestAlphabet },
    plaintext: decrypt({ cipherAlphabet: bestAlphabet })(ciphertext),
  };
}
