import { buildCipherSquare } from '@utils';
import type { CipherTransformer } from '@types';

/**
 * Decrypts a message using the Playfair cipher.
 *
 * The rules for decryption are the inverse of encryption:
 * 1. If both letters are in the same row, replace each with the letter to its left.
 * 2. If both letters are in the same column, replace each with the letter above it.
 * 3. If the letters form a rectangle, replace each with the letter in its own row but
 *    the other letter's column.
 *
 * @param {Object} key - The decryption key containing the keyword.
 * @param {string} key.keyword - The keyword used to build the 5x5 grid.
 * @param {Object} [options] - Decryption options.
 * @param {boolean} [options.preserveFillers=false] - Whether to keep synthetic filler characters ('X' or 'Q') in the output.
 * @returns {CipherTransformer} A function that transforms a ciphertext message into its original form.
 */
export function decrypt(
  key: { keyword: string }, 
  options: { preserveFillers?: boolean } = {}
): CipherTransformer {
  const { preserveFillers = false } = options;
  const grid = buildCipherSquare(key.keyword);
  const charMap = new Map<string, { r: number; c: number }>();
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      charMap.set(grid[r][c], { r, c });
    }
  }

  return (text: string): string => {
    const normalized = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    if (normalized.length % 2 !== 0) {
      throw new Error('Ciphertext must have an even number of characters');
    }

    let decrypted = '';
    for (let i = 0; i < normalized.length; i += 2) {
      const a = normalized[i];
      const b = normalized[i + 1];
      const posA = charMap.get(a.toLowerCase());
      const posB = charMap.get(b.toLowerCase());

      if (!posA || !posB) {
        throw new Error(`Playfair decrypt: missing mapping for digraph "${a}${b}" at index ${i}`);
      }

      if (posA.r === posB.r) {
        // Same row: shift left
        decrypted += grid[posA.r][(posA.c + 4) % 5];
        decrypted += grid[posB.r][(posB.c + 4) % 5];
      } else if (posA.c === posB.c) {
        // Same column: shift up
        decrypted += grid[(posA.r + 4) % 5][posA.c];
        decrypted += grid[(posB.r + 4) % 5][posB.c];
      } else {
        // Rectangle
        decrypted += grid[posA.r][posB.c];
        decrypted += grid[posB.r][posA.c];
      }
    }

    const result = decrypted.toUpperCase();
    if (preserveFillers) {
      return result;
    }

    // De-filling logic
    let deFilled = '';
    for (let i = 0; i < result.length; i++) {
      const current = result[i];
      const next = result[i + 1];
      const prev = deFilled[deFilled.length - 1];

      // Only treat as filler if it's the second character of an original digraph (i % 2 === 1)
      if (i % 2 === 1 && (current === 'X' || current === 'Q') && next && prev === next) {
        const expectedFiller = prev === 'X' ? 'Q' : 'X';
        if (current === expectedFiller) {
          // Skip the filler
          continue;
        }
      }
      deFilled += current;
    }

    // Remove trailing padding if it's a filler in the second position of the final digraph
    if (deFilled.length > 0) {
      const lastChar = deFilled[deFilled.length - 1];
      const secondToLast = deFilled[deFilled.length - 2];
      
      if (lastChar === 'X' || lastChar === 'Q') {
        const expectedFiller = secondToLast === 'X' ? 'Q' : 'X';
        if (lastChar === expectedFiller) {
          return deFilled.slice(0, -1);
        }
      }
    }

    return deFilled;
  };
}
