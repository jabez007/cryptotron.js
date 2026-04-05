import { getCharOffset, modulo, transform } from '@utils';
import { CipherTransformer } from '@/types.ts';

/**
 * Decrypts a message encrypted with the Vigenère cipher.
 *
 * Decryption subtracts the keyword letters from the ciphertext.
 *
 * Example:
 *   If 'A' was shifted by 'K' to become 'K' during encryption,
 *   decrypting 'K' with 'K' results back in 'A'.
 *
 * @param {Object} key - The decryption key.
 * @param {string} key.keyword - The secret word used for encryption.
 * @returns {CipherTransformer} A function that transforms a ciphertext message into its original form.
 * @throws {Error} If `keyword` contains no alphabetic characters.
 */
export function decrypt(key: { keyword: string }): CipherTransformer {
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
        (char.charCodeAt(0) - offset) -
          (cleanedKey.charCodeAt(_j) - keyOffset),
        26,
      ) + offset,
    );
    j += 1;

    return result;
  });
}
