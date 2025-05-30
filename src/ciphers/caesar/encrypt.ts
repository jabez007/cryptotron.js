import { getCharOffset, modulo, transform } from '@utils';

/**
 * Encrypts text using the Caesar cipher - one of the oldest and simplest ciphers.
 *
 * How it works (simple version):
 * 1. Pick a secret number (like 3) - this is your "shift"
 * 2. For each letter: move forward in the alphabet by your shift
 *    - A → D (shift 3), B → E, ..., X → A (wraps around), Y → B, Z → C
 * 3. Non-letters stay the same
 *
 * @param {Object} key - The encryption key
 * @param {number} key.shift - Number of letters to shift (must be whole number)
 * @returns {Function} A function that takes text and returns encrypted text
 * @throws {Error} If shift isn't an integer
 * @example
 * // Like Julius Caesar would do:
 * const makeSecret = encrypt({ shift: 3 });
 * makeSecret("ATTACK AT DAWN"); // "DWWDFN DW GDZQ"
 */
export function encrypt(key: { shift: number }) {
  if (!Number.isInteger(key.shift)) {
    throw new Error('Shift key value must be an integer');
  }

  return transform((char, index, plain) => {
    const offset = getCharOffset(char);
    return String.fromCharCode(
      modulo((plain.charCodeAt(index) - offset) + key.shift, 26) + offset,
    );
  });
}
