import { getCharOffset, modulo, transform } from '@utils';
import { algorithm } from './decrypt.ts';

export * from './crack.ts';
export { decrypt } from './decrypt.ts';

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
