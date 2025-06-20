import { getCharOffset, modulo, transform } from '@utils';

/**
 * Encrypts text using the Running Key cipher - a clever cipher that uses an entire text as a key.
 *
 * How it works (simple version):
 * 1. Choose a long key text (like a book page or newspaper article)
 * 2. Line up your message with the beginning of the key text
 * 3. For each letter:
 *    - Move forward in the alphabet by the position of the key letter
 *    - Example: Message 'H' + Key 'E' (5th letter) → 'L'
 * 4. The key must be at least as long as your message!
 *
 * @param {Object} key - The encryption key
 * @param {string} key.keyText - The text used as the key (only letters are used)
 * @returns {Function} A function that takes plaintext and returns ciphertext
 * @throws {Error} If the usable key text is shorter than the message
 * @example
 * // Using a book excerpt as key:
 * const encryptMessage = encrypt({ keyText: "Call me Ishmael..." });
 * encryptMessage("HELLO"); // Might return "JMPPT" (depends on key)
 */
export function encrypt(key: { keyText: string }) {
  const cleanedKeyText = key.keyText.replace(/[^A-Za-z]/g, '');

  return (plainText: string) => {
    const cleanedPlainText = plainText.replace(/[^A-Za-z]/g, '');
    if (cleanedPlainText.length > cleanedKeyText.length) {
      throw new Error(
        `Usable key text must be at least as long as encryptable plain text. Usable key was ${cleanedKeyText.length} characters long while encryptable plain text was ${cleanedPlainText.length} characters long`,
      );
    }

    let j = 0;

    return transform((char, index, plain) => {
      const offset = getCharOffset(char);
      const keyOffset = getCharOffset(cleanedKeyText.charAt(j));

      const result = String.fromCharCode(
        modulo(
          (plain.charCodeAt(index) - offset) +
            (cleanedKeyText.charCodeAt(j) - keyOffset),
          26,
        ) + offset,
      );
      j += 1;

      return result;
    })(plainText);
  };
}
