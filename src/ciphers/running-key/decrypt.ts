import { getCharOffset, modulo, transform } from '@utils';
import { CipherTransformer } from '@/types.ts';

/**
 * Decrypts a message encrypted with the Running Key cipher.
 *
 * Decryption subtracts the key letter numbers from the encrypted letter numbers.
 *
 * Example:
 *   Ciphertext: "T..."
 *   Running Key: "T..."
 *   Decryption: (T - T) mod 26 = 0 ('A').
 *
 * @param {Object} key - The decryption key.
 * @param {string} key.keyText - The long key text used for encryption.
 * @returns {CipherTransformer} A function that transforms a ciphertext message into its original form.
 * @throws {Error} If `keyText` contains no alphabetic characters.
 */
export function decrypt(key: { keyText: string }): CipherTransformer {
  const cleanedKey = key.keyText.replace(/[^A-Za-z]/g, '');
  if (cleanedKey.length === 0) {
    throw new Error('Key text must contain at least one alphabetic character');
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
