import { getCharOffset, modulo, transform } from '@utils';
import { CipherTransformer } from '@/types.ts';

/**
 * Encrypts a message using the Caesar cipher.
 *
 * The Caesar cipher is one of the simplest and most famous encryption
 * techniques. It's a type of substitution cipher where each letter in
 * the plaintext is 'shifted' a certain number of places down the alphabet.
 *
 * Example:
 *   With a shift of 1, 'A' becomes 'B', 'B' becomes 'C', and 'Z' wraps
 *   around to 'A'.
 *
 * @param {Object} key - The encryption key containing the shift value.
 * @param {number} key.shift - The number of positions to shift each letter.
 * @returns {CipherTransformer} A function that transforms a plaintext message into its encrypted form.
 * @throws {Error} If `shift` is not an integer.
 */
export function encrypt(key: { shift: number }): CipherTransformer {
  if (!Number.isInteger(key.shift)) {
    throw new Error('Key value must be an integer');
  }

  return transform((char) => {
    const offset = getCharOffset(char);
    return String.fromCharCode(
      modulo(char.charCodeAt(0) - offset + key.shift, 26) + offset,
    );
  });
}
