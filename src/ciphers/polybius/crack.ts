import { getScorer, normalize } from '../../utils/cryptanalysis.ts';
import { alphaLower } from '../../utils/index.ts';

/**
 * Cracks the Polybius Square cipher.
 * Assumes default cipherChars "12345" and that I/J share a cell.
 * 
 * @param {string} ciphertext - The text to crack
 * @returns {Object} The best keyword and decrypted text
 */
export function crack(ciphertext: string) {
  const normalized = normalize(ciphertext);
  // Polybius output length is half of ciphertext (pairs), but let's be safe
  const scorer = getScorer(Math.min(4, ciphertext.replace(/[^1-5]/g, '').length / 2));
  
  // Polybius is essentially a substitution cipher where each letter is replaced by two digits.
  // If we assume cipherChars are "12345", we can recover the 5x5 grid.
  
  const alphabet25 = alphaLower.replace('j', '');
  let bestGrid = alphabet25;
  let bestOverallScore = -Infinity;

  const shuffle = (str: string) => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
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

  // Strip non-digits for hill climbing
  const digitsOnly = ciphertext.replace(/[^1-5]/g, '');

  for (let r = 0; r < 10; r++) {
    let currentGrid = shuffle(alphabet25);
    let currentDecrypted = decryptWithGrid(digitsOnly, currentGrid);
    let currentScore = scorer.score(currentDecrypted);

    for (let i = 0; i < 10000; i++) {
      const a = Math.floor(Math.random() * 25);
      let b = Math.floor(Math.random() * 25);
      while (a === b) b = Math.floor(Math.random() * 25);

      const gridArr = currentGrid.split('');
      [gridArr[a], gridArr[b]] = [gridArr[b], gridArr[a]];
      const nextGrid = gridArr.join('');
      
      const nextDecrypted = decryptWithGrid(digitsOnly, nextGrid);
      const nextScore = scorer.score(nextDecrypted);

      if (nextScore > currentScore) {
        currentScore = nextScore;
        currentGrid = nextGrid;
      }
    }

    if (currentScore > bestOverallScore) {
      bestOverallScore = currentScore;
      bestGrid = currentGrid;
    }
  }

  return {
    key: { grid: bestGrid },
    plaintext: decryptWithGrid(ciphertext, bestGrid),
  };
}
