import { getCharOffset, modulo, transform } from '@utils';

/**
 * Encrypts a message using the Autokey cipher.
 *
 * The Autokey cipher is a variation of the Vigenère cipher. Instead of using
 * a repeating key, it uses part of the plaintext as the key, making it harder to break.
 *
 * Steps for encryption:
 * 1. Choose a **primer** (a short initial word or letter sequence) as the secret key.
 * 2. Attach the plaintext to the primer, forming the full key.
 * 3. Convert each letter into a number ('A' = 0, 'B' = 1, ..., 'Z' = 25).
 * 4. Add the key's corresponding letter number to the plaintext letter number.
 * 5. Use **modulo 26** to wrap around if necessary.
 * 6. Convert the new number back into a letter.
 *
 * Example:
 *   If the primer is "D", and the plaintext is "HELLO":
 *   The full key becomes "DHELLO".
 *   Encrypting "H" (7) with "D" (3):
 *      (7 + 3) mod 26 = 10 → 'K' (encrypted letter)
 *
 * @param {Object} key - The encryption key containing the primer.
 * @param {string} key.primer - The initial secret word that starts the key.
 * @returns {Function} A function that transforms a plaintext message into its encrypted form.
 */
export function encrypt(key: { primer: string }) {
  return (plainText: string): string => {
    const autokey = `${key.primer}${plainText}`.replace(/[^A-Za-z]/g, '');

    let j = 0;

    return transform((char, index, plain) => {
      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(autokey.charAt(j));

      const result = String.fromCharCode(
        modulo(
          (plain.charCodeAt(index) - offset) +
            (autokey.charCodeAt(j) - keyOffset),
          26,
        ) + offset,
      );
      j += 1;

      return result;
    })(plainText);
  };
}
