import { getCharOffset, modulo, transform } from '@utils';

/**
 * Encrypts text using the Vigenère cipher - a classic cipher that uses a keyword for stronger encryption.
 *
 * How it works (simple version):
 * 1. Choose a secret keyword (like "KEY")
 * 2. Write the keyword repeatedly above your message:
 *    K E Y K E Y K E Y
 *    H E L L O W O R L D
 * 3. For each letter: move forward in the alphabet by the keyword letter's position
 *    - H + K → R (H(8) + K(11) = 19 → R)
 *    - E + E → I (E(5) + E(5) = 10 → I)
 * 4. The alphabet wraps around if needed (Z + A → A)
 *
 * @param {Object} key - The encryption key
 * @param {string} key.keyword - The secret word used for shifting letters
 * @returns {Function} A function that takes plaintext and returns ciphertext
 * @example
 * // Classic spy message encryption:
 * const encryptMessage = encrypt({ keyword: "KEY" });
 * encryptMessage("HELLOWORLD"); // Returns "RIJVSUJVG"
 */
export function encrypt(key: { keyword: string }) {
  const cleanedKeyword = key.keyword.replace(/[^A-Za-z]/g, '');

  let j = 0;
  return transform((char, index, plain) => {
    if (index === 0) {
      j = 0; // make sure j starts fresh
    }

    const _j = j % cleanedKeyword.length;

    const offset = getCharOffset(char);
    const keyOffset = getCharOffset(cleanedKeyword.charAt(_j));

    const result = String.fromCharCode(
      modulo(
        (plain.charCodeAt(index) - offset) +
          (cleanedKeyword.charCodeAt(_j) - keyOffset),
        26,
      ) + offset,
    );
    j += 1;

    return result;
  });
}
