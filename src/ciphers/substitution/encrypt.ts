import { getCharOffset, transform } from '@utils';
import { CipherTransformer } from '@/types.ts';

/**
 * Encrypts a message using the Simple Substitution cipher.
 *
 * This cipher replaces each letter of the alphabet with another letter
 * based on a fixed key (a "cipher alphabet").
 *
 * Example:
 *   Normal: "ABC..."
 *   Cipher: "QWE..." (the key)
 *   'A' becomes 'Q', 'B' becomes 'W', etc.
 *
 * @param {Object} key - The encryption key.
 * @param {string} key.cipherAlphabet - A 26-character string representing the shuffled alphabet.
 * @returns {CipherTransformer} A function that transforms a plaintext message into its encrypted form.
 * @throws {Error} If `cipherAlphabet` is not exactly 26 characters long.
 */
export function encrypt(key: { cipherAlphabet: string }): CipherTransformer {
  const { cipherAlphabet } = key;
  if (cipherAlphabet.length !== 26) {
    throw new Error('Cipher alphabet must be exactly 26 characters long');
  }

  const upperKey = cipherAlphabet.toUpperCase();

  return transform((char) => {
    const offset = getCharOffset(char);
    const index = char.toUpperCase().charCodeAt(0) - 65;
    const result = upperKey.charAt(index);

    return offset === 65 ? result : result.toLowerCase();
  });
}
