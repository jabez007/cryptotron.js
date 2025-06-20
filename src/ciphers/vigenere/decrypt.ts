import { getCharOffset, modulo, transform } from '@utils';

/**
 * Decrypts text using the Vigenère cipher - reverses the keyword shifts.
 *
 * How it works (simple version):
 * 1. Use the same keyword used for encryption
 * 2. Write the keyword repeatedly above the ciphertext:
 *    K E Y K E Y K E Y
 *    R I J V S U J V G
 * 3. For each letter: move backward in the alphabet by the keyword letter's position
 *    - R - K → H (R(18) - K(11) = 7 → H)
 *    - I - E → E (I(9) - E(5) = 4 → E)
 * 4. The alphabet wraps around if needed (A - B → Z)
 *
 * @param {Object} key - The decryption key
 * @param {string} key.keyword - Same secret word used for encryption
 * @returns {Function} A function that takes ciphertext and returns plaintext
 * @throws {Error} If the keyword contains no alphabetic characters
 * @example
 * // Decrypting a spy message:
 * const decryptMessage = decrypt({ keyword: "KEY" });
 * decryptMessage("RIJVSUJVG"); // Returns "HELLOWORLD"
 */
export function decrypt(key: { keyword: string }) {
  const cleanedKeyword = key.keyword.replace(/[^A-Za-z]/g, '');

  if (cleanedKeyword.length === 0) {
    throw new Error('Keyword must contain at least one alphabetic character');
  }

  let j = 0;
  return transform((char, index, cipher) => {
    if (index === 0) {
      j = 0; // make sure j starts fresh
    }

    const _j = j % cleanedKeyword.length;

    const offset = getCharOffset(char);
    const keyOffset = getCharOffset(cleanedKeyword.charAt(_j));

    const result = String.fromCharCode(
      modulo(
        (cipher.charCodeAt(index) - offset) -
          (cleanedKeyword.charCodeAt(_j) - keyOffset),
        26,
      ) + offset,
    );
    j += 1;

    return result;
  });
}
