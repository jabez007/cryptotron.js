import { decrypt } from './index.ts';
import { getQuadgramScorer, normalize } from '../../utils/cryptanalysis.ts';

/**
 * Cracks the Autokey cipher.
 * 
 * @param {string} ciphertext - The text to crack
 * @param {number} maxPrimerLength - Maximum primer length to test (default 15)
 * @returns {Object} The best primer and decrypted text
 */
export function crack(ciphertext: string, maxPrimerLength: number = 15) {
  const scorer = getQuadgramScorer();
  const normalized = normalize(ciphertext);
  
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
