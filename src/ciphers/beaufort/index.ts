import { CipherTransformer } from '@/types.ts';
import { algorithm } from './decrypt.ts';

export * from './crack.ts';
export { decrypt } from './decrypt.ts';

/**
 * Encrypts text using the Beaufort cipher.
 * (Note: Beaufort cipher uses the same process for encryption and decryption)
 * @param {Object} key - The encryption key
 * @param {string} key.keyword - The secret word used for encryption
 * @returns {CipherTransformer} A function that takes text and returns encrypted text
 * @example
 * const encryptMessage = encrypt({ keyword: "KEY" });
 * const secretCode = encryptMessage("HELLOWORLD");
 * console.log(secretCode); // "RIJVSUSGQ"
 */
export function encrypt(key: { keyword: string }): CipherTransformer {
  return algorithm(key.keyword);
}
