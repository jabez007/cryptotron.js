import { buildCipherSquare } from '@utils';

/**
 * Decrypts text using the Polybius Square cipher - turns code pairs back into letters.
 *
 * How it works (simple version):
 * 1. Create a 5x5 grid filled with letters (I and J share a space)
 * 2. The grid is scrambled using a secret keyword
 * 3. For each pair of cipher characters:
 *    - First character = row in the grid
 *    - Second character = column in the grid
 *    - Example: "23" becomes whatever letter is at row 2, column 3
 * 4. Characters not in cipherChars stay the same
 *
 * @param {Object} key - The decryption key (must match encryption key)
 * @param {string} key.keyword - Same secret word used to encrypt
 * @param {string} key.cipherChars - Same 5 characters used during encryption
 * @returns {Function} A function that takes encrypted pairs and returns original text
 * @throws {Error} If cipherChars doesn't have exactly 5 characters
 * @example
 * // Decoding a spy message:
 * const decryptMessage = decrypt({ keyword: "SECRET", cipherChars: "!@#$%" });
 * decryptMessage("@!$#$@%$"); // Returns "hello" (remember J becomes I)
 */
export function decrypt(key: { keyword: string; cipherChars: string }) {
  if (key.cipherChars.length !== 5) {
    throw new Error(
      `There must be exactly 5 cipher character. Received '${key.cipherChars}' for cipher characters`,
    );
  }

  const keySquare = buildCipherSquare(key.keyword);

  return (cipherText: string) => {
    let plaintext = '';
    let i = 0;
    while (i < cipherText.length) {
      if (
        key.cipherChars.indexOf(String(cipherText.charAt(i))) !== -1
      ) {
        const row = key.cipherChars.indexOf(
          String(cipherText.charAt(i)),
        );
        i += 1;
        const column = key.cipherChars.indexOf(
          String(cipherText.charAt(i)),
        );
        plaintext += keySquare[row][column];
      } else {
        plaintext += cipherText.charAt(i);
      }
      i += 1;
    }
    return plaintext;
  };
}
