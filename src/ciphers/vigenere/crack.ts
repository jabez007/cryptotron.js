import { decrypt } from './decrypt.ts';
import { baseCrack } from '../../utils/vigenere-base.ts';

/**
 * Cracks the Vigenère cipher.
 * 
 * Uses n-gram frequency analysis to estimate the most likely keyword.
 * This is a thin wrapper around the reusable baseCrack utility.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxKeyLength - Maximum key length to test (default 20)
 * @returns {Object} The recovered key (keyword) and decrypted plaintext
 */
export function crack(ciphertext: string, maxKeyLength: number = 20) {
  return baseCrack({
    ciphertext,
    maxKeyLength,
    decryptColumnChar: (shift, charCode) => (charCode - shift + 26) % 26,
    decryptFull: decrypt,
    keyFactory: (keyword) => ({ keyword }),
  });
}
