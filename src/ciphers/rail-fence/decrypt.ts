import type { CipherTransformer } from '@types';

/**
 * Decrypts a message using the Rail-Fence cipher.
 *
 * To decrypt, we first determine the structure of the zigzag pattern
 * for the given number of rails and message length. We then fill
 * this pattern with the characters of the ciphertext and read them
 * back in the original zigzag order.
 *
 * @param {Object} key - The decryption key containing the number of rails.
 * @param {number} key.rails - The number of rails to use (must be >= 2).
 * @returns {CipherTransformer} A function that transforms a ciphertext message into its original form.
 * @throws {Error} If `rails` is not an integer greater than or equal to 2.
 */
export function decrypt(key: { rails: number }): CipherTransformer {
  if (!Number.isInteger(key.rails) || key.rails < 2) {
    throw new Error('Rails must be an integer greater than or equal to 2');
  }

  const { rails } = key;

  return (text: string): string => {
    if (text.length <= rails) return text;

    const pattern: boolean[][] = Array.from({ length: rails }, () => Array(text.length).fill(false));
    let row = 0;
    let step = 1;

    // Build the pattern
    for (let i = 0; i < text.length; i++) {
      pattern[row][i] = true;
      row += step;

      if (row === 0 || row === rails - 1) {
        step *= -1;
      }
    }

    // Fill the pattern with ciphertext
    const result: string[][] = Array.from({ length: rails }, () => []);
    let charIdx = 0;
    for (let r = 0; r < rails; r++) {
      for (let c = 0; c < text.length; c++) {
        if (pattern[r][c]) {
          result[r][c] = text[charIdx++];
        }
      }
    }

    // Read in zigzag order
    let decrypted = '';
    row = 0;
    step = 1;
    for (let i = 0; i < text.length; i++) {
      decrypted += result[row][i];
      row += step;

      if (row === 0 || row === rails - 1) {
        step *= -1;
      }
    }

    return decrypted;
  };
}
