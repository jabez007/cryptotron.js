import { getCharOffset, modulo, transform } from '@utils';

/**
 * Encrypts a message using the Affine cipher.
 *
 * The Affine cipher is a type of substitution cipher where each letter in the
 * alphabet is replaced using a mathematical formula:
 *
 *     E(x) = (alpha * x + beta) mod 26
 *
 * Here's how it works:
 * 1. Every letter is given a number ('A' = 0, 'B' = 1, ..., 'Z' = 25).
 * 2. Multiply that number by `alpha` and add `beta` to it.
 * 3. Take the result and find the remainder when divided by 26 (modulo 26).
 * 4. Convert the new number back into a letter.
 *
 * Example:
 *   If `alpha = 5` and `beta = 8`, the letter 'A' (0) turns into:
 *      (5 * 0 + 8) mod 26 = 8 → 'I'
 *
 * @param {Object} key - The encryption key containing alpha and beta values.
 * @param {number} key.alpha - Must be an integer, used to multiply each letter's number.
 * @param {number} key.beta - Must be an integer, added after multiplication.
 * @returns {Function} A function that transforms a plaintext message into its encrypted form.
 * @throws {Error} If `alpha` or `beta` are not integers.
 */
export function encrypt(key: { alpha: number; beta: number }) {
  if (!(Number.isInteger(key.alpha) && Number.isInteger(key.beta))) {
    throw new Error('Both key values must be integers');
  }

  return transform((char, index, plain) => {
    const offset = getCharOffset(char);
    return String.fromCharCode(
      modulo(key.alpha * (plain.charCodeAt(index) - offset) + key.beta, 26) +
        offset,
    );
  });
}
