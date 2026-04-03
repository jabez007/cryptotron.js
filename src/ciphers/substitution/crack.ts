import { decrypt } from './decrypt.ts';
import { getScorer, normalize } from '../../utils/cryptanalysis.ts';
import { alphaLower } from '../../utils/index.ts';

const ALPHA_UPPER = alphaLower.toUpperCase();

/**
 * Cracks the Simple Substitution cipher using hill-climbing.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} restarts - Number of times to restart with a random key (default 20)
 * @param {number} iterations - Number of swaps per restart (default 20000)
 * @returns {Object} The best cipher alphabet and decrypted text
 */
export function crack(ciphertext: string, restarts: number = 20, iterations: number = 20000) {
  const normalizedCipher = normalize(ciphertext);
  // Adaptive scorer
  const scorer = getScorer(Math.min(4, normalizedCipher.length));
  
  let bestAlphabet = ALPHA_UPPER;
  let bestOverallScore = -Infinity;

  const shuffle = (str: string) => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
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
        result += ALPHA_UPPER[pos];
      }
    }
    return result;
  };

  for (let r = 0; r < restarts; r++) {
    let currentAlphabet = shuffle(ALPHA_UPPER);
    let currentDecrypted = decryptFast(normalizedCipher, currentAlphabet);
    let currentScore = scorer.score(currentDecrypted);

    for (let i = 0; i < iterations; i++) {
      const a = Math.floor(Math.random() * 26);
      let b = Math.floor(Math.random() * 26);
      while (a === b) b = Math.floor(Math.random() * 26);

      const alphabetArr = currentAlphabet.split('');
      [alphabetArr[a], alphabetArr[b]] = [alphabetArr[b], alphabetArr[a]];
      const nextAlphabet = alphabetArr.join('');
      
      const nextDecrypted = decryptFast(normalizedCipher, nextAlphabet);
      const nextScore = scorer.score(nextDecrypted);

      if (nextScore > currentScore) {
        currentScore = nextScore;
        currentAlphabet = nextAlphabet;
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
