import { getCharOffset, modulo, transform } from '@utils';
import type { CipherTransformer } from '@types';

/**
 * Encrypts a message using the Vigenère cipher.
 *
 * The Vigenère cipher uses a keyword to shift each letter of the
 * plaintext. Each letter in the keyword determines the shift for
 * the corresponding letter in the plaintext.
 *
 * Example:
 *   Plaintext: "ATTACKATDAWN"
 *   Keyword: "KEY"
 *   The first 'A' is shifted by 'K', the first 'T' by 'E', the second
 *   'T' by 'Y', and then the keyword repeats.
 *
 * @param {Object} key - The encryption key.
 * @param {string} key.keyword - The secret word used for encryption.
 * @returns {CipherTransformer} A function that transforms a plaintext message into its encrypted form.
 * @throws {Error} If `keyword` contains no alphabetic characters.
 */
export function encrypt(key: { keyword: string }): CipherTransformer {
  const cleanedKey = key.keyword.replace(/[^A-Za-z]/g, '');
  if (cleanedKey.length === 0) {
    throw new Error('Keyword must contain at least one alphabetic character');
  }

  let j = 0;

  return transform((char) => {
    const _j = j % cleanedKey.length;

    const offset = getCharOffset(char);
    const keyOffset = getCharOffset(cleanedKey.charAt(_j));

    const result = String.fromCharCode(
      modulo(
        (char.charCodeAt(0) - offset) +
          (cleanedKey.charCodeAt(_j) - keyOffset),
        26,
      ) + offset,
    );
    j += 1;

    return result;
  });
}
