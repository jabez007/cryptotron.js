import { getCharOffset, modulo, transform } from '@utils';

/**
 * Decrypts text using the Caesar cipher - works like reverse encryption.
 *
 * How it works (simple version):
 * 1. Use the same secret number (shift) used to encrypt
 * 2. For each letter: move backward in alphabet by that shift
 *    - D → A (shift 3), E → B, ..., A → X (wraps around), B → Y, C → Z
 * 3. Non-letters stay the same
 *
 * @param {Object} key - The decryption key
 * @param {number} key.shift - Same number used to encrypt (must be whole number)
 * @returns {Function} A function that takes encrypted text and returns original
 * @throws {Error} If shift isn't an integer
 * @example
 * // Decoding a secret message:
 * const readSecret = decrypt({ shift: 3 });
 * readSecret("DWWDFN DW GDZQ"); // "ATTACK AT DAWN"
 */
export function decrypt(key: { shift: number }) {
  if (!Number.isInteger(key.shift)) {
    throw new Error('Shift key value must be an integer');
  }

  return transform((char, index, cipher) => {
    const offset = getCharOffset(char);
    return String.fromCharCode(
      modulo((cipher.charCodeAt(index) - offset) - key.shift, 26) + offset,
    );
  });
}
