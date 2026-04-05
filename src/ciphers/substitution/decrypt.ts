import { getCharOffset, transform } from '@utils';
import { CipherTransformer } from '@/types.ts';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Decrypts a message encrypted with the Simple Substitution cipher.
 *
 * Decryption uses the cipher alphabet to find the original letters.
 *
 * Example:
 *   If 'Q' was used for 'A' during encryption, 'Q' will be replaced back
 *   with 'A'.
 *
 * @param {Object} key - The decryption key.
 * @param {string} key.cipherAlphabet - The 26-character shuffled alphabet used for encryption.
 * @returns {CipherTransformer} A function that transforms a ciphertext message into its original form.
 * @throws {Error} If `cipherAlphabet` is not exactly 26 characters long.
 */
export function decrypt(key: { cipherAlphabet: string }): CipherTransformer {
  const { cipherAlphabet } = key;
  if (new Set(cipherAlphabet.toUpperCase()).size !== 26) {
    throw new Error('Cipher alphabet must be exactly 26 unique characters');
  }

  const upperKey = cipherAlphabet.toUpperCase();

  return transform((char) => {
    const offset = getCharOffset(char);
    const index = upperKey.indexOf(char.toUpperCase());

    if (index === -1) return char;

    const result = alphabet.charAt(index);
    return offset === 65 ? result : result.toLowerCase();
  });
}
