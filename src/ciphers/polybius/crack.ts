import { buildCipherSquare } from '@utils';
import { getScorer, getSafeRandom } from '../../utils/cryptanalysis.ts';
import { alphaLower } from '../../utils/index.ts';

/**
 * Detects the most likely characters used as coordinates in a Polybius Square ciphertext.
 * Only counts characters that appear in valid adjacent pairs to exclude separators.
 * 
 * @param {string} ciphertext - The text to analyze
 * @returns {string} The 5 most frequent coordinate characters, sorted alphabetically
 */
function detectCipherChars(ciphertext: string): string {
  const counts: Record<string, number> = {};
  
  // Count only characters appearing in valid adjacent pairs
  for (let i = 0; i < ciphertext.length - 1; i++) {
    const char1 = ciphertext[i];
    const char2 = ciphertext[i+1];
    
    // Polybius coordinates are typically non-whitespace
    if (/\S/.test(char1) && /\S/.test(char2)) {
      counts[char1] = (counts[char1] || 0) + 1;
      counts[char2] = (counts[char2] || 0) + 1;
      i++; // Skip to next potential pair
    }
  }
  
  let sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0])
    .sort()
    .join('');

  // Ensure we return exactly 5 characters
  if (sorted.length < 5) {
    const defaults = '12345';
    for (const d of defaults) {
      if (!sorted.includes(d)) {
        sorted += d;
      }
      if (sorted.length === 5) break;
    }
    sorted = sorted.split('').sort().join('');
  }
    
  return sorted;
}

/**
 * Cracks the Polybius Square cipher.
 * 
 * Uses a hill-climbing algorithm to recover the 5x5 grid.
 * Automatically detects the characters used as coordinates.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {Function} [rng] - Optional random number generator (default Math.random)
 * @returns {Object} The recovered key (grid as keyword) and decrypted plaintext
 */
export function crack(ciphertext: string, rng: () => number = Math.random) {
  if (typeof ciphertext !== 'string') {
    throw new TypeError(`Expected ciphertext to be a string, received ${typeof ciphertext}`);
  }

  const detectedChars = detectCipherChars(ciphertext);
  const charSet = new Set(detectedChars.split(''));

  // Compute actual adjacent valid pairs from original ciphertext
  let adjacentPairCount = 0;
  for (let i = 0; i < ciphertext.length - 1; i++) {
    if (charSet.has(ciphertext[i]) && charSet.has(ciphertext[i+1])) {
      adjacentPairCount++;
      i++; // Skip the second part of the pair
    }
  }
  
  const alphabet25 = alphaLower.replace('j', '');

  // Check for incomplete polybius pairs
  if (adjacentPairCount === 0) {
    return {
      key: { keyword: alphabet25, cipherChars: detectedChars },
      plaintext: ciphertext,
    };
  }

  // Seed getScorer with adjacentPairCount
  const scorer = getScorer(Math.max(1, Math.min(4, adjacentPairCount)));
  
  // Polybius is essentially a substitution cipher where each letter is replaced by two digits.
  // The hill-climber recovers the 5x5 grid mapping to the detectedChars.
  
  let bestGridArr = alphabet25.split('');
  let bestOverallScore = -Infinity;

  const shuffle = (str: string, random: () => number): string[] => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const val = getSafeRandom(random);
      const j = Math.floor(val * (i + 1));
      
      if (Number.isInteger(j) && j >= 0 && j <= i) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr;
  };

  const decryptWithGrid = (text: string, grid: string) => {
    const keySquare = buildCipherSquare(grid);
    let result = '';
    let i = 0;
    while (i < text.length) {
      const char = text.charAt(i);
      const row = detectedChars.indexOf(char);
      
      if (row !== -1) {
        i += 1;
        if (i >= text.length) {
          result += char;
          break;
        }
        
        const col = detectedChars.indexOf(text.charAt(i));
        if (col === -1) {
          result += char;
          // Back up to process the current non-coordinate character in next iteration
          i -= 1;
        } else {
          result += keySquare[row][col];
        }
      } else {
        result += char;
      }
      i += 1;
    }
    return result;
  };

  for (let r = 0; r < 20; r++) {
    const currentGridArr = shuffle(alphabet25, rng);
    // Use original ciphertext for search/scoring to ensure consistency
    let currentScore = scorer.score(decryptWithGrid(ciphertext, currentGridArr.join('')));

    for (let i = 0; i < 10000; i++) {
      // Pick indices a and b deterministically using safe random values
      const valA = getSafeRandom(rng);
      const a = Math.floor(valA * 25);
      
      const valB = getSafeRandom(rng);
      const b = (a + 1 + Math.floor(valB * 24)) % 25;

      // Perform in-place swap
      [currentGridArr[a], currentGridArr[b]] = [currentGridArr[b], currentGridArr[a]];
      const nextGrid = currentGridArr.join('');
      
      const nextDecrypted = decryptWithGrid(ciphertext, nextGrid);
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
  return {
    key: { keyword: bestGrid, cipherChars: detectedChars },
    plaintext: decryptWithGrid(ciphertext, bestGrid),
  };
}
