import type { CipherTransformer } from '@types';

/**
 * Decrypts a message using the Columnar Transposition cipher.
 *
 * To decrypt, we first determine the original column order based on the
 * keyword. We then calculate the length of each column based on the
 * ciphertext's total length and the number of columns. We fill these
 * columns with the characters of the ciphertext in the correct order
 * and then read them back row by row.
 *
 * @param {Object} key - The decryption key containing the keyword.
 * @param {string} key.keyword - The keyword used to determine column order.
 * @returns {CipherTransformer} A function that transforms a ciphertext message into its original form.
 * @throws {Error} If `keyword` is empty or contains non-alphabetic characters.
 */
export function decrypt(key: { keyword: string }): CipherTransformer {
  if (!key.keyword || !/^[a-zA-Z]+$/.test(key.keyword)) {
    throw new Error('Keyword must be a non-empty string containing only alphabetic characters');
  }

  const keyword = key.keyword.toUpperCase();
  const width = keyword.length;

  // Determine column order based on alphabetical order of keyword
  const order = keyword
    .split('')
    .map((char, index) => ({ char, index }))
    .sort((a, b) => {
      if (a.char < b.char) return -1;
      if (a.char > b.char) return 1;
      return a.index - b.index;
    })
    .map((item) => item.index);

  return (text: string): string => {
    if (text.length === 0) return '';

    const colLengths = Array(width).fill(Math.floor(text.length / width));
    for (let i = 0; i < text.length % width; i++) {
      colLengths[i]++;
    }

    const columns: string[][] = Array.from({ length: width }, () => []);
    let currentIdx = 0;
    
    // Fill columns in the order defined by keyword
    for (const colIdx of order) {
      const length = colLengths[colIdx];
      columns[colIdx] = text.slice(currentIdx, currentIdx + length).split('');
      currentIdx += length;
    }

    let decrypted = '';
    const maxLen = Math.max(...colLengths);
    for (let row = 0; row < maxLen; row++) {
      for (let col = 0; col < width; col++) {
        if (columns[col][row]) {
          decrypted += columns[col][row];
        }
      }
    }

    return decrypted;
  };
}
