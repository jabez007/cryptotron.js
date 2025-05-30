import { buildCipherSquare, transform } from '@utils';

/**
 * Encrypts text using the Polybius Square cipher - an ancient Greek cipher that turns letters into numbers.
 *
 * How it works (simple version):
 * 1. Create a 5x5 grid filled with letters (I and J share a space)
 * 2. The grid is scrambled using a secret keyword
 * 3. For each letter:
 *    - Find its row and column in the grid
 *    - Replace it with two cipher characters (like numbers or symbols)
 *    - Example: 'A' might become "23" if it's in row 2, column 3
 * 4. Letters not in the grid (like numbers) stay the same
 *
 * @param {Object} key - The encryption key
 * @param {string} key.keyword - Secret word to scramble the letter grid
 * @param {string} key.cipherChars - Exactly 5 characters used to represent rows/columns (e.g., "12345")
 * @returns {Function} A function that takes text and returns encrypted pairs
 * @throws {Error} If cipherChars doesn't have exactly 5 characters
 * @example
 * // Spy message using symbols as codes:
 * const encryptMessage = encrypt({ keyword: "SECRET", cipherChars: "!@#$%" });
 * encryptMessage("HELLO"); // Might return "@!$#$@%$"
 */
export function encrypt(key: { keyword: string; cipherChars: string }) {
  if (key.cipherChars.length !== 5) {
    throw new Error(
      `There must be exactly 5 cipher character. Received '${key.cipherChars}' for cipher characters`,
    );
  }

  const keySquare = buildCipherSquare(key.keyword);

  return (plainText: string) => {
    const plaintext = plainText.toLowerCase().replace(/[j]/g, 'i');

    return transform((char) => {
      const row = keySquare.findIndex((r) => r.includes(char));
      const column = keySquare[row].findIndex((c) => c === char);
      return `${key.cipherChars.charAt(row)}${key.cipherChars.charAt(column)}`;
    })(plaintext);
  };
}
