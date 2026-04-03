import { getScorer } from '../../utils/cryptanalysis.ts';
import { alphaLower } from '../../utils/index.ts';

/**
 * Cracks the Polybius Square cipher.
 * 
 * Uses a hill-climbing algorithm to recover the 5x5 grid.
 * Assumes default cipherChars "12345" and that I/J share a cell.
 * 
 * @param {string} ciphertext - The text to crack
 * @returns {Object} The recovered key (grid as keyword) and decrypted plaintext
 */
export function crack(ciphertext: string) {
  if (typeof ciphertext !== 'string') {
    throw new TypeError(`Expected ciphertext to be a string, received ${typeof ciphertext}`);
  }
  // Hoist digits-only normalization as requested
  const digitsOnly = ciphertext.replace(/[^1-5]/g, '');
  
  // Polybius output length is half of ciphertext (pairs), use synced digitsOnly length
  // Ensure n is at least 1 for getScorer
  const scorer = getScorer(Math.max(1, Math.min(4, Math.floor(digitsOnly.length / 2))));
  
  // Polybius is essentially a substitution cipher where each letter is replaced by two digits.
  // If we assume cipherChars are "12345", we can recover the 5x5 grid.
  
  const alphabet25 = alphaLower.replace('j', '');
  let bestGridArr = alphabet25.split('');
  let bestOverallScore = -Infinity;

  const shuffle = (str: string) => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const decryptWithGrid = (text: string, grid: string) => {
    let result = '';
    for (let i = 0; i < text.length; i += 2) {
      const row = parseInt(text[i]) - 1;
      const col = parseInt(text[i+1]) - 1;
      if (isNaN(row) || isNaN(col) || row < 0 || row > 4 || col < 0 || col > 4) {
        // In decryptWithGrid: when a non-digit (or an invalid pair) is encountered
        // we append the single character and decrement i so the loop's i += 2 yields a net
        // advance of 1 (effectively consuming one char instead of a pair).
        result += text[i];
        i--; 
        continue;
      }
      result += grid[row * 5 + col];
    }
    return result;
  };

  for (let r = 0; r < 10; r++) {
    const currentGridArr = shuffle(alphabet25);
    let currentScore = scorer.score(decryptWithGrid(digitsOnly, currentGridArr.join('')));

    for (let i = 0; i < 10000; i++) {
      const a = Math.floor(Math.random() * 25);
      let b = Math.floor(Math.random() * 25);
      while (a === b) b = Math.floor(Math.random() * 25);

      // Perform in-place swap to reduce allocations as requested
      [currentGridArr[a], currentGridArr[b]] = [currentGridArr[b], currentGridArr[a]];
      const nextGrid = currentGridArr.join('');
      
      const nextDecrypted = decryptWithGrid(digitsOnly, nextGrid);
      const nextScore = scorer.score(nextDecrypted);

      if (nextScore > currentScore) {
        currentScore = nextScore;
      } else {
        // Swap back to revert
        [currentGridArr[a], currentGridArr[b]] = [currentGridArr[b], currentGridArr[a]];
      }
    }

    if (currentScore > bestOverallScore) {
      bestOverallScore = currentScore;
      bestGridArr = [...currentGridArr];
    }
  }

  const bestGrid = bestGridArr.join('');
  // Translate bestGrid into the public Polybius key shape expected by decrypt.ts
  return {
    key: { keyword: bestGrid, cipherChars: "12345" },
    plaintext: decryptWithGrid(ciphertext, bestGrid),
  };
}
