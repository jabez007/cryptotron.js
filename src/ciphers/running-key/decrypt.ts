import { getCharOffset, modulo, transform } from '@utils';

/**
 * Decrypts text using the Running Key cipher - reverses the encryption process.
 *
 * How it works (simple version):
 * 1. Use the exact same key text used for encryption
 * 2. Line up the ciphertext with the beginning of the key text
 * 3. For each letter:
 *    - Move backward in the alphabet by the position of the key letter
 *    - Example: Cipher 'L' - Key 'E' (5th letter) → 'H'
 * 4. The key must be at least as long as the ciphertext!
 *
 * @param {Object} key - The decryption key
 * @param {string} key.keyText - The same text used for encryption (only letters are used)
 * @returns {Function} A function that takes ciphertext and returns plaintext
 * @throws {Error} If the usable key text is shorter than the ciphertext
 * @example
 * // Decrypting with the same book excerpt:
 * const decryptMessage = decrypt({ keyText: "Call me Ishmael..." });
 * decryptMessage("JMPPT"); // Returns "HELLO"
 */
export function decrypt(key: { keyText: string }) {
  const cleanedKeyText = key.keyText.replace(/[^A-Za-z]/g, '');

  return (cipherText: string) => {
    const cleanedCipherText = cipherText.replace(/[^A-Za-z]/g, '');
    if (cleanedCipherText.length > cleanedKeyText.length) {
      throw new Error(
        `Usable key text must be at least as long as decryptable cipher text. Usable key was ${cleanedKeyText.length} characters long while encryptable plain text was ${cleanedCipherText.length} characters long`,
      );
    }

    let j = 0;

    return transform((char, index, cipher) => {
      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(cleanedKeyText.charAt(j));

      const result = String.fromCharCode(
        modulo(
          (cipher.charCodeAt(index) - offset) -
            (cleanedKeyText.charCodeAt(j) - keyOffset),
          26,
        ) + offset,
      );
      j += 1;

      return result;
    })(cipherText);
  };
}
