import { getCharOffset, modulo, transform } from '@utils';
import { CipherTransformer } from '@/types.ts';

/**
 * Encrypts a message using the Running Key cipher.
 *
 * The Running Key cipher is similar to the Vigenère cipher but uses a
 * very long key from a book or other source, ideally as long as the
 * message itself.
 *
 * Example:
 *   Plaintext: "ATTACKATDAWN"
 *   Running Key: "THEBOOKOFTH..." (from a book)
 *   Encryption: Add the letters together mod 26.
 *
 * @param {Object} key - The encryption key.
 * @param {string} key.keyText - A long string of text used as the key.
 * @returns {CipherTransformer} A function that transforms a plaintext message into its encrypted form.
 * @throws {Error} If `keyText` contains no alphabetic characters.
 */
export function encrypt(key: { keyText: string }): CipherTransformer {
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
        (char.charCodeAt(0) - offset) +
          (cleanedKey.charCodeAt(_j) - keyOffset),
        26,
      ) + offset,
    );
    j += 1;

    return result;
  });
}
