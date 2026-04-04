import { getScorer, normalize, scoreMonograms } from './cryptanalysis.ts';

/**
 * Options for the base Vigenere-style cracker.
 */
export interface BaseCrackOptions<K = any> {
  /** The ciphertext to crack */
  ciphertext: string;
  /** Maximum key length to test (default 20) */
  maxKeyLength?: number;
  /** Minimum key length to test (default 1) */
  minKeyLength?: number;
  /** Initial keyword to start with (default 'A') */
  initialBestKeyword?: string;
  /** Function to decrypt a single character in a column given a shift and charCode */
  decryptColumnChar: (shift: number, charCode: number) => number;
  /** Function to perform full decryption given a key object */
  decryptFull: (key: K) => (text: string) => string;
  /** Factory function to create a key object from a keyword string */
  keyFactory: (keyword: string) => K;
}

/**
 * Reusable base cracker for Vigenere-style ciphers.
 * 
 * Uses n-gram frequency analysis to estimate the most likely key length
 * and keyword for a given ciphertext.
 * 
 * @param {BaseCrackOptions} options - The cracking options
 * @returns {Object} The recovered key and decrypted plaintext
 */
export function baseCrack<K = any>(options: BaseCrackOptions<K>) {
  const {
    ciphertext,
    maxKeyLength = 20,
    minKeyLength = 1,
    initialBestKeyword = 'A',
    decryptColumnChar,
    decryptFull,
    keyFactory,
  } = options;

  // Validate bounds early with strict checks for finite integers
  if (!Number.isInteger(minKeyLength) || !Number.isInteger(maxKeyLength) || 
      minKeyLength < 1 || maxKeyLength < 1 || minKeyLength > maxKeyLength) {
    throw new Error(`Invalid key length bounds: min=${minKeyLength}, max=${maxKeyLength}. Both must be integers >= 1 and min <= max.`);
  }

  const normalized = normalize(ciphertext);
  // Conditional fallback for short ciphertexts
  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  let bestKeyword = initialBestKeyword;
  let bestOverallScore = -Infinity;

  for (let klen = minKeyLength; klen <= maxKeyLength; klen++) {
    const topShifts: number[][] = [];
    
    for (let i = 0; i < klen; i++) {
      const shiftsWithScores: { shift: number; score: number }[] = [];
      
      let column = '';
      for (let j = i; j < normalized.length; j += klen) {
        column += normalized[j];
      }
      
      // Fix for empty column alignment issue
      if (column.length === 0) {
        topShifts.push([0, 0]); // Push safe fallback
        continue;
      }

      for (let shift = 0; shift < 26; shift++) {
        let decryptedColumn = '';
        for (let c = 0; c < column.length; c++) {
          const charCode = column.charCodeAt(c) - 65;
          const decryptedChar = decryptColumnChar(shift, charCode);
          decryptedColumn += String.fromCharCode(decryptedChar + 65);
        }
        
        shiftsWithScores.push({ shift, score: scoreMonograms(decryptedColumn) });
      }
      
      shiftsWithScores.sort((a, b) => b.score - a.score);
      topShifts.push([shiftsWithScores[0].shift, shiftsWithScores[1].shift]);
    }

    // Test combinations of the top 2 shifts
    if (klen <= 12) {
      const combinations = 1 << klen;
      for (let c = 0; c < combinations; c++) {
        let keyword = '';
        for (let i = 0; i < klen; i++) {
          const bit = (c >> i) & 1;
          keyword += String.fromCharCode(topShifts[i][bit] + 65);
        }
        
        const plaintext = decryptFull(keyFactory(keyword))(ciphertext);
        // Use normalized plaintext for scoring to be consistent
        const score = scorer.score(plaintext);
        
        if (score > bestOverallScore) {
          bestOverallScore = score;
          bestKeyword = keyword;
        }
      }
    } else {
      let keyword = '';
      for (let i = 0; i < klen; i++) {
        keyword += String.fromCharCode(topShifts[i][0] + 65);
      }
      const plaintext = decryptFull(keyFactory(keyword))(ciphertext);
      const score = scorer.score(plaintext);
      
      if (score > bestOverallScore) {
        bestOverallScore = score;
        bestKeyword = keyword;
      }
    }
  }

  const finalKey = keyFactory(bestKeyword);
  const finalPlaintext = decryptFull(finalKey)(ciphertext);
  return {
    key: finalKey,
    plaintext: finalPlaintext,
  };
}
