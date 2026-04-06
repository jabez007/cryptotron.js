import { buildCipherSquare } from '@utils';
import type { CipherTransformer } from '@types';

/**
 * Encrypts a message using the Playfair cipher.
 *
 * The Playfair cipher uses a 5x5 grid of letters, constructed using a keyword.
 * It encrypts pairs of letters (digraphs) based on their positions in the grid.
 *
 * Rules:
 * 1. If both letters are in the same row, replace each with the letter to its right (wrapping).
 * 2. If both letters are in the same column, replace each with the letter below it (wrapping).
 * 3. If the letters form a rectangle, replace each with the letter in its own row but
 *    the other letter's column.
 *
 * @param {Object} key - The encryption key containing the keyword.
 * @param {string} key.keyword - The keyword used to build the 5x5 grid.
 * @returns {CipherTransformer} A function that transforms a plaintext message into its encrypted form.
 */
export function encrypt(key: { keyword: string }): CipherTransformer {
  const grid = buildCipherSquare(key.keyword);
  const charMap = new Map<string, { r: number; c: number }>();
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      charMap.set(grid[r][c], { r, c });
    }
  }

  return (text: string): string => {
    // Normalize text: uppercase, J -> I, remove non-alphabetic
    const normalized = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    
    // Prepare digraphs
    const digraphs: string[] = [];
    for (let i = 0; i < normalized.length; i++) {
      const a = normalized[i];
      let b = '';
      
      if (i + 1 < normalized.length) {
        b = normalized[i + 1];
        if (a === b) {
          b = 'X';
          // i stays same for next iteration's 'a', but we skip 'b' since we used 'X'
          // Wait, actually we used 'a' and 'X'. So next 'a' is original 'b'.
        } else {
          i++;
        }
      } else {
        b = 'X';
      }
      digraphs.push(a + b);
    }

    let encrypted = '';
    for (const digraph of digraphs) {
      const posA = charMap.get(digraph[0].toLowerCase())!;
      const posB = charMap.get(digraph[1].toLowerCase())!;

      if (posA.r === posB.r) {
        // Same row
        encrypted += grid[posA.r][(posA.c + 1) % 5];
        encrypted += grid[posB.r][(posB.c + 1) % 5];
      } else if (posA.c === posB.c) {
        // Same column
        encrypted += grid[(posA.r + 1) % 5][posA.c];
        encrypted += grid[(posB.r + 1) % 5][posB.c];
      } else {
        // Rectangle
        encrypted += grid[posA.r][posB.c];
        encrypted += grid[posB.r][posA.c];
      }
    }

    return encrypted.toUpperCase();
  };
}
