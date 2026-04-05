import { decrypt } from './decrypt.ts';
import { getScorer, normalize, scoreMonograms, Scorer } from '../../utils/cryptanalysis.ts';

/**
 * Repeats and truncates a keyword to match a specific alphabetic length.
 * 
 * @param {string} keyword - The keyword to expand
 * @param {number} alphabeticLength - The target length
 * @returns {string} The expanded key text
 * @throws {Error} If keyword is empty
 * @throws {TypeError|RangeError} If alphabeticLength is invalid
 */
function buildKeyText(keyword: string, alphabeticLength: number): string {
  if (!Number.isInteger(alphabeticLength) || alphabeticLength < 0) {
    throw new RangeError(`Invalid alphabeticLength: ${alphabeticLength}. Must be a non-negative integer.`);
  }
  if (keyword.length === 0) {
    if (alphabeticLength === 0) return '';
    throw new Error('Keyword must be non-empty to expand to a non-zero length.');
  }
  const count = Math.ceil(alphabeticLength / keyword.length);
  return keyword.repeat(count).substring(0, alphabeticLength);
}

/**
 * Attempts to crack the Running Key cipher by assuming a repeating keyword.
 * 
 * NOTE: This is a Vigenère-style (periodic) fallback attack. True running-key 
 * (non-periodic) ciphers are extremely difficult to crack without the original 
 * key text or very long ciphertexts. This function explicitly returns a 
 * 'repeating-key' result.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxKeyLength - Maximum keyword length to test for the repeating key assumption (default 20).
 * Values up to the length of the ciphertext will be honored.
 * @returns {Object} The recovered key (with type 'repeating-key') and decrypted plaintext
 */
export function crack(ciphertext: string, maxKeyLength: number = 20) {
  const normalized = normalize(ciphertext);
  
  // Early return for empty input
  if (normalized.length === 0) {
    return {
      key: { keyText: '', keyword: '', type: 'repeating-key' },
      plaintext: ciphertext,
    };
  }

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
  let bestPlaintext = '';
  let bestKeyText = '';

  const evaluateCandidate = (keyword: string) => {
    const keyText = buildKeyText(keyword, alphabeticLength);
    const plaintext = decrypt({ keyText })(ciphertext);
    const score = scorer.score(plaintext);
    
    if (score > bestOverallScore) {
      bestOverallScore = score;
      bestKeyword = keyword;
      bestPlaintext = plaintext;
      bestKeyText = keyText;
    }
  };

  for (let klen = 1; klen <= effectiveMaxKeyLength; klen++) {
    const topShifts: number[][] = [];
    
    for (let i = 0; i < klen; i++) {
      const shiftsWithScores: { shift: number; score: number }[] = [];
      
      let column = '';
      for (let j = i; j < normalized.length; j += klen) {
        column += normalized[j];
      }
      
      // column.length is guaranteed to be >= 1 since klen <= normalized.length and i < klen

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
        evaluateCandidate(keyword);
      }
    } else {
      let keyword = '';
      for (let i = 0; i < klen; i++) {
        keyword += String.fromCharCode(topShifts[i][0] + 65);
      }
      evaluateCandidate(keyword);
    }
  }

  // Fallback for case where no improvement was found (should not happen with valid input)
  if (bestPlaintext === '') {
    bestKeyText = buildKeyText(bestKeyword, alphabeticLength);
    bestPlaintext = decrypt({ keyText: bestKeyText })(ciphertext);
  }

  return {
    key: { 
      keyText: bestKeyText, 
      keyword: bestKeyword,
      type: 'repeating-key' 
    },
    plaintext: bestPlaintext,
  };
}
