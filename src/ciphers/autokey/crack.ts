import { decrypt } from './decrypt.ts';
import { getScorer, normalize, scoreMonograms } from '../../utils/cryptanalysis.ts';

/**
 * Cracks the Autokey cipher.
 * 
 * Uses a two-stage approach:
 * 1. Initial guess using independent column frequency analysis (monograms).
 * 2. Hill-climbing refinement of the primer using n-gram scoring on the full message.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxPrimerLength - Maximum primer length to test (default 15)
 * @returns {Object} The recovered key (primer) and decrypted plaintext
 */
export function crack(ciphertext: string, maxPrimerLength: number = 15) {
  const normalized = normalize(ciphertext);
  // Use adaptive scorer
  const scorer = getScorer(Math.max(1, Math.min(4, normalized.length)));
  
  let bestPrimer = 'A';
  let bestOverallScore = -Infinity;

  // We'll test all primer lengths up to maxPrimerLength.
  for (let plen = 1; plen <= maxPrimerLength; plen++) {
    let currentPrimer = '';
    
    // 1. Initial guess using independent column frequency analysis (monograms)
    for (let i = 0; i < plen; i++) {
      let bestChar = 'A';
      let bestChainScore = -Infinity;
      
      for (let shift = 0; shift < 26; shift++) {
        let chainDecrypted = '';
        let currentK = shift;
        for (let j = i; j < normalized.length; j += plen) {
          const charCode = normalized.charCodeAt(j) - 65;
          const p = (charCode - currentK + 26) % 26;
          chainDecrypted += String.fromCharCode(p + 65);
          currentK = p;
        }
        
        const score = scoreMonograms(chainDecrypted);
        if (score > bestChainScore) {
          bestChainScore = score;
          bestChar = String.fromCharCode(shift + 65);
        }
      }
      currentPrimer += bestChar;
    }

    // 2. Hill-climbing refinement of the primer using Quadgram scoring on the full message
    let improved = true;
    let currentScore = scorer.score(decrypt({ primer: currentPrimer })(ciphertext));
    
    while (improved) {
      improved = false;
      for (let i = 0; i < plen; i++) {
        const originalChar = currentPrimer[i];
        for (let shift = 0; shift < 26; shift++) {
          const char = String.fromCharCode(shift + 65);
          if (char === originalChar) continue;
          
          const nextPrimer = currentPrimer.substring(0, i) + char + currentPrimer.substring(i + 1);
          const nextPlain = decrypt({ primer: nextPrimer })(ciphertext);
          const nextScore = scorer.score(nextPlain);
          
          if (nextScore > currentScore) {
            currentScore = nextScore;
            currentPrimer = nextPrimer;
            improved = true;
          }
        }
      }
    }
    
    if (currentScore > bestOverallScore) {
      bestOverallScore = currentScore;
      bestPrimer = currentPrimer;
    }
  }

  const finalPlaintext = decrypt({ primer: bestPrimer })(ciphertext);
  return {
    key: { primer: bestPrimer },
    plaintext: finalPlaintext,
  };
}
