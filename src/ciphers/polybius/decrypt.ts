import { buildCipherSquare } from '@utils';
import { CipherTransformer } from '@/types.ts';

/**
 * Decrypts a Polybius Square message back into plaintext.
 *
 * Each pair of characters in the ciphertext is treated as coordinates
 * (row, column) in a 5x5 grid.
 *
 * Example (using "12345" as cipherChars):
 *    "11" (row 1, col 1) → 'a'
 *    "23" (row 2, col 3) → 'h'
 *
 * @param {Object} key - The decryption key.
 * @param {string} key.keyword - The secret word or full grid used for decryption.
 * @param {string} key.cipherChars - Exactly 5 unique coordinate characters (must match encryption).
 * @returns {CipherTransformer} A function that transforms Polybius coordinates into plaintext.
 * @throws {Error} If `cipherChars` does not contain exactly 5 unique characters.
 */
export function decrypt(key: { keyword: string; cipherChars: string }): CipherTransformer {
  const { keyword, cipherChars } = key;
  if (cipherChars.length !== 5) {
    throw new Error('cipherChars must be exactly 5 characters long');
  }

  const cipherSquare = buildCipherSquare(keyword);

  return (cipherText: string) => {
    let outputText = '';
    let i = 0;
    while (i < cipherText.length) {
      const char1 = cipherText.charAt(i);
      const row = cipherChars.indexOf(char1);

      if (row !== -1) {
        // Found first coordinate, look for second
        let foundSecond = false;
        let j = i + 1;
        let intermediate = '';
        while (j < cipherText.length) {
          const char2 = cipherText.charAt(j);
          const col = cipherChars.indexOf(char2);
          if (col !== -1) {
            // Found second coordinate
            outputText += cipherSquare[row][col];
            outputText += intermediate;
            i = j + 1;
            foundSecond = true;
            break;
          }
          // Non-coordinate character between pair, collect it
          intermediate += char2;
          j++;
        }
        if (!foundSecond) {
          // No second coordinate found, append first char as literal
          outputText += char1;
          i++;
        }
      } else {
        // Literal non-coordinate character
        outputText += char1;
        i++;
      }
    }
    return outputText;
  };
}
