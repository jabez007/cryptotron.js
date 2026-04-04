import { decrypt } from './decrypt.ts';
import { getScorer, normalize, scoreMonograms } from '../../utils/cryptanalysis.ts';

/**
 * Repeats and truncates a keyword to match a specific alphabetic length.
 * 
 * @param {string} keyword - The keyword to expand
 * @param {number} alphabeticLength - The target length
 * @returns {string} The expanded key text
 */
function buildKeyText(keyword: string, alphabeticLength: number): string {
  const count = Math.ceil(alphabeticLength / keyword.length);
  return keyword.repeat(count).substring(0, alphabeticLength);
}

/**
 * Cracks the Running Key cipher.
 * 
 * NOTE: This implementation assumes the key is a repeating short keyword (treating it like a Vigenère cipher).
 * True running-key ciphers are extremely difficult to crack without the key text or very long ciphertexts.
 * 
 * Uses n-gram frequency analysis to estimate the most likely repeating keyword.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxKeyLength - Maximum keyword length to test for the repeating key assumption (default 20).
 * Values up to the length of the ciphertext will be honored.
 * @returns {Object} The recovered key (keyText) and decrypted plaintext
 */
export function crack(ciphertext: string, maxKeyLength: number = 20) {
  const normalized = normalize(ciphertext);
  
  // Sanitize and clamp maxKeyLength without hardcoded upper bound
  const maxKeyLengthSanitized = Number.isFinite(maxKeyLength) 
    ? Math.max(1, Math.floor(maxKeyLength)) 
    : 1;
  const effectiveMaxKeyLength = Math.min(maxKeyLengthSanitized, normalized.length);

  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  // Compute and store alphabetic character count once
  const alphabeticLength = ciphertext.replace(/[^A-Za-z]/g, '').length;

  let bestKeyword = 'A';
  let bestOverallScore = -Infinity;

  for (let klen = 1; klen <= effectiveMaxKeyLength; klen++) {
    const topShifts: number[][] = [];
    
    for (let i = 0; i < klen; i++) {
      const shiftsWithScores: { shift: number; score: number }[] = [];
      
      let column = '';
      for (let j = i; j < normalized.length; j += klen) {
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
          decryptedColumn += String.fromCharCode(((charCode - shift + 26) % 26) + 65);
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
      
      const keyText = buildKeyText(keyword, alphabeticLength);
      const plaintext = decrypt({ keyText })(ciphertext);
      const score = scorer.score(plaintext);
      
      if (score > bestOverallScore) {
        bestOverallScore = score;
        bestKeyword = keyword;
      }
    }
  }

  const finalKeyText = buildKeyText(bestKeyword, alphabeticLength);

  return {
    key: { keyText: finalKeyText },
    plaintext: decrypt({ keyText: finalKeyText })(ciphertext),
  };
}
