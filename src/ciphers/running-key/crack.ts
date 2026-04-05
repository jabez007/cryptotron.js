import { decrypt } from './decrypt.ts';
import { getScorer, normalize, scoreMonograms } from '@utils';
import type { CrackResult } from '@types';

/**
 * Builds a repeating key string of the given length from a keyword.
 * 
 * @param {string} keyword - The keyword to repeat
 * @param {number} alphabeticLength - The number of characters to fill
 * @returns {string} The expanded key text
 */
function buildKeyText(keyword: string, alphabeticLength: number): string {
  if (keyword.length === 0) return '';
  const repeatCount = Math.ceil(alphabeticLength / keyword.length);
  return keyword.repeat(repeatCount).slice(0, alphabeticLength);
}

/**
 * Cracks the Running Key cipher by treating it as a repeating-key Vigenère cipher.
 * 
 * In real-world scenarios, the 'Running Key' is usually non-repeating.
 * This automated crack function works specifically for cases where the
 * key is a repeating word, effectively falling back to a Vigenère crack.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxKeyLength - Maximum keyword length to test (default 20)
 * @returns {CrackResult<{ keyText: string; type: string }>} The recovered key and decrypted plaintext
 */
export function crack(ciphertext: string, maxKeyLength: number = 20): CrackResult<{ keyText: string; type: string }> {
  const normalized = normalize(ciphertext);
  
  // Guard against empty normalized ciphertext
  if (normalized.length === 0) {
    return {
      key: { keyText: 'A', type: 'repeating-key' },
      plaintext: ciphertext,
    };
  }

  // Pre-calculate count to avoid redundant calls in the hot loop
  const alphabeticLength = normalized.length;
  const effectiveMaxKeyLength = Math.min(maxKeyLength, alphabeticLength);

  const scorer = getScorer(Math.max(1, Math.min(4, alphabeticLength)));
  
  let bestKeyword = 'A';
  let bestScore = -Infinity;

  for (let klen = 1; klen <= effectiveMaxKeyLength; klen++) {
    const topShifts: number[][] = [];
    
    for (let i = 0; i < klen; i++) {
      const shiftsWithScores: { shift: number; score: number }[] = [];
      
      let column = '';
      for (let j = i; j < alphabeticLength; j += klen) {
        column += normalized[j];
      }
      
      if (column.length === 0) {
        topShifts.push([0, 0]);
        continue;
      }

      for (let shift = 0; shift < 26; shift++) {
        let decryptedColumn = '';
        for (let c = 0; c < column.length; c++) {
          const charCode = column.charCodeAt(c) - 65;
          const decryptedChar = (charCode - shift + 26) % 26;
          decryptedColumn += String.fromCharCode(decryptedChar + 65);
        }
        
        shiftsWithScores.push({ shift, score: scoreMonograms(decryptedColumn) });
      }
      
      shiftsWithScores.sort((a, b) => b.score - a.score);
      topShifts.push([shiftsWithScores[0].shift, shiftsWithScores[1].shift]);
    }

    if (klen <= 12) {
      const combinations = 1 << klen;
      for (let c = 0; c < combinations; c++) {
        let keyword = '';
        for (let i = 0; i < klen; i++) {
          const bit = (c >> i) & 1;
          keyword += String.fromCharCode(topShifts[i][bit] + 65);
        }
        
        const keyText = buildKeyText(keyword, alphabeticLength);
        const plaintext = decrypt({ keyText })(ciphertext);
        const score = scorer.score(plaintext);
        
        if (score > bestScore) {
          bestScore = score;
          bestKeyword = keyword;
        }
      }
    } else {
      let keyword = '';
      for (let i = 0; i < klen; i++) {
        keyword += String.fromCharCode(topShifts[i][0] + 65);
      }
      const keyText = buildKeyText(keyword, alphabeticLength);
      const plaintext = decrypt({ keyText })(ciphertext);
      const score = scorer.score(plaintext);
      
      if (score > bestScore) {
        bestScore = score;
        bestKeyword = keyword;
      }
    }
  }

  const finalKeyText = buildKeyText(bestKeyword, alphabeticLength);
  return {
    key: { keyText: finalKeyText, type: 'repeating-key' },
    plaintext: decrypt({ keyText: finalKeyText })(ciphertext),
  };
}
