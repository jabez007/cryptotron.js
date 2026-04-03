import { getCharOffset, modulo, transform } from '@utils';

/**
 * Creates a transformation function that can encrypt or decrypt text
 * using the Beaufort cipher algorithm.
 */
export function algorithm(keyword: string) {
  const cleanedKeyword = keyword.replace(/[^A-Za-z]/g, '');
  if (cleanedKeyword.length === 0) {
    throw new Error(
      `Usable part of keyword must have length greater than 0. Usable part of given keyword was '${cleanedKeyword}'`,
    );
  }

  let j = 0;

  return transform((char, index, text) => {
    if (index === 0) {
      j = 0; // make sure j starts fresh
    }

    const _j = j % cleanedKeyword.length;

    const offset = getCharOffset(char);
    const keyOffset = getCharOffset(
      cleanedKeyword.charAt(_j),
    );

    const result = String.fromCharCode(
      modulo(
        (cleanedKeyword.charCodeAt(_j) - keyOffset) -
          (text.charCodeAt(index) - offset),
        26,
      ) + offset,
    );
    j += 1;

    return result;
  });
}

/**
 * Decrypts text using the Beaufort cipher.
 */
export function decrypt(key: { keyword: string }) {
  return algorithm(key.keyword);
}
