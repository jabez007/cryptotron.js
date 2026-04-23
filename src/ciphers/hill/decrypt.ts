import { determinant, gcd, modInverse, modulo } from '@utils';
import { keywordToMatrix } from './encrypt.ts';
import type { CipherTransformer } from '@types';

/**
 * Calculates the adjugate of a square matrix.
 *
 * @param {number[][]} matrix - The square matrix.
 * @returns {number[][]} The adjugate matrix.
 */
function adjugate(matrix: number[][]): number[][] {
  const n = matrix.length;
  const adj = new Array(n).fill(null).map(() => new Array(n).fill(0));
  if (n === 1) {
    adj[0][0] = 1;
    return adj;
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minorMatrix = matrix
        .filter((_, rowIdx) => rowIdx !== i)
        .map((row) => row.filter((_, colIdx) => colIdx !== j));
      // Transpose cofactor matrix to get adjugate
      adj[j][i] = ((i + j) % 2 === 0 ? 1 : -1) * determinant(minorMatrix);
    }
  }
  return adj;
}

/**
 * Calculates the inverse of a matrix modulo m.
 *
 * @param {number[][]} matrix - The square matrix.
 * @param {number} m - The modulus.
 * @returns {number[][]} The inverse matrix modulo m.
 */
function matrixInverse(matrix: number[][], m: number): number[][] {
  const det = modulo(determinant(matrix), m);
  const invDet = modInverse(det, m);
  const adj = adjugate(matrix);
  const n = matrix.length;
  const inv = new Array(n).fill(null).map(() => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      inv[i][j] = modulo(adj[i][j] * invDet, m);
    }
  }
  return inv;
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
 * Decrypts a message using the Hill cipher.
 *
 * The Hill cipher is decrypted by multiplying each block of n letters
 * by the inverse of the key matrix modulo 26.
 *
 * @param {Object} key - The decryption key.
 * @param {string} [key.keyword] - A keyword whose length is a perfect square.
 * @param {number[][]} [key.matrix] - An n x n invertible matrix modulo 26.
 * @returns {CipherTransformer} A function that transforms a ciphertext message into its decrypted form.
 * @throws {Error} If neither keyword nor matrix is provided, if the matrix is not square,
 *                 or if the matrix is not invertible modulo 26.
 */
export function decrypt(key: { keyword?: string; matrix?: number[][] }): CipherTransformer {
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

  const invMatrix = matrixInverse(matrix, 26);

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

    // Hill decryption expects blocks of size n.
    // If the ciphertext was padded during encryption, it should already be a multiple of n.
    // However, if we're decrypting something that wasn't padded but should have been,
    // we might need to handle it or throw an error.
    // For now, we'll pad with X just to be safe, though a proper Hill ciphertext should be a multiple of n.
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

    let extraChars = '';

    for (let i = 0; i < letters.length; i += n) {
      const vector = letters.slice(i, i + n).map((l) => l.char.charCodeAt(0) - 65);
      const decryptedVector = multiply(invMatrix, vector);

      for (let j = 0; j < n; j++) {
        const l = letters[i + j];
        const charCode = decryptedVector[j] + (l.isUpper ? 65 : 97);
        const decryptedChar = String.fromCharCode(charCode);

        if (l.index !== -1) {
          resultChars[l.index] = decryptedChar;
        } else {
          extraChars += decryptedChar;
        }
      }
    }

    return resultChars.join('') + extraChars;
  };
}
