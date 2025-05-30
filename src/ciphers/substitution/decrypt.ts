import { alphaLower, getUniqueCharacters, transform } from '@utils';

/**
 * Decrypts text using the Simple Substitution cipher - reverses the letter swapping.
 *
 * How it works (simple version):
 * 1. Use the same secret alphabet used for encryption
 * 2. For each letter in ciphertext:
 *    - Find its position in the secret alphabet
 *    - Replace it with the letter at that position in the normal alphabet
 * 3. Upper/lower case is preserved in the plaintext
 *
 * @param {Object} key - The decryption key (must match encryption key)
 * @param {string} key.cipherAlphabet - Same 26-letter substitution alphabet used to encrypt
 * @returns {Function} A function that takes ciphertext and returns plaintext
 * @example
 * // Decrypting with the same scrambled alphabet:
 * const decryptMessage = decrypt({ cipherAlphabet: "XMQKGBDFYHOWITJVZCRNUALSEP" });
 * decryptMessage("Kbggv Jvrkg"); // Returns "Hello World"
 */
export function decrypt(key: { cipherAlphabet: string }) {
  const plainAlphabet = alphaLower;

  const cipherAlphabet = getUniqueCharacters(
    `${key.cipherAlphabet.toLowerCase()}${plainAlphabet}`,
  );

  return transform((char) => {
    const pos = cipherAlphabet.indexOf(char.toLowerCase());

    if (char.toUpperCase() === char) {
      return plainAlphabet[pos].toUpperCase();
    }

    return plainAlphabet[pos];
  });
}
