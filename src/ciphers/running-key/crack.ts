import { decrypt } from './decrypt.ts';
import { baseCrack } from '../../utils/vigenere-base.ts';

/**
 * Cracks the Running Key cipher.
 * 
 * NOTE: This implementation assumes the key is a repeating short keyword (treating it like a Vigenère cipher).
 * True running-key ciphers are extremely difficult to crack without the key text or very long ciphertexts.
 * 
 * Uses n-gram frequency analysis to estimate the most likely repeating keyword.
 * This is a thin wrapper around the reusable baseCrack utility.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxKeyLength - Maximum keyword length to test for the repeating key assumption (default 20)
 * @returns {Object} The recovered key (keyText) and decrypted plaintext
 */
export function crack(ciphertext: string, maxKeyLength: number = 20) {
  return baseCrack({
    ciphertext,
    maxKeyLength,
    decryptColumnChar: (shift, charCode) => (charCode - shift + 26) % 26,
    decryptFull: decrypt,
    keyFactory: (keyword) => {
      // Build keyText from repeating keyword to satisfy decrypt requirement
      let keyText = '';
      while (keyText.length < ciphertext.length) {
        keyText += keyword;
      }
      return { keyText: keyText.substring(0, ciphertext.length) };
    },
    periodic: true, 
  });
}
