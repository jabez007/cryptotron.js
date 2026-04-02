import { decrypt } from './decrypt.ts';
import { getQuadgramScorer, normalize } from '../../utils/cryptanalysis.ts';

/**
 * Cracks the Vigenère cipher.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxKeyLength - Maximum key length to test (default 20)
 * @returns {Object} The best keyword and decrypted text
 */
export function crack(ciphertext: string, maxKeyLength: number = 20) {
  const scorer = getQuadgramScorer();
  const normalized = normalize(ciphertext);
  
  let bestKeyword = 'A';
  let bestOverallScore = -Infinity;

  for (let klen = 1; klen <= maxKeyLength; klen++) {
    // For each position in the key, find the top 2 Caesar shifts
    const topShifts: number[][] = [];
    
    for (let i = 0; i < klen; i++) {
      const shiftsWithScores: { shift: number; score: number }[] = [];
      
      let column = '';
      for (let j = i; j < normalized.length; j += klen) {
        column += normalized[j];
      }
      
      if (column.length === 0) continue;

      for (let shift = 0; shift < 26; shift++) {
        let decryptedColumn = '';
        for (let c = 0; c < column.length; c++) {
          const charCode = column.charCodeAt(c) - 65;
          decryptedColumn += String.fromCharCode(((charCode - shift + 26) % 26) + 65);
        }
        
        shiftsWithScores.push({ shift, score: scoreMonograms(decryptedColumn) });
      }
      
      // Sort and pick top 2
      shiftsWithScores.sort((a, b) => b.score - a.score);
      topShifts.push([shiftsWithScores[0].shift, shiftsWithScores[1].shift]);
    }

    // Now test combinations of the top 2 shifts (2^klen)
    // For large klen, this is too slow, so we cap it.
    if (klen <= 12) {
      const combinations = 1 << klen;
      for (let c = 0; c < combinations; c++) {
        let keyword = '';
        for (let i = 0; i < klen; i++) {
          const bit = (c >> i) & 1;
          keyword += String.fromCharCode(topShifts[i][bit] + 65);
        }
        
        const plaintext = decrypt({ keyword })(ciphertext);
        const score = scorer.score(plaintext);
        
        if (score > bestOverallScore) {
          bestOverallScore = score;
          bestKeyword = keyword;
        }
      }
    } else {
      // Just use the best shift for each column if klen is large
      let keyword = '';
      for (let i = 0; i < klen; i++) {
        keyword += String.fromCharCode(topShifts[i][0] + 65);
      }
      const plaintext = decrypt({ keyword })(ciphertext);
      const score = scorer.score(plaintext);
      
      if (score > bestOverallScore) {
        bestOverallScore = score;
        bestKeyword = keyword;
      }
    }
  }

  const finalPlaintext = decrypt({ keyword: bestKeyword })(ciphertext);
  return {
    key: { keyword: bestKeyword },
    plaintext: finalPlaintext,
  };
}

const MONOGRAMS: Record<string, number> = {
  'A': 0.08167, 'B': 0.01492, 'C': 0.02782, 'D': 0.04253, 'E': 0.12702, 'F': 0.02228, 'G': 0.02015,
  'H': 0.06094, 'I': 0.06966, 'J': 0.00153, 'K': 0.00772, 'L': 0.04025, 'M': 0.02406, 'N': 0.06749,
  'O': 0.07507, 'P': 0.01929, 'Q': 0.00095, 'R': 0.05987, 'S': 0.06327, 'T': 0.09056, 'U': 0.02758,
  'V': 0.00978, 'W': 0.02360, 'X': 0.00150, 'Y': 0.01974, 'Z': 0.00074
};

function scoreMonograms(text: string): number {
  let score = 0;
  for (let i = 0; i < text.length; i++) {
    score += Math.log10(MONOGRAMS[text[i]] || 0.0001);
  }
  return score;
}
