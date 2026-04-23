/**
 * @module HillCrack
 * 
 * Note on Hill Cipher Cracking:
 * 
 * Automated cryptanalysis (cracking) of the Hill cipher is currently not implemented
 * due to several significant technical hurdles:
 * 
 * 1. Computational Complexity: The search space for an n x n matrix is 26^(n^2). 
 *    While a 2x2 matrix (456,976 possibilities) is brute-forcible, a 3x3 matrix 
 *    (approx. 5.4 trillion possibilities) is computationally expensive for 
 *    a browser or standard Node.js environment.
 * 
 * 2. Known Plaintext Requirement: The Hill cipher is most effectively broken 
 *    using a Known Plaintext Attack (KPA). By solving the linear system P * K = C (mod 26), 
 *    one can recover the key. Ciphertext-only attacks require significantly more 
 *    advanced statistical models.
 * 
 * 3. Jagged Fitness Landscape: In hill-climbing algorithms (like those used for 
 *    Playfair or Substitution), a small change to the key typically results in 
 *    a small change in the output score. In Hill ciphers, changing a single 
 *    matrix element can drastically alter the entire decryption, making it 
 *    difficult for optimization algorithms to converge on the correct key.
 * 
 * This module remains as a placeholder for these reasons.
 */
export const crack = (): never => {
  throw new Error('Automated cracking for the Hill cipher is not currently supported due to search space complexity.');
};
