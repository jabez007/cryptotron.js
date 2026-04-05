import { buildCipherSquare, transform } from '@utils';
import type { CipherTransformer } from '@/types.ts';

/**
 * Encrypts a message using the Polybius Square cipher.
 *
 * The Polybius Square is a technique that represents each letter of
 * the alphabet with its coordinates in a 5x5 grid (square).
 *
 * Example (using "ABCDE" as cipherChars):
 *    A B C D E
 *  A a b c d e
 *  B f g h i k
 *  C l m n o p
 *  ...
 *  'a' (row 1, col 1) → "AA"
 *  'h' (row 2, col 3) → "BC"
 *
 * Note: 'j' is typically merged with 'i' to fit in the 5x5 grid.
 *
 * @param {Object} key - The encryption key.
 * @param {string} key.keyword - The secret word used to shuffle the square.
 * @param {string} key.cipherChars - Exactly 5 unique characters used as coordinates (e.g., "12345" or "ABCDE").
 * @returns {CipherTransformer} A function that transforms a plaintext message into its Polybius coordinates.
 * @throws {Error} If `cipherChars` does not contain exactly 5 unique characters.
 */
export function encrypt(key: { keyword: string; cipherChars: string }): CipherTransformer {
  const { keyword, cipherChars } = key;
  if (cipherChars.length !== 5 || new Set(cipherChars).size !== 5) {
    throw new Error('cipherChars must be exactly 5 unique characters');
  }

  const cipherSquare = buildCipherSquare(keyword);

  return transform((char) => {
    let _char = char.toLowerCase();
    if (_char === 'j') _char = 'i';

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (cipherSquare[r][c] === _char) {
          return `${cipherChars.charAt(r)}${cipherChars.charAt(c)}`;
        }
      }
    }
    throw new Error(`Character '${char}' (normalized as '${_char}') not found in cipherSquare`);
  });
}
