import { getCharOffset, modulo, transform } from '@utils';

/**
 * Finds the modular multiplicative inverse of a given number within the range of 1 to 25 (since we're working with modulo 26).
 * @param {number} a - The integer for which the inverse is to be found.
 * @returns {number} - The modular multiplicative inverse of `a` modulo 26.
 * @throws {Error} - If the input value is not an integer or no inverse is found.
 */
function findInverse(a: number): number {
  if (!Number.isInteger(a)) {
    throw new Error('Input value must be an integer');
  }

  for (let i = 1; i < 26; i += 1) {
    if ((a * i) % 26 === 1) {
      return i;
    }
  }
  return NaN;
}

/**
 * Decrypts a message encrypted with the Affine cipher.
 *
 * The Affine cipher encryption follows the formula:
 *
 *     E(x) = (alpha * x + beta) mod 26
 *
 * To reverse this process (decrypt), we use:
 *
 *     D(y) = inverse_alpha * (y - beta) mod 26
 *
 * Steps for decryption:
 * 1. Every letter is turned into a number ('A' = 0, 'B' = 1, ..., 'Z' = 25).
 * 2. Subtract `beta` from that number to undo the shift.
 * 3. Multiply by `inverse_alpha`, which is a special number that reverses the multiplication.
 * 4. Find the remainder when dividing by 26 (modulo 26) to get the original letter.
 * 5. Convert the new number back into a letter.
 *
 * Example:
 *   If `alpha = 5`, `beta = 8`, and 'I' (8) was encrypted from 'A' (0),
 *   we use the inverse of 5 mod 26 (which is 21):
 *      (21 * (8 - 8)) mod 26 = 0 → 'A' (original letter)
 *
 * @param {Object} key - The decryption key containing alpha and beta values.
 * @param {number} key.alpha - Must be an integer, originally used in encryption.
 * @param {number} key.beta - Must be an integer, originally added during encryption.
 * @returns {Function} A function that transforms a ciphertext message into its original form.
 * @throws {Error} If `alpha` or `beta` are not integers or if no inverse exists for `alpha`.
 */
export function decrypt(key: { alpha: number; beta: number }) {
  if (!(Number.isInteger(key.alpha) && Number.isInteger(key.beta))) {
    throw new Error('Both key values must be integers');
  }

  const inverse = findInverse(key.alpha);
  if (Number.isNaN(inverse)) {
    throw new Error(`No inverse found for alpha value ${key.alpha}`);
  }

  return transform((char, index, cipher) => {
    const offset = getCharOffset(char);
    return String.fromCharCode(
      modulo(inverse * ((cipher.charCodeAt(index) - offset) - key.beta), 26) +
        offset,
    );
  });
}
