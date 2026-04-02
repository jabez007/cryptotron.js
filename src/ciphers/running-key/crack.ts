import { decrypt } from './index.ts';
import { getQuadgramScorer, normalize } from '../../utils/cryptanalysis.ts';

/**
 * Cracks the Running Key cipher.
 * Note: This is an extremely difficult cipher to crack without the key text.
 * This implementation tries to assume the key is a repeating keyword as a first attempt.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxKeyLength - Maximum key length to test (default 20)
 * @returns {Object} The best keyText (as a repeating keyword) and decrypted text
 */
export function crack(ciphertext: string, maxKeyLength: number = 20) {
  const scorer = getQuadgramScorer();
  const normalized = normalize(ciphertext);
  
  let bestKeyText = 'AA';
  let bestOverallScore = -Infinity;

  // We'll treat it like a Vigenere cipher first, as many "running keys" start with a repeating pattern or common words.
  for (let klen = 1; klen <= maxKeyLength; klen++) {
    let keyword = '';
    for (let i = 0; i < klen; i++) {
      let bestShift = 0;
      let bestCharScore = -Infinity;
      
      let column = '';
      for (let j = i; j < normalized.length; j += klen) {
        column += normalized[j];
      }
      
      for (let shift = 0; shift < 26; shift++) {
        let decryptedColumn = '';
        for (let c = 0; c < column.length; c++) {
          const charCode = column.charCodeAt(c) - 65;
          decryptedColumn += String.fromCharCode(((charCode - shift + 26) % 26) + 65);
        }
        
        const score = scoreMonograms(decryptedColumn);
        if (score > bestCharScore) {
          bestCharScore = score;
          bestShift = shift;
        }
      }
      keyword += String.fromCharCode(bestShift + 65);
    }

    // Build keyText from repeating keyword
    let keyText = '';
    while (keyText.length < ciphertext.length) {
      keyText += keyword;
    }
    keyText = keyText.substring(0, ciphertext.length);

    const plaintext = decrypt({ keyText })(ciphertext);
    const score = scorer.score(plaintext);
    
    if (score > bestOverallScore) {
      bestOverallScore = score;
      bestKeyText = keyText;
    }
  }

  return {
    key: { keyText: bestKeyText },
    plaintext: decrypt({ keyText: bestKeyText })(ciphertext),
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
