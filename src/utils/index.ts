import type { CipherTransformer } from '@types';

export * from './cryptanalysis.ts';
export * from './vigenere-base.ts';

export function getCharOffset(val: string): number {
  if (val.length !== 1) {
    throw new Error('Length of input value must be 1');
  }

  return (val.charAt(0) == val.charAt(0).toUpperCase()) ? 65 : 97;
}

export function modulo(n: number, m: number): number {
  if (!(Number.isInteger(n) && Number.isInteger(m))) {
    throw new Error('Both input values must be integers');
  }

  return ((n % m) + m) % m;
}

const re = /[A-Za-z]/;

export function transform(
  transformer: (
    inputChar: string,
    inputIndex: number,
    inputText: string,
  ) => string,
): CipherTransformer {
  return (inputText: string): string => {
    let outputText = '';
    for (let i = 0; i < inputText.length; i += 1) {
      const char = inputText.charAt(i);

      if (re.test(char)) {
        outputText += transformer(char, i, inputText);
      } else {
        outputText += char;
      }
    }
    return outputText;
  };
}

export function gcd(a: number, b: number): number {
  if (!(Number.isInteger(a) && Number.isInteger(b))) {
    throw new Error('Both input values must be integers');
  }

  // Convert to absolute values to handle negative inputs
  a = Math.abs(a);
  b = Math.abs(b);

  // Handle edge case when a is 0
  if (a === 0) {
    return b;
  }

  if (!b) {
    return a;
  }
  return gcd(b, a % b);
}

/**
 * Finds the modular multiplicative inverse of a modulo m.
 * 
 * @param {number} a - The number to find the inverse for.
 * @param {number} m - The modulus.
 * @returns {number} The modular inverse.
 * @throws {Error} If the inverse does not exist.
 */
export function modInverse(a: number, m: number): number {
  a = modulo(a, m);
  for (let x = 1; x < m; x++) {
    if (modulo(a * x, m) === 1) {
      return x;
    }
  }
  throw new Error(`Modular inverse of ${a} modulo ${m} does not exist`);
}

/**
 * Calculates the determinant of a square matrix.
 * 
 * @param {number[][]} matrix - The square matrix.
 * @returns {number} The determinant.
 */
export function determinant(matrix: number[][]): number {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  let det = 0;
  for (let j = 0; j < n; j++) {
    det += (j % 2 === 0 ? 1 : -1) * matrix[0][j] * determinant(
      matrix.slice(1).map(row => row.filter((_, colIdx) => colIdx !== j))
    );
  }
  return det;
}

export const alphaLower = [...Array(26)]
  .map((_, i) => String.fromCharCode(97 + i))
  .join('');

export function getUniqueCharacters(input: string): string {
  let unique = '';
  for (let i = 0; i < input.length; i += 1) {
    if (!unique.includes(input[i])) {
      unique += input[i];
    }
  }
  return unique;
}

/**
 * Builds a 5x5 cipher square from a keyword or a full 25-character grid.
 * 
 * @param {string} keyword - A secret word or a full 25-character alphabet (excluding 'j')
 * @returns {string[][]} A 5x5 grid of characters
 */
export function buildCipherSquare(keyword: string): string[][] {
  const normalizedKeyword = keyword.toLowerCase().replace(/j/g, 'i').replace(/[^a-z]/g, '');
  const key = getUniqueCharacters(`${normalizedKeyword}${alphaLower.replace(/j/g, '')}`);

  if (key.length !== 25) {
    throw new Error(`Could not build a valid 5x5 cipher square from keyword: "${keyword}". Expected 25 unique symbols.`);
  }

  const cipherSquare = new Array(5)
    .fill(null)
    .map(() => new Array(5).fill(null));
  for (let i = 0; i < 25; i += 1) {
    const char = key.charAt(i);
    const column = i % 5;
    const row = Math.floor(i / 5);
    cipherSquare[row][column] = char;
  }
  return cipherSquare;
}

/*
const alphaUpper = [...Array(26)]
  .map((_, i) => String.fromCharCode(65 + i))
  .join('');
*/
