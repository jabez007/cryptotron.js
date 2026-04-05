import { decrypt } from './decrypt.ts';
import { baseCrack } from '../../utils/vigenere-base.ts';
import { CrackResult } from '@/types.ts';

/**
 * Cracks the Vigenère cipher.
 * 
 * Uses n-gram frequency analysis to estimate the most likely keyword.
 * This is a thin wrapper around the reusable baseCrack utility.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxKeyLength - Maximum key length to test (default 20)
 * @returns {CrackResult<{ keyword: string }>} The recovered key (keyword) and decrypted plaintext
 */
export function crack(ciphertext: string, maxKeyLength: number = 20): CrackResult<{ keyword: string }> {
  return baseCrack({
    ciphertext,
    maxKeyLength,
    minKeyLength: 1,
    initialBestKeyword: 'A',
    decryptColumnChar: (shift, charCode) => (charCode - shift + 26) % 26,
    decryptFull: decrypt,
    keyFactory: (keyword) => ({ keyword }),
  });
}
