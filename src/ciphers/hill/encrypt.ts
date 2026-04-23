import { determinant, gcd, modulo } from '@utils';
import type { CipherTransformer } from '@types';

/**
 * Converts a keyword into a square matrix for the Hill cipher.
 *
 * @param {string} keyword - The keyword to convert.
 * @returns {number[][]} The square matrix.
 * @throws {Error} If the keyword length is not a perfect square.
 */
export function keywordToMatrix(keyword: string): number[][] {
  const letters = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  const n = Math.sqrt(letters.length);
  if (!Number.isInteger(n) || n === 0) {
    throw new Error('Keyword length must be a non-zero perfect square (e.g., 4, 9, 16)');
  }
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      matrix[i][j] = letters.charCodeAt(i * n + j) - 65;
    }
  }
  return matrix;
}

/**
 * Multiplies a matrix by a vector modulo 26.
 *
 * @param {number[][]} matrix - The square matrix.
 * @param {number[]} vector - The vector to multiply.
 * @returns {number[]} The resulting vector.
 */
function multiply(matrix: number[][], vector: number[]): number[] {
  const n = matrix.length;
  const result = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i] += matrix[i][j] * vector[j];
    }
    result[i] = modulo(result[i], 26);
  }
  return result;
}

/**
 * Encrypts a message using the Hill cipher.
 *
 * The Hill cipher is a polygraphic substitution cipher based on linear algebra.
 * Each block of n letters is multiplied by an n x n invertible matrix modulo 26.
 *
 * @param {Object} key - The encryption key.
 * @param {string} [key.keyword] - A keyword whose length is a perfect square.
 * @param {number[][]} [key.matrix] - An n x n invertible matrix modulo 26.
 * @returns {CipherTransformer} A function that transforms a plaintext message into its encrypted form.
 * @throws {Error} If neither keyword nor matrix is provided, if the matrix is not square,
 *                 or if the matrix is not invertible modulo 26.
 */
export function encrypt(key: { keyword?: string; matrix?: number[][] }): CipherTransformer {
  let matrix: number[][];
  if (key.matrix) {
    matrix = key.matrix;
  } else if (key.keyword) {
    matrix = keywordToMatrix(key.keyword);
  } else {
    throw new Error('Either keyword or matrix must be provided');
  }

  const n = matrix.length;
  if (n === 0) throw new Error('Matrix cannot be empty');
  for (const row of matrix) {
    if (row.length !== n) throw new Error('Matrix must be square');
  }

  const det = modulo(determinant(matrix), 26);
  if (gcd(det, 26) !== 1) {
    throw new Error('Matrix is not invertible modulo 26');
  }

  return (text: string): string => {
    const letters: { char: string; index: number; isUpper: boolean }[] = [];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (/[A-Za-z]/.test(char)) {
        letters.push({
          char: char.toUpperCase(),
          index: i,
          isUpper: char === char.toUpperCase(),
        });
      }
    }

    // Pad with X if necessary
    while (letters.length % n !== 0) {
      letters.push({
        char: 'X',
        index: -1,
        isUpper: true,
      });
    }

    const resultChars = new Array(text.length);
    for (let i = 0; i < text.length; i++) {
      if (!/[A-Za-z]/.test(text[i])) {
        resultChars[i] = text[i];
      }
    }

    let paddedResult = '';

    for (let i = 0; i < letters.length; i += n) {
      const vector = letters.slice(i, i + n).map((l) => l.char.charCodeAt(0) - 65);
      const encryptedVector = multiply(matrix, vector);

      for (let j = 0; j < n; j++) {
        const l = letters[i + j];
        const charCode = encryptedVector[j] + (l.isUpper ? 65 : 97);
        const encryptedChar = String.fromCharCode(charCode);

        if (l.index !== -1) {
          resultChars[l.index] = encryptedChar;
        } else {
          paddedResult += encryptedChar;
        }
      }
    }

    return resultChars.join('') + paddedResult;
  };
}
