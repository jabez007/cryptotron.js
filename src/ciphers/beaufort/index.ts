import { getCharOffset, modulo, transform } from '@utils';

/**
 * Creates a transformation function that can encrypt or decrypt text
 * using the Beaufort cipher algorithm.
 *
 * The Beaufort cipher works like a reverse Vigenère cipher - instead of adding
 * letters together, it subtracts them. Here's how it works in simple steps:
 *
 * 1. You pick a secret keyword (like "KEY")
 * 2. You write the keyword over and over above your message:
 *    K E Y K E Y K E Y
 *    H E L L O W O R L D
 * 3. For each letter, you find how far the keyword letter is from "A",
 *    then subtract your message letter's position from it
 * 4. If the result goes past "Z", you wrap around to the beginning
 * 5. The result is your secret code!
 *
 * To decode, you use the exact same process with the same keyword!
 *
 * @param {string} keyword - The secret word used to scramble the message
 * @returns {Function} A function that transforms each character of the text
 * @throws {Error} If the keyword has less than 2 usable letters
 */
function algorithm(keyword: string) {
  const cleanedKeyword = keyword.replace(/[^A-Za-z]/g, '');
  if (cleanedKeyword.length < 2) {
    throw new Error(
      `Usable part of keyword must have length greater than 1. Usable part of given keyword was ${cleanedKeyword}`,
    );
  }

  let j = 0;

  return transform((char, index, text) => {
    if (index === 0) {
      j = 0; // make sure j starts fresh
    }

    const _j = j % cleanedKeyword.length;

    const offset = getCharOffset(char);
    const keyOffset = getCharOffset(
      cleanedKeyword.charAt(_j),
    );

    const result = String.fromCharCode(
      modulo(
        (cleanedKeyword.charCodeAt(_j) - keyOffset) -
          (text.charCodeAt(index) - offset),
        26,
      ) + offset,
    );
    j += 1;

    return result;
  });
}

/**
 * Encrypts text using the Beaufort cipher.
 * (Note: Beaufort cipher uses the same process for encryption and decryption)
 * @param {Object} key - The encryption key
 * @param {string} key.keyword - The secret word used for encryption
 * @returns {Function} A function that takes text and returns encrypted text
 * @example
 * const encryptMessage = encrypt({ keyword: "KEY" });
 * const secretCode = encryptMessage("HELLOWORLD");
 * console.log(secretCode); // "RIJVSUSGQ"
 */
export function encrypt(key: { keyword: string }) {
  return algorithm(key.keyword);
}

/**
 * Decrypts text using the Beaufort cipher.
 * (Note: Beaufort cipher uses the same process for encryption and decryption)
 * @param {Object} key - The decryption key
 * @param {string} key.keyword - The secret word used for decryption (same as encryption)
 * @returns {Function} A function that takes encrypted text and returns the original message
 * @example
 * const decryptMessage = decrypt({ keyword: "KEY" });
 * const originalText = decryptMessage("RIJVSUSGQ");
 * console.log(originalText); // "HELLOWORLD"
 */
export function decrypt(key: { keyword: string }) {
  return algorithm(key.keyword);
}
