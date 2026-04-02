import { getScorer, normalize, scoreMonograms } from './cryptanalysis.ts';

export interface BaseCrackOptions {
  ciphertext: string;
  maxKeyLength?: number;
  minKeyLength?: number;
  initialBestKeyword?: string;
  decryptColumnChar: (shift: number, charCode: number) => number;
  decryptFull: (key: any) => (text: string) => string;
  keyFactory: (keyword: string) => any;
  periodic?: boolean;
}

/**
 * Reusable base cracker for Vigenere-style ciphers.
 */
export function baseCrack(options: BaseCrackOptions) {
  const {
    ciphertext,
    maxKeyLength = 20,
    minKeyLength = 1,
    initialBestKeyword = 'A',
    decryptColumnChar,
    decryptFull,
    keyFactory,
    periodic = true,
  } = options;

  // Validate bounds early
  if (minKeyLength < 1 || maxKeyLength < 1 || minKeyLength > maxKeyLength) {
    throw new Error(`Invalid key length bounds: min=${minKeyLength}, max=${maxKeyLength}`);
  }

  const normalized = normalize(ciphertext);
  // Conditional fallback for short ciphertexts
  const scorer = getScorer(Math.min(4, normalized.length));
  
  let bestKeyword = initialBestKeyword;
  let bestOverallScore = -Infinity;

  for (let klen = minKeyLength; klen <= maxKeyLength; klen++) {
    const topShifts: number[][] = [];
    
    for (let i = 0; i < klen; i++) {
      const shiftsWithScores: { shift: number; score: number }[] = [];
      
      let column = '';
      if (periodic) {
        for (let j = i; j < normalized.length; j += klen) {
          column += normalized[j];
        }
      } else {
        // Build contiguous slices for non-periodic (e.g. Running Key)
        const sliceLen = Math.floor(normalized.length / klen);
        const start = i * sliceLen;
        const end = (i === klen - 1) ? normalized.length : (i + 1) * sliceLen;
        column = normalized.substring(start, end);
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
