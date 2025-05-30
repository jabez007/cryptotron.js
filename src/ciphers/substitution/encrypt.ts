import { alphaLower, getUniqueCharacters, transform } from '@utils';

/**
 * Encrypts text using the Simple Substitution cipher - a cipher that replaces each letter with a secret substitute.
 *
 * How it works (simple version):
 * 1. Create a secret alphabet where each letter is swapped with another
 *    - Example: A→X, B→M, C→Q,... (your cipher alphabet)
 * 2. For each letter in your message:
 *    - Find its position in the normal alphabet
 *    - Replace it with the letter at that same position in your secret alphabet
 * 3. Upper/lower case is preserved in the ciphertext
 *
 * @param {Object} key - The encryption key
 * @param {string} key.cipherAlphabet - 26 unique letters for substitution (can include unused letters)
 * @returns {Function} A function that takes plaintext and returns ciphertext
 * @example
 * // Using a scrambled alphabet:
 * const encryptMessage = encrypt({ cipherAlphabet: "XMQKGBDFYHOWITJVZCRNUALSEP" });
 * encryptMessage("Hello World"); // Might return "Kbggv Jvrkg"
 */
export function encrypt(key: { cipherAlphabet: string }) {
  const plainAlphabet = alphaLower;

  const cipherAlphabet = getUniqueCharacters(
    `${key.cipherAlphabet.toLowerCase()}${plainAlphabet}`,
  );

  return transform((char) => {
    const pos = plainAlphabet.indexOf(char.toLowerCase());

    if (char.toUpperCase() === char) {
      return cipherAlphabet[pos].toUpperCase();
    }

    return cipherAlphabet[pos];
  });
}
