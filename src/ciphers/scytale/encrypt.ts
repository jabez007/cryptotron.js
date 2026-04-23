import type { CipherTransformer } from '@types';

/**
 * Encrypts a message using the Scytale cipher.
 *
 * The Scytale cipher is a transposition cipher where a strip of parchment
 * is wrapped around a rod (scytale). The message is written along the
 * length of the rod. When unwrapped, the letters are transposed.
 *
 * In this implementation, the diameter represents the number of letters
 * that fit around the circumference of the rod (i.e., the number of rows
 * in the transposition grid).
 *
 * @param {Object} key - The encryption key containing the rod diameter.
 * @param {number} key.diameter - The rod diameter/height (must be >= 2).
 * @returns {CipherTransformer} A function that transforms a plaintext message into its encrypted form.
 * @throws {Error} If `diameter` is not an integer greater than or equal to 2.
 */
export function encrypt(key: { diameter: number }): CipherTransformer {
  if (!Number.isInteger(key.diameter) || key.diameter < 2) {
    throw new Error('Diameter must be an integer greater than or equal to 2');
  }

  const { diameter } = key;

  return (text: string): string => {
    if (text.length <= 1) return text;

    // The diameter is the height of the grid.
    // The width of the grid is determined by the text length.
    const width = Math.ceil(text.length / diameter);
    const columns: string[][] = Array.from({ length: width }, () => []);

    // Fill the grid row by row, which corresponds to writing along the rod.
    for (let i = 0; i < text.length; i++) {
      columns[i % width].push(text[i]);
    }

    // The strip (ciphertext) is the grid read column by column.
    return columns.map((col) => col.join('')).join('');
  };
}
