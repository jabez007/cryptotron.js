import type { CipherTransformer } from '@types';

/**
 * Encrypts a message using the Rail-Fence cipher.
 *
 * The Rail-Fence cipher (also called a zigzag cipher) is a type of
 * transposition cipher. It derives its name from the way in which
 * it is encoded. The message is written diagonally down and up on
 * successive "rails" of an imaginary fence, then read off in rows.
 *
 * @param {Object} key - The encryption key containing the number of rails.
 * @param {number} key.rails - The number of rails to use (must be >= 2).
 * @returns {CipherTransformer} A function that transforms a plaintext message into its encrypted form.
 * @throws {Error} If `rails` is not an integer greater than or equal to 2.
 */
export function encrypt(key: { rails: number }): CipherTransformer {
  if (!Number.isInteger(key.rails) || key.rails < 2) {
    throw new Error('Rails must be an integer greater than or equal to 2');
  }

  const { rails } = key;

  return (text: string): string => {
    if (text.length <= rails) return text;

    const rows: string[][] = Array.from({ length: rails }, () => []);
    let row = 0;
    let step = 1;

    for (const char of text) {
      rows[row].push(char);
      row += step;

      if (row === 0 || row === rails - 1) {
        step *= -1;
      }
    }

    return rows.map((r) => r.join('')).join('');
  };
}
