import { getScorer } from '../../utils/cryptanalysis.ts';
import { alphaLower } from '../../utils/index.ts';

/**
 * Detects the most likely characters used as coordinates in a Polybius Square ciphertext.
 * 
 * @param {string} ciphertext - The text to analyze
 * @returns {string} The 5 most frequent non-whitespace characters, sorted alphabetically
 */
function detectCipherChars(ciphertext: string): string {
  const counts: Record<string, number> = {};
  for (const char of ciphertext) {
    if (/\S/.test(char)) {
      counts[char] = (counts[char] || 0) + 1;
    }
  }
  
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0])
    .sort();
    
  return sorted.join('') || '12345';
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
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const decryptWithGrid = (text: string, grid: string) => {
    let result = '';
    for (let i = 0; i < text.length; i += 2) {
      // Explicitly handle odd-length input
      if (i + 1 >= text.length) {
        result += text[i];
        break;
      }

      const row = detectedChars.indexOf(text[i]);
      const col = detectedChars.indexOf(text[i+1]);
      
      if (row === -1 || col === -1) {
        // Handle non-coordinate characters by treating them as single characters
        result += text[i];
        i--; // Backup so the loop's i+=2 only advances 1
        continue;
      }
      result += grid[row * 5 + col];
    }
    return result;
  };

  for (let r = 0; r < 20; r++) {
    const currentGridArr = shuffle(alphabet25, rng);
    let currentScore = scorer.score(decryptWithGrid(ciphertext, currentGridArr.join('')));

    for (let i = 0; i < 20000; i++) {
      // Pick indices a and b deterministically within calculation to avoid retry loops
      const a = Math.floor(rng() * 25);
      const b = (a + 1 + Math.floor(rng() * 24)) % 25;

      // Perform in-place swap to reduce allocations as requested
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
