import { getCharOffset, modulo, transform } from '@utils';

/**
 * Decrypts a message encrypted with the Autokey cipher.
 *
 * Since the Autokey cipher uses part of the plaintext as a key, we need to
 * gradually reconstruct the key while decrypting each letter.
 *
 * Steps for decryption:
 * 1. Start with the **primer** (the original secret word).
 * 2. Convert each letter into a number ('A' = 0, 'B' = 1, ..., 'Z' = 25).
 * 3. Subtract the key letter number from the encrypted letter number.
 * 4. Use **modulo 26** to wrap around if necessary.
 * 5. Convert the new number back into a letter.
 * 6. Append the decrypted letter to the key (since it was part of the encryption).
 * 7. Repeat the process, expanding the key as more letters are decrypted.
 *
 * Example:
 *   If the primer is "D", and the ciphertext is "KLPWZ":
 *   The full key starts as "D".
 *   Decrypting "K" (10) with "D" (3):
 *      (10 - 3) mod 26 = 7 → 'H' (original letter)
 *   The key expands: "DH".
 *   Decrypt "L" (11) with "H" (7), repeat until all letters are restored.
 *
 * @param {Object} key - The decryption key containing the primer.
 * @param {string} key.primer - The initial secret word that starts the key.
 * @returns {Function} A function that transforms a ciphertext message into its original form.
 */
export function decrypt(key: { primer: string }) {
  return (cipherText: string): string => {
    let autokey = key.primer.replace(/[^A-Za-z]/g, '');

    let j = 0;

    return transform((char, index, cipher) => {
      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(autokey.charAt(j));

      const result = String.fromCharCode(
        modulo(
          (cipher.charCodeAt(index) - offset) -
            (autokey.charCodeAt(j) - keyOffset),
          26,
        ) + offset,
      );
      autokey += result;
      j += 1;

      return result;
    })(cipherText);
  };
}
