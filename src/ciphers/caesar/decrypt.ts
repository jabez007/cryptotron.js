import { getCharOffset, modulo, transform } from '@utils';
import type { CipherTransformer } from '@types';

/**
 * Decrypts a message using the Caesar cipher.
 *
 * Decryption involves shifting the letters in the reverse direction.
 *
 * Example:
 *   If the message was shifted by 3 ('A' → 'D'), decrypting it requires
 *   shifting back by 3 ('D' → 'A').
 *
 * @param {Object} key - The decryption key containing the shift value.
 * @param {number} key.shift - The number of positions to shift each letter back.
 * @returns {CipherTransformer} A function that transforms an encrypted message back into its original form.
 * @throws {Error} If `shift` is not an integer.
 */
export function decrypt(key: { shift: number }): CipherTransformer {
  if (!Number.isInteger(key.shift)) {
    throw new Error('Key value must be an integer');
  }

  return transform((char) => {
    const offset = getCharOffset(char);
    return String.fromCharCode(
      modulo(char.charCodeAt(0) - offset - key.shift, 26) + offset,
    );
  });
}
