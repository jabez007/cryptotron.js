import type { CipherTransformer } from '@types';

/**
 * Encrypts a message using the Columnar Transposition cipher.
 *
 * This cipher writes the plaintext into a grid of a fixed width (determined
 * by the length of the keyword) and then reads the columns back in an order
 * specified by the alphabetical order of the characters in the keyword.
 *
 * @param {Object} key - The encryption key containing the keyword.
 * @param {string} key.keyword - The keyword used to determine column order.
 * @returns {CipherTransformer} A function that transforms a plaintext message into its encrypted form.
 * @throws {Error} If `keyword` is empty or contains non-alphabetic characters.
 */
export function encrypt(key: { keyword: string }): CipherTransformer {
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

    const columns: string[][] = Array.from({ length: width }, () => []);
    
    for (let i = 0; i < text.length; i++) {
      columns[i % width].push(text[i]);
    }

    let encrypted = '';
    for (const colIdx of order) {
      encrypted += columns[colIdx].join('');
    }

    return encrypted;
  };
}
