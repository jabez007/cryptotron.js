import { decrypt } from './decrypt.ts';
import { getScorer, normalize } from '../../utils/cryptanalysis.ts';
import { alphaLower } from '../../utils/index.ts';

const ALPHA_UPPER = alphaLower.toUpperCase();

/**
 * Cracks the Simple Substitution cipher using hill-climbing.
 * 
 * Uses n-gram frequency analysis to iteratively improve a random cipher alphabet.
 * Swaps two characters in the alphabet and keeps the swap if it improves the score.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} restarts - Number of times to restart with a random key (default 20)
 * @param {number} iterations - Number of swaps per restart (default 20000)
 * @param {Function} [rng] - Optional random number generator (default Math.random)
 * @returns {Object} The recovered key (cipherAlphabet) and decrypted plaintext
 */
export function crack(
  ciphertext: string, 
  restarts: number = 20, 
  iterations: number = 20000,
  rng: () => number = Math.random
) {
  // Validate numeric inputs up front as requested
  if (!Number.isInteger(restarts) || restarts <= 0) {
    throw new RangeError(`Invalid value for restarts: ${restarts}. Must be a positive integer.`);
  }
  if (!Number.isInteger(iterations) || iterations <= 0) {
    throw new RangeError(`Invalid value for iterations: ${iterations}. Must be a positive integer.`);
  }

  const normalizedCipher = normalize(ciphertext);
  
  // Short-circuit for empty normalized ciphertext
  if (normalizedCipher === "") {
    return {
      key: { cipherAlphabet: ALPHA_UPPER },
      plaintext: ciphertext,
    };
  }

  // Guard against empty normalized ciphertext and clamp n to 1..4 range
  const scorer = getScorer(Math.max(1, Math.min(4, normalizedCipher.length)));
  
  let bestAlphabet = ALPHA_UPPER;
  let bestOverallScore = -Infinity;

  const getSafeRandom = (random: () => number): number => {
    const val = Number(random());
    if (!Number.isFinite(val)) return Math.random();
    return Math.max(0, Math.min(1 - Number.EPSILON, val));
  };

  const shuffle = (str: string, random: () => number) => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const val = getSafeRandom(random);
      const j = Math.floor(val * (i + 1));
      
      // Defensive check for j index
      if (Number.isInteger(j) && j >= 0 && j <= i) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
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
        result += ALPHA_UPPER[pos];
      }
    }
    return result;
  };

  for (let r = 0; r < restarts; r++) {
    let currentAlphabet = shuffle(ALPHA_UPPER, rng);
    const alphabetArr = currentAlphabet.split('');
    let currentDecrypted = decryptFast(normalizedCipher, currentAlphabet);
    let currentScore = scorer.score(currentDecrypted);

    for (let i = 0; i < iterations; i++) {
      const valA = getSafeRandom(rng);
      const a = Math.floor(valA * 26);
      
      const valB = getSafeRandom(rng);
      let b = Math.floor(valB * 26);
      
      // Ensure a !== b
      if (a === b) {
        b = (a + 1) % 26;
      }

      // Perform in-place swap to reduce allocations as requested
      [alphabetArr[a], alphabetArr[b]] = [alphabetArr[b], alphabetArr[a]];
      const nextAlphabet = alphabetArr.join('');
      
      const nextDecrypted = decryptFast(normalizedCipher, nextAlphabet);
      const nextScore = scorer.score(nextDecrypted);

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

  // Use the library's decrypt for the final result to preserve formatting
  const finalDecrypt = decrypt({ cipherAlphabet: bestAlphabet });
  return {
    key: { cipherAlphabet: bestAlphabet },
    plaintext: finalDecrypt(ciphertext),
  };
}
