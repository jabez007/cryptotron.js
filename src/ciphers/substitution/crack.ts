import { decrypt } from './decrypt.ts';
import { getScorer, normalize, getSafeRandom } from '../../utils/cryptanalysis.ts';
import { CrackResult } from '@/types.ts';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Cracks the Simple Substitution cipher using hill-climbing frequency analysis.
 * 
 * The algorithm starts with a random alphabet and iteratively swaps two
 * characters to find an alphabet with a higher n-gram score.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {Function} rng - Optional random number generator for shuffling/swapping
 * @returns {CrackResult<{ cipherAlphabet: string }>} The recovered cipher alphabet and decrypted plaintext
 */
export function crack(
  ciphertext: string, 
  rng: () => number = Math.random
): CrackResult<{ cipherAlphabet: string }> {
  const normalized = normalize(ciphertext);
  
  // Guard against empty normalized ciphertext
  if (normalized.length === 0) {
    return {
      key: { cipherAlphabet: alphabet },
      plaintext: ciphertext,
    };
  }

  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  // Create a mutable copy of the alphabet
  const currentAlphabet = alphabet.split('');
  
  // Initial shuffle using Fisher-Yates
  for (let i = 25; i > 0; i--) {
    const j = Math.floor(getSafeRandom(rng) * (i + 1));
    [currentAlphabet[i], currentAlphabet[j]] = [currentAlphabet[j], currentAlphabet[i]];
  }

  let bestAlphabet = currentAlphabet.join('');
  let bestPlaintext = decrypt({ cipherAlphabet: bestAlphabet })(ciphertext);
  let bestScore = scorer.score(bestPlaintext);

  let iterationsWithoutImprovement = 0;
  const maxIterations = 1000;

  const alphabetArr = bestAlphabet.split('');

  while (iterationsWithoutImprovement < maxIterations) {
    const i = Math.floor(getSafeRandom(rng) * 26);
    const j = Math.floor(getSafeRandom(rng) * 26);
    
    // Swap two characters in the cipher alphabet
    [alphabetArr[i], alphabetArr[j]] = [alphabetArr[j], alphabetArr[i]];
    
    const testAlphabet = alphabetArr.join('');
    const plaintext = decrypt({ cipherAlphabet: testAlphabet })(ciphertext);
    const score = scorer.score(plaintext);

    if (score > bestScore) {
      bestScore = score;
      bestAlphabet = testAlphabet;
      bestPlaintext = plaintext;
      iterationsWithoutImprovement = 0;
    } else {
      // Revert the swap
      [alphabetArr[i], alphabetArr[j]] = [alphabetArr[j], alphabetArr[i]];
      iterationsWithoutImprovement++;
    }
  }

  return {
    key: { cipherAlphabet: bestAlphabet },
    plaintext: bestPlaintext,
  };
}
