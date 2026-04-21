import type { CipherTransformer } from '@types';

/**
 * Decrypts a message using the Scytale cipher.
 *
 * This function reverses the Scytale transposition given the rod diameter.
 *
 * @param {Object} key - The encryption key containing the rod diameter.
 * @param {number} key.diameter - The rod diameter (must be >= 2).
 * @returns {CipherTransformer} A function that transforms an encrypted message into its plaintext form.
 * @throws {Error} If `diameter` is not an integer greater than or equal to 2.
 */
export function decrypt(key: { diameter: number }): CipherTransformer {
  if (!Number.isInteger(key.diameter) || key.diameter < 2) {
    throw new Error('Diameter must be an integer greater than or equal to 2');
  }

  const { diameter } = key;

  return (text: string): string => {
    if (text.length <= 1) return text;

    // The diameter is the height of the grid.
    // The width is the number of columns.
    const width = Math.ceil(text.length / diameter);
    const fullRows = Math.floor(text.length / width);
    const extraLetters = text.length % width;

    // Determine the size of each column.
    const columnLengths = Array.from({ length: width }, (_, i) =>
      i < extraLetters ? fullRows + 1 : fullRows
    );

    // Read the ciphertext into the columns.
    const columns: string[][] = [];
    let currentIdx = 0;
    for (const length of columnLengths) {
      columns.push(text.slice(currentIdx, currentIdx + length).split(''));
      currentIdx += length;
    }

    // Read the columns row by row to reconstruct the plaintext.
    let decrypted = '';
    const maxRows = Math.max(...columnLengths);
    for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
      for (let colIdx = 0; colIdx < width; colIdx++) {
        if (columns[colIdx][rowIdx] !== undefined) {
          decrypted += columns[colIdx][rowIdx];
        }
      }
    }

    return decrypted;
  };
}
