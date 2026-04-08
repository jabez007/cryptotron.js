import { getCharOffset, modulo, transform } from '@utils';
import type { CipherTransformer } from '@types';

/**
 * Creates a transformation function that can encrypt or decrypt text
 * using the Beaufort cipher algorithm.
 * 
 * @param {string} keyword - The secret keyword used for the cipher
 * @returns {CipherTransformer} A function that transforms each character of the text
 */
export function algorithm(keyword: string): CipherTransformer {
  const cleanedKeyword = keyword.replace(/[^A-Za-z]/g, '');
  if (cleanedKeyword.length === 0) {
    throw new Error(
      `Usable part of keyword must have length greater than 0. Usable part of given keyword was '${cleanedKeyword}'`,
    );
  }

  return (inputText: string): string => {
    let j = 0;

    return transform((char, index, text) => {
      const _j = j % cleanedKeyword.length;

      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(cleanedKeyword.charAt(_j));

      const result = String.fromCharCode(
        modulo(
          cleanedKeyword.charCodeAt(_j) -
            keyOffset -
            (text.charCodeAt(index) - offset),
          26,
        ) + offset,
      );
      j += 1;

      return result;
    })(inputText);
  };
}

/**
 * Decrypts text using the Beaufort cipher.
 * 
 * @param {Object} key - The decryption key
 * @param {string} key.keyword - The secret keyword
 * @returns {CipherTransformer} A function that takes encrypted text and returns original message
 */
export function decrypt(key: { keyword: string }): CipherTransformer {
  return algorithm(key.keyword);
}
